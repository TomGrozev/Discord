import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CoreResponse} from '../models/CoreResponse';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {User} from '../models/User';

const url = environment.url;

@Injectable({
    providedIn: 'root'
})
export class DiscordService {

    constructor(private http: HttpClient) {
    }

    public static linkDiscord() {
        window.location.href = url + '/discord/?callback=' + encodeURIComponent(environment.base_url);
    }

    public update(): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(url + '/discord/update');
    }

    public report(cid: number, type: string, content: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/report', {cid: cid, type: type, content: content});
    }

    public getAllowed(): Observable<boolean> {
        return this.http.get<CoreResponse>(url + '/discord/allowed')
            .pipe(map((res) => {
                res = new CoreResponse(res);

                if (res.success()) {
                    return res.body.allowed;
                }

                return false;
            }));
    }

    /**
     * Get Mods
     */
    public getMods(): Observable<User[]> {
        return this.http.get<CoreResponse>(url + '/discord/mods')
            .pipe(map((res) => {
                res = new CoreResponse(res);

                if (res.success()) {
                    return res.body.mods;
                }

                return [];
            }));
    }

    /**
     * Get Dashboard
     */
    public getDashboard(): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/dashboard`);
    }

    /**
     * Get Roles
     */
    public getRoles(): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/roles`);
    }

    /**
     * set Roles
     */
    public setRoles(id: string, roles: string[]): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(`${url}/discord/members/${id}/roles`, {roles: roles});
    }

    /**
     * Get Members
     */
    public getMembers(): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/members`);
    }

    /**
     * Get Member
     */
    public getMember(id: string): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/members/${id}`);
    }

    /**
     * Get Reports
     */
    public getReports(): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/reports`);
    }

    /**
     * Get Report
     */
    public getReport(id: string): Observable<CoreResponse> {
        return this.http.get<CoreResponse>(`${url}/discord/reports/${id}`);
    }

    public createReportNote(id: string, content: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/reports/' + id + '/newnote', {note: {content: content}});
    }

    public editReportNote(id: string, note_id: string, content: string): Observable<CoreResponse> {
        return this.http.patch<CoreResponse>(url + '/discord/reports/' + id + '/editnote/' + note_id, {note: {content: content}});
    }

    public deleteReportNote(id: string, note_id: string): Observable<CoreResponse> {
        return this.http.delete<CoreResponse>(url + '/discord/reports/' + id + '/deletenote/' + note_id);
    }

    public resolve(id: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/reports/' + id + '/resolve', {});
    }

    public unresolve(id: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/reports/' + id + '/unresolve', {});
    }

    public toggleWatching(id: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/reports/' + id + '/watch', {});
    }


    public createUserNote(id: string, content: string, type: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/members/' + id + '/newnote', {note: {content: content, type: type}});
    }

    public editUserNote(id: string, note_id: string, content: string, type: string): Observable<CoreResponse> {
        return this.http.patch<CoreResponse>(url + '/discord/members/' + id + '/editnote/' + note_id, {
            note: {
                content: content,
                type: type
            }
        });
    }

    public deleteUserNote(id: string, note_id: string): Observable<CoreResponse> {
        return this.http.delete<CoreResponse>(url + '/discord/members/' + id + '/deletenote/' + note_id);
    }

    public unban(id: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/members/' + id + '/unban', {});
    }

    public toggleAccess(userid: string): Observable<CoreResponse> {
        return this.http.post<CoreResponse>(url + '/discord/access/' + userid, {});
    }
}
