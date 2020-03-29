import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordMembersComponent } from './discord-members.component';

describe('DiscordMembersComponent', () => {
  let component: DiscordMembersComponent;
  let fixture: ComponentFixture<DiscordMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
