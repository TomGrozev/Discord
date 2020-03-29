import { TestBed } from '@angular/core/testing';

import { DiscordReportListService } from './discord-report-list.service';

describe('DiscordReportListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiscordReportListService = TestBed.get(DiscordReportListService);
    expect(service).toBeTruthy();
  });
});
