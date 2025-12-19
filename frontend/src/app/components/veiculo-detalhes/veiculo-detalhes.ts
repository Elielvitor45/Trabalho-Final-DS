import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VeiculoDTO } from '../../dto/veiculo.dto';
import { LocacaoCreateDTO } from '../../services/locacao';
import { VeiculoService } from '../../services/veiculo';
import { Locacao } from '../../services/locacao';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-veiculo-detalhes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './veiculo-detalhes.html',
  styleUrls: ['./veiculo-detalhes.css']
})
export class VeiculoDetalhesComponent implements OnInit, OnDestroy {
  veiculo: VeiculoDTO | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Autenticação
  isAuthenticated = false;
  userName: string | null = null;

  // Modo de visualização
  modoAlugar = false; // Define se está no modo "alugar" ou apenas "ver detalhes"

  // Formulário de locação
  dataRetirada: string = '';
  dataDevolucao: string = '';
  observacoes: string = '';
  valorTotal: number = 0;
  diasLocacao: number = 0;

  // Data mínima (hoje)
  dataMinima: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private veiculoService: VeiculoService,
    private locacaoService: Locacao,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {
    // Define data mínima como hoje
    const hoje = new Date();
    this.dataMinima = hoje.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Verifica autenticação
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAuthenticated = !!user;
        this.userName = user?.nome || null;
      });

    // Verifica se veio para alugar
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.modoAlugar = params['alugar'] === 'true';
      });

    // Carrega detalhes do veículo
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadVeiculo(Number(id));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  /**
   * Carrega detalhes do veículo
   */
  loadVeiculo(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.veiculoService.getVeiculoById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.veiculo = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar veículo:', error);
          this.errorMessage = 'Erro ao carregar detalhes do veículo.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Calcula valor total quando as datas mudam
   */
  calcularValor(): void {
    if (!this.veiculo || !this.dataRetirada || !this.dataDevolucao) {
      this.valorTotal = 0;
      this.diasLocacao = 0;
      return;
    }

    const retirada = new Date(this.dataRetirada);
    const devolucao = new Date(this.dataDevolucao);
    
    if (devolucao <= retirada) {
      this.valorTotal = 0;
      this.diasLocacao = 0;
      return;
    }

    this.diasLocacao = Math.ceil((devolucao.getTime() - retirada.getTime()) / (1000 * 60 * 60 * 24));
    this.valorTotal = this.diasLocacao * this.veiculo.valorDiaria;
  }
  /**
 * Retorna a imagem do veículo
 */
getImagemVeiculo(veiculo: VeiculoDTO): string {
  const imagensPorCategoria: { [key: string]: string } = {
    'Econômico': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&auto=format',
    'Intermediário': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop&auto=format',
    'SUV': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop&auto=format',
    'Luxo': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&auto=format',
    'Esportivo': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format'
  };
  
  return imagensPorCategoria[veiculo.categoria] || imagensPorCategoria['Econômico'];
}

  /**
   * Valida formulário
   */
  validarFormulario(): boolean {
    if (!this.dataRetirada || !this.dataDevolucao) {
      this.errorMessage = 'Por favor, selecione as datas de retirada e devolução.';
      return false;
    }

    const retirada = new Date(this.dataRetirada);
    const devolucao = new Date(this.dataDevolucao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (retirada < hoje) {
      this.errorMessage = 'A data de retirada não pode ser no passado.';
      return false;
    }

    if (devolucao <= retirada) {
      this.errorMessage = 'A data de devolução deve ser posterior à data de retirada.';
      return false;
    }

    return true;
  }

  /**
   * Realiza a locação
   */
  alugarVeiculo(): void {
    if (!this.isAuthenticated) {
      localStorage.setItem('veiculoIntencao', this.veiculo!.id.toString());
      this.router.navigate(['/login']);
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const locacao: LocacaoCreateDTO = {
      veiculoId: this.veiculo!.id,
      dataRetirada: this.dataRetirada,
      dataDevolucao: this.dataDevolucao,
      observacoes: this.observacoes || undefined
    };

    this.locacaoService.criarLocacao(locacao)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Locação realizada com sucesso!';
          this.loading = false;
          this.cdr.detectChanges();
          
          // Redireciona para o perfil após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/perfil']);
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao criar locação:', error);
          this.errorMessage = error.error?.message || 'Erro ao realizar locação. Tente novamente.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Redireciona para o modo alugar
   */
  irParaAlugar(): void {
    if (!this.isAuthenticated) {
      localStorage.setItem('veiculoIntencao', this.veiculo!.id.toString());
      this.router.navigate(['/login']);
      return;
    }

    // Recarrega a mesma página mas com query param alugar=true
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { alugar: 'true' },
      queryParamsHandling: 'merge'
    });
    this.modoAlugar = true;
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Retorna ícone baseado na categoria
   */
  getIconeCategoria(categoria: string): string {
    const icones: { [key: string]: string } = {
      'Econômico': '🚗',
      'Intermediário': '🚙',
      'SUV': '🚙',
      'Luxo': '🚘',
      'Esportivo': '🏎️'
    };
    return icones[categoria] || '🚗';
  }

  // Navegação
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToVeiculos(): void {
    this.router.navigate(['/veiculos']);
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
  }
}
