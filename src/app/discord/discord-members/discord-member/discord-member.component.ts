import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {animate, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../../../services/alert.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DiscordService} from '../../../services/discord.service';
import {CoreResponse} from '../../../models/CoreResponse';
import {NoteEditComponent} from '../../../components/note-edit/note-edit.component';
import {UserService} from '../../../services/user.service';

@Component({
    selector: 'app-discord-member',
    animations: [
        trigger(
            'inOutAnimation',
            [
                transition(
                    ':enter',
                    [
                        style({height: 0, opacity: 0}),
                        animate('1s ease-out',
                            style({height: 300, opacity: 1}))
                    ]
                ),
                transition(
                    ':leave',
                    [
                        style({height: 300, opacity: 1}),
                        animate('1s ease-in',
                            style({height: 0, opacity: 0}))
                    ]
                )
            ]
        )
    ],
    templateUrl: './discord-member.component.html',
    styleUrls: ['./discord-member.component.css']
})
export class DiscordMemberComponent implements OnInit {

    objectKeys = Object.keys;

    user = new FormGroup({
        cid: new FormControl({value: '', disabled: true}, Validators.required),
        name: new FormControl({value: '', disabled: true}, Validators.required),
        discord: new FormGroup({
            id: new FormControl({value: '', disabled: true}, Validators.required),
            username: new FormControl({value: '', disabled: true}, Validators.required),
            avatar: new FormControl({value: '', disabled: true}, Validators.required),
            discriminator: new FormControl({value: '', disabled: true}, Validators.required),
            allowed: new FormControl(false, Validators.required),
            nickname: new FormControl('', Validators.maxLength(30)),
            ban: new FormGroup({
                kind: new FormControl({value: '', disabled: true}, Validators.required),
                reason: new FormControl({value: '', disabled: true}, Validators.required),
                expires: new FormControl({value: new Date(), disabled: true}, Validators.required)
            }),
            roles: new FormArray([])
        }),
        mod_notes: new FormArray([])
    });

    id: string;
    loadingNotes = [];
    loadingAccess$ = false;
    loadingNickname$ = false;
    loadingRoles$ = false;

    avatarSrc = '';

    initialRoles$ = [];

    availDiscordRoles = [];

    constructor(private route: ActivatedRoute, private router: Router, private alertService: AlertService, private discordSerivce: DiscordService, public userService: UserService, private modalService: NgbModal) {
        this.id = this.route.snapshot.params['id'];
        if (!this.id) {
            alertService.add('danger', 'Error: No User Provided');
            router.navigate(['/access/users']);
            return;
        }

        let valSet = false;
        discordSerivce.getMember(this.id).subscribe(res => {
            res = new CoreResponse(res);
            if (res.success()) {
                this.user.controls['cid'].setValue(res.body.member.cid);
                this.user.controls['name'].setValue(res.body.member.first_name + ' ' + res.body.member.last_name);

                if (res.body.member.discord) {
                    this.discord.controls.username.setValue(res.body.member.discord.username);
                    this.discord.controls.id.setValue(res.body.member.discord.id);
                    this.discord.controls.discriminator.setValue(res.body.member.discord.discriminator);
                    this.discord.controls.allowed.setValue(res.body.member.discord.allowed || false);
                    this.discord.controls.nickname.setValue(res.body.member.discord.nickname || '');
                    this.discord.controls.avatar.setValue(res.body.member.discord.avatar);

                    if (res.body.member.discord.ban) {
                        this.ban.controls.kind.setValue(res.body.member.discord.ban.kind);
                        this.ban.controls.reason.setValue(res.body.member.discord.ban.reason);
                        this.ban.controls.expires.setValue(new Date(res.body.member.discord.ban.expires));
                    }

                    if (res.body.member.discord.roles) {
                        this.initialRoles$ = res.body.member.discord.roles;
                        for (const roleid of res.body.member.discord.roles) {
                            this.discordRoles.push(new FormControl(roleid));
                        }
                    }
                }

                if (res.body.member.mod_notes) {
                    for (const note of res.body.member.mod_notes) {
                        if (note.note !== null) {
                            this.mod_notes.push(new FormGroup({
                                _id: new FormControl(note.note._id, Validators.required),
                                content: new FormControl({
                                    value: note.note.content,
                                    disabled: true
                                }, [Validators.required, Validators.maxLength(2000)]),
                                creator: new FormControl(note.note.hasOwnProperty('creator') ? `${note.note.creator.first_name} ${note.note.creator.last_name} - ${note.note.creator.cid}` : '', Validators.required),
                                type: new FormControl(note.kind)
                            }));
                        }
                    }
                }

                this.avatarSrc = 'https://cdn.discordapp.com/avatars/' +
                    this.discord.controls.id.value + '/' +
                    this.discord.controls.avatar.value + '.png';

                valSet = true;
            } else {
                alertService.add('danger', 'Error getting user');
                router.navigate(['/access/users']);
            }

            setTimeout(function () {
                if (!valSet) {
                    alertService.add('danger', 'Error getting user');
                    router.navigate(['/access/users']);
                }
            }, 3000);
        }, err => {
            alertService.add('danger', 'Error getting user');
            router.navigate(['/access/users']);
        });

        this.discordSerivce.getRoles().subscribe(res => {
            res = new CoreResponse(res);

            if (res.success()) {
                this.availDiscordRoles = res.body.roles;
            } else {
                this.alertService.add('danger', 'Error getting discord Roles');
            }
        }, error => {
            this.alertService.add('danger', 'Error getting discord Roles');
        });
    }

    ngOnInit() {
    }

    arraysEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }
        if (a.length !== b.length) {
            return false;
        }

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    get timezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    get discord() {
        return this.user.controls.discord as FormGroup;
    }

    get discordRoles() {
        return this.discord.controls.roles as FormArray;
    }

    get ban() {
        return this.discord.controls.ban as FormGroup;
    }

    get expires() {
        return this.ban.controls.expires.value as Date;
    }

    get mod_notes() {
        return this.user.controls.mod_notes as FormArray;
    }

    asFormGroup(group) {
        return group as FormGroup;
    }

    toggleAccess() {
        this.loadingAccess$ = true;

        this.discordSerivce.toggleAccess(this.id).subscribe(res => {
            res = new CoreResponse(res);

            if (res.success() && typeof res.body.access !== 'undefined') {
                this.discord.controls.allowed.setValue(res.body.access);
                this.alertService.add('success', 'Discord access toggled successfully');
            } else {
                this.alertService.add('danger', 'Error toggling user discord access');
                this.discord.controls.allowed.setValue(!this.discord.controls.allowed.value);
            }
            this.loadingAccess$ = false;
        }, error => {
            this.alertService.add('danger', 'Error toggling user discord access');
        });
    }

    setNickname() {
        if (!this.discord.controls.nickname.valid) {
            return;
        }

        this.loadingNickname$ = true;

        this.discordSerivce.setNickname(this.id, this.discord.controls.nickname.value).subscribe(res => {
            res = new CoreResponse(res);

            if (res.success()) {
                if (res.body.nickname) {
                    this.discord.controls.nickname.setValue(res.body.nickname);
                }
                this.alertService.add('success', 'Discord nickname set successfully');
            } else {
                this.alertService.add('danger', 'Error setting user discord nickname');
            }
            this.loadingNickname$ = false;
        }, error => {
            this.alertService.add('danger', 'Error setting user discord nickname');
        });
    }

    addDiscordRole(id: string) {
        this.discordRoles.push(new FormControl(id));
    }

    deleteDiscordRole(i) {
        this.discordRoles.removeAt(i);
    }

    saveDiscordRoles() {
        if (this.arraysEqual(this.discordRoles.getRawValue(), this.initialRoles$)) {
            return this.alertService.add('danger', 'No roles selected');
        }
        this.loadingRoles$ = true;

        this.discordSerivce.setRoles(this.id, this.discordRoles.getRawValue()).subscribe(res => {
            res = new CoreResponse(res);

            this.loadingRoles$ = false;
            if (!res.success()) {
                return this.alertService.add('danger', 'Error saving discord roles');
            }

            this.initialRoles$ = this.discordRoles.getRawValue();
            this.alertService.add('success', 'Successfully saved discord roles for user');
        }, error => {
            this.loadingRoles$ = false;
            this.alertService.add('danger', 'Error saving discord roles');
        });
    }

    unban() {
        this.discordSerivce.unban(this.id).subscribe(res => {
            res = new CoreResponse(res);

            if (res.success()) {
                this.alertService.add('success', 'User successfully unbanned');
                this.ban.controls.kind.setValue('');
                this.ban.controls.reason.setValue('');
            } else {
                this.alertService.add('danger', 'Error unbanning user :(');
            }
        }, error => {
            this.alertService.add('danger', 'Error unbanning user :(');
        });
    }

    newNote() {
        const modalRef = this.modalService.open(NoteEditComponent, {size: 'lg'});

        modalRef.componentInstance.extraFields = new FormGroup({
            fields: new FormArray([
                new FormControl('general')
            ])
        });
        modalRef.componentInstance.extraFieldTitles = ['Type'];
        modalRef.componentInstance.extraFieldKinds = ['select'];
        modalRef.componentInstance.extraFieldOptions = [['general', 'warning']];

        modalRef.result.then(response => {
            if (response === 'cross-click') {
                return;
            }

            this.discordSerivce.createUserNote(this.id, response.content.value, response.extraFields.controls[0].value).subscribe(res => {
                res = new CoreResponse(res);
                if (!res.success()) {
                    return this.alertService.add('danger', 'There was an error creating the note');
                }
                console.log(res);

                this.mod_notes.push(new FormGroup({
                    _id: new FormControl(res.body.note._id, Validators.required),
                    content: new FormControl(response.content.value, [Validators.required, Validators.maxLength(2000)]),
                    creator: new FormControl('You', Validators.required),
                    type: new FormControl(response.extraFields.controls[0].value, Validators.required),
                }));
                this.alertService.add('success', 'Note Created Successfully');
            }, error1 => {
                this.alertService.add('danger', 'There was an error creating the note');
            });
        });
    }

    editNote(i) {
        const modalRef = this.modalService.open(NoteEditComponent, {size: 'lg'});
        const group = this.mod_notes.controls[i] as FormGroup;

        modalRef.componentInstance.extraFields = new FormGroup({
            fields: new FormArray([
                new FormControl(group.controls.type.value)
            ])
        });
        modalRef.componentInstance.extraFieldTitles = ['Type'];
        modalRef.componentInstance.extraFieldKinds = ['select'];
        modalRef.componentInstance.extraFieldOptions = [['general', 'warning']];

        modalRef.componentInstance.content.setValue(group.controls.content.value);
        modalRef.componentInstance.creator = group.controls.creator.value;
        modalRef.result.then(response => {
            console.log(response);
            if (response === 'cross-click') {
                return;
            }

            this.loadingNotes.push(i);

            this.discordSerivce.editUserNote(this.id, group.controls._id.value, response.content.value, response.extraFields.controls[0].value).subscribe(res => {
                res = new CoreResponse(res);
                if (!res.success()) {
                    this.alertService.add('danger', 'There was an error editing the note');
                } else {
                    group.controls.content.setValue(response.content.value);
                    group.controls.type.setValue(response.extraFields.controls[0].value);
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
        if (this.mod_notes.length > 0) {
            this.modalService.open(content, {ariaLabelledBy: 'confirm-delete-modal'}).result.then((result) => {
                if (result === 'ok-click') {
                    this.discordSerivce.deleteUserNote(this.id, (this.mod_notes.controls[i] as FormGroup).controls._id.value).subscribe(res => {
                        res = new CoreResponse(res);
                        if (!res.success()) {
                            return this.alertService.add('danger', 'There was an error deleting the note');
                        }

                        this.alertService.add('success', 'Successfully deleted note');
                        this.mod_notes.removeAt(i);
                    }, error1 => {
                        this.alertService.add('danger', 'There was an error deleting the note');
                    });
                }
            });
        }
    }

}
