import { TestBed } from '@angular/core/testing';

import { Locacao } from './locacao';

describe('Locacao', () => {
  let service: Locacao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Locacao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
