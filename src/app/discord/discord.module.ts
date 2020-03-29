import { NgModule } from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';

import { DiscordRoutingModule } from './discord-routing.module';
import { DiscordDashboardComponent } from './discord-dashboard/discord-dashboard.component';
import { DiscordReportsComponent } from './discord-reports/discord-reports.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SortableHeaderModule} from '../sortable-header/sortable-header.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {faCheck, faEdit, faEye, faPlus, faSort, faSortDown, faSortUp, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';
import { DiscordReportComponent } from './discord-reports/discord-report/discord-report.component';
import { DiscordMembersComponent } from './discord-members/discord-members.component';
import { DiscordMemberComponent } from './discord-members/discord-member/discord-member.component';

@NgModule({
  declarations: [
    DiscordDashboardComponent,
    DiscordReportsComponent,
    DiscordReportComponent,
    DiscordMembersComponent,
    DiscordMemberComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SortableHeaderModule,
    NgbModule,
    FontAwesomeModule,
    DiscordRoutingModule
  ],
  providers: [DecimalPipe]
})
export class DiscordModule {

  constructor(library: FaIconLibrary) {
    [faCheck, faTimes, faSort, faSortUp, faSortDown, faPlus, faEdit, faTrash, faEye].forEach(icon => {
      library.addIcons(icon);
    });
  }
}
