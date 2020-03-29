import {Component, OnInit} from '@angular/core';
import {DiscordService} from '../../../services/discord.service';
import {ActivatedRoute} from '@angular/router';
import {CoreResponse} from '../../../models/CoreResponse';
import {Report} from '../../../models/Report';
import {UserService} from '../../../services/user.service';
import {NoteEditComponent} from '../../../components/note-edit/note-edit.component';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AlertService} from '../../../services/alert.service';

@Component({
  selector: 'app-discord-report',
  templateUrl: './discord-report.component.html',
  styleUrls: ['./discord-report.component.scss']
})
export class DiscordReportComponent implements OnInit {

  id: string;
  report: Report;
  notesParent = new FormGroup({
    notes: new FormArray([])
  });
  watching = false;

  loadingNotes = [];
  loadingWatch$ = false;

  constructor(private discordService: DiscordService, private route: ActivatedRoute, private alertService: AlertService, private modalService: NgbModal, public userService: UserService) {
    this.id = route.snapshot.params.id;
    if (this.id) {
      discordService.getReport(this.id).subscribe(res => {
        res = new CoreResponse(res);

        if (res.success()) {
          this.report = res.body.report;
          this.report.notes.forEach(note => {
            this.notes.push(new FormGroup({
              _id: new FormControl(note._id, Validators.required),
              content: new FormControl(note.content, [Validators.required, Validators.maxLength(2000)]),
              creator: new FormControl(note.creator, Validators.required),
            }));
          });

          this.watching = res.body.report.watching_users.indexOf(userService.currentUserValue._id) !== -1;
        }
      });
    }
  }

  ngOnInit() {
  }

  get notes() {
    return this.notesParent.controls.notes as FormArray;
  }

  formatDate(date: string): string {
    return (new Date(date)).toUTCString();
  }

  asFormGroup(group) {
    return group as FormGroup;
  }

  newNote() {
    const modalRef = this.modalService.open(NoteEditComponent, {size: 'lg'});
    modalRef.result.then(response => {
      if (response === 'cross-click') {
        return;
      }

      this.discordService.createReportNote(this.id, response.content.value).subscribe(res => {
        res = new CoreResponse(res);
        if (!res.success()) {
          return this.alertService.add('danger', 'There was an error creating the note');
        }

        this.notes.push(new FormGroup({
          _id: new FormControl(res.body.note._id, Validators.required),
          content: new FormControl(response.content.value, [Validators.required, Validators.maxLength(2000)]),
          creator: new FormControl('You', Validators.required),
        }));
        this.alertService.add('success', 'Note Created Successfully');
      }, error1 => {
        this.alertService.add('danger', 'There was an error creating the note');
      });
    });
  }

  editNote(i) {
    const modalRef = this.modalService.open(NoteEditComponent, {size: 'lg'});
    const note = this.notes.controls[i] as FormGroup;

    modalRef.componentInstance.content.setValue(note.controls.content.value);
    modalRef.componentInstance.creator = this.userService.getName(note.controls.creator.value);

    modalRef.result.then(response => {
      console.log(response);
      if (response === 'cross-click') {
        return;
      }

      this.loadingNotes.push(i);

      this.discordService.editReportNote(this.id, note.controls._id.value, response.content.value).subscribe(res => {
        res = new CoreResponse(res);
        if (!res.success()) {
          this.alertService.add('danger', 'There was an error editing the note');
        } else {
          note.controls.content.setValue(response.content.value);
        }
        this.loadingNotes.splice(this.loadingNotes.indexOf(i), 1);
        this.alertService.add('success', 'Note Edited Successfully');
      }, error1 => {
        this.alertService.add('danger', 'There was an error editing the note');
        this.loadingNotes.splice(this.loadingNotes.indexOf(i), 1);
      });
    });
  }

  deleteNote(content, i) {
    if (this.notes.length > 0) {
      this.modalService.open(content, {ariaLabelledBy: 'confirm-delete-modal'}).result.then((result) => {
        if (result === 'ok-click') {
          this.loadingNotes.push(i);

          this.discordService.deleteReportNote(this.id, (this.notes.controls[i] as FormGroup).controls._id.value).subscribe(res => {
            res = new CoreResponse(res);
            if (!res.success()) {
              return this.alertService.add('danger', 'There was an error deleting the note');
            }

            this.loadingNotes.splice(this.loadingNotes.indexOf(i), 1);
            this.alertService.add('success', 'Successfully deleted note');
            this.notes.removeAt(i);
          }, error1 => {
            this.alertService.add('danger', 'There was an error deleting the note');
          });
        }
      });
    }
  }

  resolve() {
    this.discordService.resolve(this.id).subscribe(res => {
      res = new CoreResponse(res);

      if (res.success()) {
        this.report.resolved = res.body.report.resolved;
        if (this.report.resolved === 1) {
          this.alertService.add('success', 'The Report has been marked as pending, waiting for approval.');
        } else if (this.report.resolved === 2) {
          this.alertService.add('success', 'The report has been marked as resolved.');
        }
      } else {
        this.alertService.add('danger', 'Error marking report as resolved.');
      }
    }, error => {
      this.alertService.add('danger', 'Error marking report as resolved.');
    });
  }

  unresolve() {
    this.discordService.unresolve(this.id).subscribe(res => {
      res = new CoreResponse(res);

      if (res.success()) {
        this.report.resolved = res.body.report.resolved;
        this.alertService.add('success', 'The Report has been marked as unresolved.');
      } else {
        this.alertService.add('danger', 'Error marking report as unresolved.');
      }
    }, error => {
      this.alertService.add('danger', 'Error marking report as unresolved.');
    });
  }

  toggleWatching() {
    this.loadingWatch$ = true;
    this.discordService.toggleWatching(this.id).subscribe(res => {
      res = new CoreResponse(res);

      this.loadingWatch$ = false;
      if (res.success()) {
        this.watching = res.body.watching;
        if (this.watching) {
          this.alertService.add('success', 'You have now subscribed to alerts for this report.');
        } else {
          this.alertService.add('success', 'You have now unsubscribed to alerts for this report.');
        }
      } else {
        this.alertService.add('danger', 'Error toggling report watch status.');
      }
    }, error => {
      this.alertService.add('danger', 'Error toggling report watch status.');
    });
  }
}
