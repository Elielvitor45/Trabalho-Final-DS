import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { UsuarioPerfil } from '../../models/user.model';
import { EstatisticasDTO, LocacaoDTO } from '../../dto/auth.dto';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {
  loading = true;
  errorMessage = '';
  successMessage = '';
  user: UsuarioPerfil | null = null;
  editandoEndereco = false;
  salvandoEndereco = false;
  enderecoForm!: FormGroup;

  // Novas propriedades
  locacoes: LocacaoDTO[] = [];
  estatisticas: EstatisticasDTO | null = null;
  loadingLocacoes = false;
  loadingEstatisticas = false;
  mostrarHistorico = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initEnderecoForm();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadUserProfile();
    this.loadEstatisticas();
  }

  initEnderecoForm(): void {
    this.enderecoForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]]
    });
  }

  loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar perfil. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
      }
    });
  }

  // Nova função: carregar estatísticas
  loadEstatisticas(): void {
    this.loadingEstatisticas = true;
    this.authService.getEstatisticas().subscribe({
      next: (data) => {
        this.estatisticas = data;
        this.loadingEstatisticas = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.loadingEstatisticas = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Nova função: carregar histórico de locações
  loadHistoricoLocacoes(): void {
    if (this.locacoes.length > 0) {
      this.mostrarHistorico = !this.mostrarHistorico;
      return;
    }

    this.loadingLocacoes = true;
    this.authService.getHistoricoLocacoes().subscribe({
      next: (data) => {
        this.locacoes = data;
        this.mostrarHistorico = true;
        this.loadingLocacoes = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.loadingLocacoes = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'ativa':
      case 'em andamento':
        return 'status-ativa';
      case 'finalizada':
      case 'concluída':
        return 'status-finalizada';
      case 'cancelada':
        return 'status-cancelada';
      default:
        return 'status-default';
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  iniciarEdicaoEndereco(): void {
    this.editandoEndereco = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.user?.endereco) {
      this.enderecoForm.patchValue({
        cep: this.user.endereco.cep,
        logradouro: this.user.endereco.logradouro,
        numero: this.user.endereco.numero,
        complemento: this.user.endereco.complemento || '',
        bairro: this.user.endereco.bairro,
        cidade: this.user.endereco.cidade,
        estado: this.user.endereco.estado
      });
    } else {
      this.enderecoForm.reset();
    }
  }

  cancelarEdicaoEndereco(): void {
    this.editandoEndereco = false;
    this.enderecoForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  salvarEndereco(): void {
    if (this.enderecoForm.invalid) {
      this.markFormAsTouched();
      return;
    }
    
    this.salvandoEndereco = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const enderecoData = this.enderecoForm.value;
    
    this.authService.updateEndereco(enderecoData).subscribe({
      next: () => {
        this.successMessage = 'Endereço salvo com sucesso!';
        this.salvandoEndereco = false;
        this.editandoEndereco = false;
        setTimeout(() => {
          this.loadUserProfile();
          this.successMessage = '';
        }, 2000);
        this.goToPerfil();
      },
      error: (error) => {
        console.error('Erro ao salvar endereço:', error);
        this.errorMessage = error.error?.message || 'Erro ao salvar endereço. Tente novamente.';
        this.salvandoEndereco = false;
      }
    });
  }

  markFormAsTouched(): void {
    Object.keys(this.enderecoForm.controls).forEach(key => {
      this.enderecoForm.get(key)?.markAsTouched();
    });
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatTelefone(tel: string): string {
    if (!tel) return '';
    if (tel.length === 11) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  formatCEP(cep: string): string {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  formatCEPInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value;
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.authService.logout();
  }
}