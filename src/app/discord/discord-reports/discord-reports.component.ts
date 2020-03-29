import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Observable} from 'rxjs';
import {SortableHeaderDirective, SortEvent} from '../../sortable-header/sortable-header.directive';
import {NavigationEnd, Router} from '@angular/router';
import {Report} from '../../models/Report';
import {DiscordReportListService} from '../../services/discord-report-list.service';

@Component({
  selector: 'app-discord-reports',
  templateUrl: './discord-reports.component.html',
  styleUrls: ['./discord-reports.component.scss']
})
export class DiscordReportsComponent implements OnInit {

  reports$: Observable<Report[]>;
  total$: Observable<number>;

  sortOption = -1;

  sort: {column: string, direction: string} = {column: '', direction: ''};

  @ViewChildren(SortableHeaderDirective) headers: QueryList<SortableHeaderDirective>;

  constructor(public discordReportListService: DiscordReportListService, public router: Router) {
    this.reports$ = discordReportListService.reports$;
    this.total$ = discordReportListService.total$;
  }

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && e.url === '/access/reports') {
        this.discordReportListService.refresh();
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

    this.discordReportListService.sortColumn = column;
    this.discordReportListService.sortDirection = direction;
  }

  sortResolved() {
    this.discordReportListService.sortResolved = this.sortOption;
  }

}
