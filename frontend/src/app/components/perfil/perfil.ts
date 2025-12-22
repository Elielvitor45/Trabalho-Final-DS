import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { UsuarioPerfil } from '../../models/user.model';
import { EstatisticasDTO } from '../../dto/auth.dto';
import { LocacaoDTO, StatusLocacao } from '../../dto/locacao.dto';
import { VeiculoDTO } from '../../dto/veiculo.dto';
import { LocacaoService } from '../../services/locacao';
import { VeiculoService } from '../../services/veiculo';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  
  loading = true;
  errorMessage = '';
  successMessage = '';
  user: UsuarioPerfil | null = null;
  
  // Edição de endereço
  editandoEndereco = false;
  salvandoEndereco = false;
  enderecoForm!: FormGroup;

  // Edição de dados pessoais
  editandoDadosPessoais = false;
  salvandoDadosPessoais = false;
  dadosPessoaisForm!: FormGroup;

  locacoes: LocacaoDTO[] = [];
  estatisticas: EstatisticasDTO | null = null;
  loadingLocacoes = false;
  loadingEstatisticas = false;
  mostrarHistorico = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private locacaoService: LocacaoService,
    private veiculoService: VeiculoService,
    private http: HttpClient
  ) {
    this.initEnderecoForm();
    this.initDadosPessoaisForm();
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

  initDadosPessoaisForm(): void {
    this.dadosPessoaisForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['']
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

  loadEstatisticas(): void {
    this.loadingEstatisticas = true;

    this.authService.getEstatisticas().subscribe({
      next: (data) => {
        console.log('📊 Estatísticas recebidas do backend:', data);
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

  loadHistoricoLocacoes(): void {
    if (this.locacoes.length > 0) {
      this.mostrarHistorico = !this.mostrarHistorico;
      return;
    }

    this.loadingLocacoes = true;
    this.mostrarHistorico = true;

    this.authService.getHistoricoLocacoes().subscribe({
      next: (data: any) => {
        this.locacoes = data as LocacaoDTO[];
        console.log('📜 Locações carregadas:', this.locacoes);

        if (this.estatisticas && this.estatisticas.valorTotalGasto === 0 && this.locacoes.length > 0) {
          console.warn('⚠️ Backend retornou valorTotalGasto = 0, recalculando...');
          this.calcularEstatisticasManualmente();
        }

        this.loadingLocacoes = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.loadingLocacoes = false;
        this.mostrarHistorico = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calcularEstatisticasManualmente(): void {
    if (!this.locacoes || this.locacoes.length === 0) {
      console.warn('⚠️ Nenhuma locação para calcular');
      return;
    }

    let totalGasto = 0;
    let ativas = 0;
    let finalizadas = 0;

    this.locacoes.forEach(locacao => {
      console.log(`Locação ID ${locacao.id}: R$ ${locacao.valorTotal} - Status: ${locacao.status}`);

      if (locacao.valorTotal) {
        totalGasto += locacao.valorTotal;
      }

      if (locacao.status === 'ATIVA') {
        ativas++;
      } else if (locacao.status === 'FINALIZADA') {
        finalizadas++;
      }
    });

    this.estatisticas = {
      totalLocacoes: this.locacoes.length,
      locacoesAtivas: ativas,
      locacoesFinalizadas: finalizadas,
      valorTotalGasto: totalGasto
    };

    console.log('✅ Estatísticas recalculadas manualmente:', this.estatisticas);
    this.cdr.detectChanges();
  }

  // ==================== DADOS PESSOAIS ====================

  iniciarEdicaoDadosPessoais(): void {
    this.editandoDadosPessoais = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.user) {
      this.dadosPessoaisForm.patchValue({
        nome: this.user.nome,
        telefone: this.user.telefone || ''
      });
    }
  }

  cancelarEdicaoDadosPessoais(): void {
    this.editandoDadosPessoais = false;
    this.dadosPessoaisForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  salvarDadosPessoais(): void {
    if (this.dadosPessoaisForm.invalid || !this.user) {
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.salvandoDadosPessoais = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      nome: this.dadosPessoaisForm.value.nome.trim(),
      telefone: this.dadosPessoaisForm.value.telefone ? this.dadosPessoaisForm.value.telefone.trim() : null,
      dataNascimento: this.user.dataNascimento || null,
      email: this.user.email,
      cpf: this.user.cpf,
      senha: this.user.senha || 'senha-nao-alterada-placeholder-123'
    };

    console.log('💾 Salvando alterações dos dados pessoais:', payload);

    this.http.put(`${this.apiUrl}/perfil`, payload).subscribe({
      next: (response) => {
        console.log('✅ Dados pessoais atualizados com sucesso:', response);
        this.successMessage = 'Dados atualizados com sucesso!';
        this.salvandoDadosPessoais = false;
        this.editandoDadosPessoais = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadUserProfile();
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar dados pessoais:', error);
        this.errorMessage = error.error?.message || error.error?.senha || 'Erro ao atualizar dados. Tente novamente.';
        this.salvandoDadosPessoais = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== ENDEREÇO ====================

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
      this.markFormAsTouched(this.enderecoForm);
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
        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadUserProfile();
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        console.error('Erro ao salvar endereço:', error);
        this.errorMessage = error.error?.message || 'Erro ao salvar endereço. Tente novamente.';
        this.salvandoEndereco = false;
        this.cdr.detectChanges();
      }
    });
  }

  markFormAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  // ==================== FORMATAÇÃO ====================

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

  // ==================== HISTÓRICO ====================

  getStatusClass(status: StatusLocacao): string {
    switch (status) {
      case 'ATIVA':
        return 'status-ativa';
      case 'FINALIZADA':
        return 'status-finalizada';
      case 'CANCELADA':
        return 'status-cancelada';
      default:
        return 'status-default';
    }
  }

  formatarData(data: string | Date): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  formatarValor(valor: number): string {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  desativarLocacao(locacao: LocacaoDTO): void {
    if (!locacao.id) {
      console.error('ID da locação não encontrado');
      return;
    }

    if (confirm(`Deseja finalizar esta locação e marcar o veículo como disponível?`)) {
      this.locacaoService.finalizarLocacao(locacao.id).subscribe({
        next: () => {
          console.log('Locação finalizada com sucesso');

          if (locacao.veiculo?.id) {
            this.veiculoService.updateDisponibilidade(locacao.veiculo.id, true).subscribe({
              next: (veiculoAtualizado: VeiculoDTO) => {
                console.log('Veículo marcado como disponível:', veiculoAtualizado);
                this.atualizarPagina();
              },
              error: (err) => {
                console.error('Erro ao atualizar disponibilidade:', err);
                this.atualizarPagina();
              }
            });
          } else {
            this.atualizarPagina();
          }
        },
        error: (err) => {
          console.error('Erro ao finalizar locação:', err);
          alert('Erro ao finalizar a locação. Tente novamente.');
        }
      });
    }
  }

  private atualizarPagina(): void {
    this.locacoes = [];
    this.mostrarHistorico = false;
    this.loadEstatisticas();
    this.loadHistoricoLocacoes();
    this.cdr.detectChanges();
    console.log('✅ Página atualizada com sucesso');
  }

  // ==================== NAVEGAÇÃO ====================

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
  }
}
