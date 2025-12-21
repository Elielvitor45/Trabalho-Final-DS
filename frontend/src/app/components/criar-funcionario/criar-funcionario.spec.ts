import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarFuncionarioComponent } from './criar-funcionario';

describe('CriarFuncionario', () => {
  let component: CriarFuncionarioComponent;
  let fixture: ComponentFixture<CriarFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarFuncionarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarFuncionarioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
