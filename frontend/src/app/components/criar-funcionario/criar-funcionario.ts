import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-criar-funcionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './criar-funcionario.html',
  styleUrls: ['./criar-funcionario.css']
})
export class CriarFuncionarioComponent implements OnInit {
  // URLs CORRIGIDAS
  private apiUrlFuncionario = 'http://localhost:8080/api/auth/register/funcionario';
  private apiUrlCliente = 'http://localhost:8080/api/auth/register/cliente';

  funcionarioForm: FormGroup;
  incluirEndereco = false;
  isFuncionario = true; // Toggle entre Funcionário e Cliente
  loading = false;
  errorMessage = '';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: Auth,
    private router: Router
  ) {
    this.funcionarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
      endereco: this.fb.group({
        cep: [''],
        logradouro: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      })
    });
  }


  ngOnInit(): void {
    console.log('🔧 Componente iniciado');
    console.log('📍 URL Funcionário:', this.apiUrlFuncionario);
    console.log('📍 URL Cliente:', this.apiUrlCliente);
  }


  get firstName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nome ? user.nome.split(' ')[0] : '';
  }

  // Retorna o tipo de usuário sendo criado
  get tipoUsuario(): string {
    return this.isFuncionario ? 'Funcionário' : 'Cliente';
  }


  isFieldInvalid(fieldName: string): boolean {
    const field = this.funcionarioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  senhasNaoCoincidem(): boolean {
    const senha = this.funcionarioForm.get('senha')?.value;
    const confirmarSenha = this.funcionarioForm.get('confirmarSenha')?.value;
    const confirmarField = this.funcionarioForm.get('confirmarSenha');

    return !!(confirmarField && confirmarField.touched && senha !== confirmarSenha);
  }


  formatarCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      // Formatar visualmente
      let formatted = value;
      formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2');
      formatted = formatted.replace(/(\d{3})(\d)/, '$1.$2');
      formatted = formatted.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      event.target.value = formatted;
    }
  }


  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      // Formatar visualmente
      let formatted = value;
      formatted = formatted.replace(/(\d{2})(\d)/, '($1) $2');
      formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2');

      event.target.value = formatted;
    }
  }


  formatarCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 8) {
      // Formatar visualmente
      let formatted = value;
      formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2');

      event.target.value = formatted;
    }
  }


  onSubmit(): void {
    // LOGS DE DEBUG
    console.log('🚀 onSubmit chamado');
    console.log('🔘 isFuncionario ATUAL:', this.isFuncionario);
    console.log('👤 Tipo de usuário:', this.tipoUsuario);

    if (this.funcionarioForm.invalid) {
      Object.keys(this.funcionarioForm.controls).forEach(key => {
        this.funcionarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.senhasNaoCoincidem()) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.funcionarioForm.value;

    // Limpar TODAS as máscaras antes de enviar
    const cpfLimpo = String(formValue.cpf).replace(/\D/g, '');
    const telefoneLimpo = formValue.telefone ? String(formValue.telefone).replace(/\D/g, '') : null;

    // Validar CPF tem exatamente 11 dígitos
    if (cpfLimpo.length !== 11) {
      this.errorMessage = 'CPF deve ter exatamente 11 dígitos';
      this.loading = false;
      return;
    }

    // PAYLOAD COM CAMPO isFuncionario
    const payload: any = {
      nome: formValue.nome.trim(),
      cpf: cpfLimpo,
      email: formValue.email.trim(),
      senha: formValue.senha,
      telefone: telefoneLimpo,
      isFuncionario: this.isFuncionario  // ✅ ADICIONADO
    };

    // Incluir endereço apenas se checkbox marcado e campos preenchidos
    if (this.incluirEndereco && formValue.endereco.cep) {
      const cepLimpo = String(formValue.endereco.cep).replace(/\D/g, '');

      // Validar CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        this.errorMessage = 'CEP deve ter 8 dígitos';
        this.loading = false;
        return;
      }

      payload.endereco = {
        cep: cepLimpo,
        logradouro: formValue.endereco.logradouro.trim(),
        numero: formValue.endereco.numero.trim(),
        complemento: formValue.endereco.complemento ? formValue.endereco.complemento.trim() : null,
        bairro: formValue.endereco.bairro.trim(),
        cidade: formValue.endereco.cidade.trim(),
        estado: formValue.endereco.estado
      };
    }

    // DETERMINAR A URL CORRETA BASEADO NO TOGGLE
    const apiUrl = this.isFuncionario ? this.apiUrlFuncionario : this.apiUrlCliente;

    // LOGS DETALHADOS
    console.log('═══════════════════════════════════════════');
    console.log('📤 ENVIANDO REQUISIÇÃO');
    console.log('═══════════════════════════════════════════');
    console.log('👤 Tipo:', this.isFuncionario ? 'FUNCIONÁRIO' : 'CLIENTE');
    console.log('🔗 URL:', apiUrl);
    console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));
    console.log('═══════════════════════════════════════════');

    this.http.post(apiUrl, payload).subscribe({
      next: (response) => {
        console.log(`✅ ${this.tipoUsuario} criado com sucesso:`, response);
        alert(`${this.tipoUsuario} cadastrado com sucesso!`);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        console.error('═══════════════════════════════════════════');
        console.error(`❌ ERRO ao criar ${this.tipoUsuario}`);
        console.error('═══════════════════════════════════════════');
        console.error('Status:', error.status);
        console.error('Mensagem:', error.error);
        console.error('URL chamada:', apiUrl);
        console.error('═══════════════════════════════════════════');

        // Mensagem de erro específica
        if (error.status === 400) {
          const errorMsg = error.error?.message || '';

          if (errorMsg.includes('CPF') || errorMsg.includes('cpf')) {
            this.errorMessage = 'CPF inválido ou já cadastrado no sistema.';
          } else if (errorMsg.includes('email')) {
            this.errorMessage = 'Email já cadastrado no sistema.';
          } else if (errorMsg.includes('Duplicate entry')) {
            this.errorMessage = 'CPF ou Email já cadastrado no sistema.';
          } else {
            this.errorMessage = errorMsg || 'Dados inválidos. Verifique os campos e tente novamente.';
          }
        } else if (error.status === 403) {
          this.errorMessage = 'Sem permissão para criar funcionário. Apenas funcionários podem criar outros funcionários.';
        } else if (error.status === 401) {
          this.errorMessage = 'Não autorizado. Faça login novamente.';
        } else {
          this.errorMessage = `Erro ao cadastrar ${this.tipoUsuario.toLowerCase()}. Tente novamente.`;
        }

        this.loading = false;
      }
    });
  }


  cancelar(): void {
    if (confirm('Deseja realmente cancelar? Os dados não serão salvos.')) {
      this.router.navigate(['/admin/usuarios']);
    }
  }


  // Navegações
  goToAdminHome(): void {
    this.router.navigate(['/admin/home']);
  }


  goToUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }


  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }


  goToVeiculosAdmin(): void {
    this.router.navigate(['/admin/veiculos']);
  }


  goToGerenciarLocacoes(): void {
    this.router.navigate(['/admin/locacoes']);
  }


  logout(): void {
    this.authService.logout();
  }
}
