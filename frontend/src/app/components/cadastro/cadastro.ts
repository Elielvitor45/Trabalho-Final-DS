import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  cadastroForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showEndereco = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      endereco: this.fb.group({
        cep: [''],
        logradouro: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      })
    }, { validators: this.senhasIguais });
  }

  senhasIguais(form: FormGroup) {
    const senha = form.get('senha')?.value;
    const confirmar = form.get('confirmarSenha')?.value;
    return senha === confirmar ? null : { senhasDiferentes: true };
  }

  toggleEndereco(): void {
    this.showEndereco = !this.showEndereco;
    const enderecoGroup = this.cadastroForm.get('endereco') as FormGroup;

    if (this.showEndereco) {
      enderecoGroup.get('cep')?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      enderecoGroup.get('logradouro')?.setValidators([Validators.required]);
      enderecoGroup.get('numero')?.setValidators([Validators.required]);
      enderecoGroup.get('bairro')?.setValidators([Validators.required]);
      enderecoGroup.get('cidade')?.setValidators([Validators.required]);
      enderecoGroup.get('estado')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{2}$/)]);
    } else {
      Object.keys(enderecoGroup.controls).forEach(key => {
        enderecoGroup.get(key)?.clearValidators();
        enderecoGroup.get(key)?.updateValueAndValidity();
      });
    }
  }

  formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
  }

  formatTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
  }

  formatCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
  }

  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = { ...this.cadastroForm.value };
    delete formData.confirmarSenha;

    // Remove endereco se não estiver preenchido
    if (!this.showEndereco || !formData.endereco.cep) {
      delete formData.endereco;
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
        this.loading = false;
      }
    });
  }

  markAllAsTouched(): void {
    Object.keys(this.cadastroForm.controls).forEach(key => {
      const control = this.cadastroForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToRegister(): void {
    this.router.navigate(['/cadastro']);
  }
}
