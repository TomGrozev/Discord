import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../models/User';
import {SortableHeaderDirective, SortEvent} from '../../sortable-header/sortable-header.directive';
import {DiscordMembersListService} from '../../services/discord-members-list.service';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-discord-members',
  templateUrl: './discord-members.component.html',
  styleUrls: ['./discord-members.component.scss']
})
export class DiscordMembersComponent implements OnInit {

  users$: Observable<User[]>;
  total$: Observable<number>;

  sort: {column: string, direction: string} = {column: '', direction: ''};

  @ViewChildren(SortableHeaderDirective) headers: QueryList<SortableHeaderDirective>;

  constructor(public discordMembersListService: DiscordMembersListService, public router: Router) {
    this.users$ = discordMembersListService.users$;
    this.total$ = discordMembersListService.total$;
  }

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && e.url === '/access/members') {
        this.discordMembersListService.refresh();
      }
    });
  }

  onSort({column, direction}: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.discordMembersListService.sortColumn = column;
    this.discordMembersListService.sortDirection = direction;
  }

}
