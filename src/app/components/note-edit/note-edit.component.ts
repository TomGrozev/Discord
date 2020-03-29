import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {

  @Input() content: FormControl = new FormControl('', Validators.required);
  @Input() extraFields: FormGroup = new FormGroup({
    fields: new FormArray([])
  });
  @Input() extraFieldTitles: String[] = [];
  @Input() extraFieldKinds: String[] = [];
  @Input() extraFieldOptions: String[] = [];
  @Input() creator: String = 'You';

  maxLength = 2000;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  get fields() { return this.extraFields.get('fields') as FormArray; }

}
