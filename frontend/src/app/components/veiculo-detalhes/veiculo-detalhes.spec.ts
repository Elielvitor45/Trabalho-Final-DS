import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoDetalhes } from './veiculo-detalhes';

describe('VeiculoDetalhes', () => {
  let component: VeiculoDetalhes;
  let fixture: ComponentFixture<VeiculoDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoDetalhes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeiculoDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
