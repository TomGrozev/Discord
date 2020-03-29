import { TestBed } from '@angular/core/testing';

import { DiscordMembersListService } from './discord-members-list.service';

describe('DiscordMembersListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiscordMembersListService = TestBed.get(DiscordMembersListService);
    expect(service).toBeTruthy();
  });
});
