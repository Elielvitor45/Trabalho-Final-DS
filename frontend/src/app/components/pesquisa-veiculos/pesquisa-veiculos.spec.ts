import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PesquisaVeiculosComponent } from './pesquisa-veiculos';

describe('PesquisaVeiculosComponent', () => {
  let component: PesquisaVeiculosComponent;
  let fixture: ComponentFixture<PesquisaVeiculosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PesquisaVeiculosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PesquisaVeiculosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
