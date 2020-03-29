import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import {HttpBackend, HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../models/User';
import {CoreResponse} from '../models/CoreResponse';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

const url = environment.url;

interface JWTToken {
    token: string;
    expiry: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private jwt_token: BehaviorSubject<JWTToken>;
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private httpBackend: HttpBackend, private router: Router) {
        this.jwt_token = new BehaviorSubject<JWTToken>(null);
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('current_user')));
        this.currentUser = this.currentUserSubject.asObservable();

        if (this.currentJWT === null) {
            this.getJWT();
        } else {
            this.getUser();
        }

        window.addEventListener('storage', this.syncLogout.bind(this));
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentJWT(): JWTToken {
        return this.jwt_token.value;
    }

    private redirectToLogin() {
        if (this.router.url !== '/login') {
            this.router.navigate(['/login']);
        }
    }

    public getUser() {
        console.log(this.currentJWT);
        new HttpClient(this.httpBackend).get<CoreResponse>(url + '/sso/user', {
            withCredentials: true,
            headers: new HttpHeaders({
                'Authorization': `Bearer ${this.currentJWT.token}`
            })
        })
            .subscribe({
                next: (res) => {
                    res = new CoreResponse(res);
                    if (!res.success() || !res.body || !res.body.user) {
                        this.redirectToLogin();
                        return;
                    }

                    console.log(res.body.user);
                    this.currentUserSubject.next(res.body.user);
                }, error: err => {
                    this.redirectToLogin();
                }
            });
    }

    private getJWT() {
        // Can't use interceptor
        new HttpClient(this.httpBackend).get<CoreResponse>(url + '/sso/refresh_token',
            {withCredentials: true}).subscribe({
            next: res => {
                res = new CoreResponse(res);
                if (!res.success() || !res.body || !res.body.jwt_token || !res.body.jwt_token_expiry) {
                    this.redirectToLogin();
                    return;
                }

                this.jwt_token.next({token: res.body.jwt_token, expiry: res.body.jwt_token_expiry});

                this.getUser();

                // Start auto refresh countdown
                const time = res.body.jwt_token_expiry - 30000;
                const this$ = this;
                setTimeout(function () {
                    console.log('Refreshing JWT');
                    this$.getJWT();
                }, time >= 30000 ? time : 30000);
            },
            error: _ => {
                this.redirectToLogin();
            }
        });
    }

    public login() {
        window.location.href = url + '/sso?callback=' + encodeURIComponent(environment.base_url);
    }

    public logout() {
        this.jwt_token.next(null);

        return new HttpClient(this.httpBackend).get(`${url}/sso/logout`,
            {withCredentials: true}).subscribe({
            complete: () => {
                localStorage.setItem('logout', String(Date.now()));
                this.redirectToLogin();
            }
        });
    }

    private syncLogout(ev: KeyboardEvent) {
        if (ev.key === 'logout') {
            console.log('Logged out in storage');
            this.jwt_token.next(null);
            this.redirectToLogin();
        }
    }

    public loggedIn() {
        return this.currentUserValue !== null && this.currentJWT !== null;
    }

    public getName(person: any): string {
        if (typeof person === 'string') {
            return person;
        }
        if (!person || !person.cid) {
            return 'Unknown';
        }

        let out = '';
        if (person.first_name) {
            out = person.first_name;
            if (person.last_name) {
                out += ' ' + person.last_name;
            }
        } else if (person.last_name) {
            out = person.last_name;
        }

        if (out.length) {
            out += ` (${person.cid})`;
        } else {
            out = person.cid;
        }

        return out;
    }

    public loggedInObserve() {
        return this.currentUser.pipe(map(user => user !== null && this.currentJWT !== null));
    }

    /***************************************
     * Perms
     * ---
     * Check if user has specific perm
     ***************************************/

    public check(sku) {
        return this.currentUserValue !== null &&
            this.currentUserValue.perms.filter(perm => perm.level === 3 && perm.perm.sku === sku).length > 0;
    }

    public isDiscordModerator() {
        return this.inGroup('5d8cd2ee1dbf440cc0772ece');
    }

    public isDiscordAdmin() {
        return this.inGroup('5d8206c1b260fd23289bb747');
    }

    public isAdmin() {
        return this.inGroup('5cf94bc9efcfc016d3f1e9b4');
    }

    private inGroup(groupId: string) {
        return this.currentUserValue !== null && this.currentJWT !== null &&
            ((this.currentUserValue.groups.primary && this.currentUserValue.groups.primary._id === groupId) ||
                this.currentUserValue.groups.secondary.filter(group => group && group._id === groupId).length > 0);
    }
}
