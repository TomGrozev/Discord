import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from "../guards/auth.guard";
import {DiscordDashboardComponent} from "./discord-dashboard/discord-dashboard.component";
import {DiscordReportsComponent} from "./discord-reports/discord-reports.component";
import {DiscordReportComponent} from "./discord-reports/discord-report/discord-report.component";
import {DiscordMembersComponent} from "./discord-members/discord-members.component";
import {DiscordMemberComponent} from './discord-members/discord-member/discord-member.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', canActivate: [AuthGuard], component: DiscordDashboardComponent },
  { path: 'reports', canActivate: [AuthGuard], children: [
      { path: '', component: DiscordReportsComponent, canActivate: [AuthGuard] },
      { path: ':id', component: DiscordReportComponent, canActivate: [AuthGuard] }
    ] },
  { path: 'members', canActivate: [AuthGuard], children: [
      { path: '', component: DiscordMembersComponent, canActivate: [AuthGuard] },
      { path: ':id', component: DiscordMemberComponent, canActivate: [AuthGuard] }
    ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscordRoutingModule { }
