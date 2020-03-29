import {Injectable, PipeTransform} from '@angular/core';
import {User} from '../models/User';
import {SortDirection} from '../sortable-header/sortable-header.directive';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, map, switchMap, tap} from 'rxjs/operators';
import {UserService} from './user.service';
import {CoreResponse} from '../models/CoreResponse';
import {DiscordService} from './discord.service';

interface SearchResult {
  users: User[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(users: User[], column: string, direction: string): User[] {
  if (direction === '') {
    return users;
  } else {
    return [...users].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(user: User, term: string, pipe: PipeTransform) {
  term = term.toLowerCase();
  return user.cid.toLowerCase().includes(term)
    || user.name.toLowerCase().includes(term)
    || (user.username && user.username.toLowerCase().includes(term))
    || user.banned.toLowerCase().includes(term);
}

@Injectable({
  providedIn: 'root'
})
export class DiscordMembersListService {

  constructor(private userService: UserService, private pipe: DecimalPipe, private discordService: DiscordService) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._users$.next(result.users);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get users$() { return this._users$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: string) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _users$ = new BehaviorSubject<User[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 5,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    return this.discordService.getMembers().pipe(map(res => {
      res = new CoreResponse(res);
      if (!res.success()) {
        return {users: [], total: 0};
      }

      let us = res.body.members as User[];

      // Set name field
      if (Array.isArray(us)) {
        us = us.map(user => {
          user.name = this.userService.getName(user);
          user.username = user.discord.username || '';
          user.banned = user.discord.ban ? 'Banned' : 'Non-Banned';

          return user;
        });

        // 1. sort
        let users = sort(us, sortColumn, sortDirection);

        // 2. filter
        users = users.filter(user => matches(user, searchTerm, this.pipe));
        const total = users.length;

        // 3. paginate
        users = users.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

        return {users, total};
      } else {
        return {users: [], total: 0};
      }
    }));
  }

  public refresh() {
    this._search$.next();
  }
}
