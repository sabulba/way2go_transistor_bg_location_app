import { TestBed } from '@angular/core/testing';

import { BgLocation } from './bg-location';

describe('BgLocation', () => {
  let service: BgLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BgLocation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
