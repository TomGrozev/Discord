import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../services/alert.service';
import {CoreResponse} from '../models/CoreResponse';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ReportComponent} from '../components/report/report.component';
import {DiscordService} from '../services/discord.service';
import {error} from 'selenium-webdriver';
import {User} from '../models/User';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading$ = false;
  pageLoading$ = true;
  allowed;

  mods: User[] = [];

  constructor(public userService: UserService,
              private discordService: DiscordService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private modalService: NgbModal) { }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('error')) {
        const err = (params['error'] || '').replace(/_/g, ' ')
          .replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        const error_description = (params['error_description'] || '').replace(/_/g, ' ')
          .replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        this.alertService.add('danger', error_description ? err + ': ' + error_description : err, true);
      } else if (params.hasOwnProperty('message')) {
        const message = (params['message'] || '').replace(/_/g, ' ')
          .replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });

        this.alertService.add('success', message, true);
      }
    });

    this.discordService.getAllowed().subscribe((allowed) => {
      this.allowed = allowed;
      this.pageLoading$ = false;
    }, error1 => {
      this.alertService.add('danger', 'Error getting allowed. Please contact it@vatpac.org');
    });

    this.discordService.getMods().subscribe(mods => {
      this.mods = mods;
    }, error1 => {
      this.alertService.add('danger', 'Error getting current moderators. Please contact it@vatpac.org');
    });
  }

  login() {
    this.loading$ = true;

    this.userService.login();
  }

  linkDiscord() {
    this.loading$ = true;

    DiscordService.linkDiscord();
  }

  openReport() {
    const modalRef = this.modalService.open(ReportComponent, {size: 'lg'});
    modalRef.result.then(res => {
      if (res) { this.alertService.add('success', 'Report submitted successfully'); }
    }).catch(() => {});
  }

  update() {
    this.loading$ = true;

    this.discordService.update().subscribe(res => {
      console.log(res);
      res = new CoreResponse(res);
      this.loading$ = false;
      if (!res.success()) {
        if (res.request.error === 401) {
          this.alertService.add('danger', 'Discord no longer authorised. Need to relink account.', true);
          return window.location.reload();
        }
        return this.alertService.add('danger', 'Cannot Update User: ' + res.request.message, true);
      }

      this.alertService.add('success', res.request.message, false);

      this.userService.getUser();
    }, error1 => {
      if (error1.error.request.error === 401) {
        this.alertService.add('danger', 'Discord no longer authorised. Need to relink account.', true);
        return window.location.reload();
      }
      return this.alertService.add('danger', 'Cannot Update User: ' + error1.error.request.message, true);
    });
  }

  canUpdate(last, manual) {
    const now = new Date();
    return !last ? true : (now.getTime() - (new Date(Date.parse(last))).getTime() >= 2 * 60 * 60 * 1000)
      && !manual ? true : (now.getTime() - (new Date(Date.parse(manual))).getTime() >= 24 * 60 * 60 * 1000);
  }

}
