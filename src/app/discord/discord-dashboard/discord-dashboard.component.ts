import { Component, OnInit } from '@angular/core';
import {DiscordService} from '../../services/discord.service';
import {CoreResponse} from '../../models/CoreResponse';
import {UserService} from '../../services/user.service';

interface Dashboard {
  reports: [{
    _id: string;
    subject: {
      _id: string;
      cid: string
      first_name: string;
      last_name: string;
    };
    createdAt: Date | string;
  }];
  members: [{
    _id: string;
    cid: string
    first_name: string;
    last_name: string;
    discord: {
      _id: string;
      createdAt: Date | string;
    }
  }];
}

@Component({
  selector: 'app-discord-dashboard',
  templateUrl: './discord-dashboard.component.html',
  styleUrls: ['./discord-dashboard.component.scss']
})
export class DiscordDashboardComponent implements OnInit {

  data: Dashboard;
  loading$ = true;

  constructor(private discoardService: DiscordService, public userService: UserService) {
    discoardService.getDashboard().subscribe(res => {
      res = new CoreResponse(res);

      this.data = (res.body as Dashboard);
      this.data.reports.map(r => {
        r.createdAt = new Date(r.createdAt);
        return r;
      });
      this.data.members.map(m => {
        m.discord.createdAt = new Date(m.discord.createdAt);
        return m;
      });
      this.loading$ = false;
    });
  }

  ngOnInit() {
  }

}
