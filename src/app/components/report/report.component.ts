import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../services/alert.service';
import {DiscordService} from '../../services/discord.service';
import {CoreResponse} from '../../models/CoreResponse';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  type = '';
  loading$ = false;

  report = new FormGroup({
    cid: new FormControl('', [Validators.required, Validators.pattern(/^(0|[1-9]\d*)?$/), Validators.max(9999999)]),
    type: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required)
  });

  constructor(public activeModal: NgbActiveModal, private alertService: AlertService, private discordService: DiscordService) {
  }

  ngOnInit() {
  }

  set reportType(val) {
    this.type = val;
    if (this.type.toLowerCase() !== 'other') {
      this.report.controls.type.setValue(this.type);
    } else {
      this.report.controls.type.setValue('');
    }
  }

  submit() {
    if (this.type.toLowerCase() !== 'other') {
      this.report.controls.type.setValue(this.type);
    }

    if (!this.report.valid) {
      this.alertService.add('danger', 'There are some invalid fields');
      return;
    }

    this.loading$ = true;

    this.discordService.report(
      this.report.controls.cid.value,
      this.report.controls.type.value,
      this.report.controls.content.value)
      .subscribe(res => {
        res = new CoreResponse(res);
        this.loading$ = false;
        if (!res.success()) {
          if (res.request.type === 'DiscordNotLinkedError') {
            this.report.controls.cid.setErrors({'notLinked': true});
            this.alertService.add('danger', 'There are some invalid fields');
          } else {
            this.alertService.add('danger', res.request.message);
          }
          return;
        }

        this.activeModal.close(true);
    }, error1 => {
        this.loading$ = false;
        try {
          if (error1.error.request.type === 'DiscordNotLinkedError') {
            this.report.controls.cid.setErrors({'notLinked': true});
          } else {
            this.alertService.add('danger', error1.error.request.message);
          }
        } catch (e) {
          this.alertService.add('danger', 'There are some invalid fields');
        }
      });

    // this.activeModal.close({
    //   cid: this.report.controls.cid.value,
    //   type: this.report.controls.type.value,
    //   content: this.report.controls.content.value
    // });
  }

}
