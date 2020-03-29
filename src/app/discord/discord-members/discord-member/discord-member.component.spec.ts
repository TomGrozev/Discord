import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordMemberComponent } from './discord-member.component';

describe('DiscordMemberComponent', () => {
  let component: DiscordMemberComponent;
  let fixture: ComponentFixture<DiscordMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
