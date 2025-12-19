import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaVeiculo, VeiculoDTO } from '../../dto/veiculo.dto';
import { Auth } from '../../services/auth';
import { VeiculoService } from '../../services/veiculo';

type ModoVisualizacao = 'grid' | 'lista' | 'tabela';

@Component({
  selector: 'app-pesquisa-veiculos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pesquisa-veiculos.html',
  styleUrls: ['./pesquisa-veiculos.css']
})
export class PesquisaVeiculosComponent implements OnInit {
  userName: string | null = null;
  isAuthenticated = false;

  veiculos: VeiculoDTO[] = [];
  veiculosFiltrados: VeiculoDTO[] = [];
  loading = false;
  errorMessage = '';

  categorias: CategoriaVeiculo[] = ['Econômico', 'Intermediário', 'SUV', 'Luxo', 'Esportivo'];
  categoriaSelecionada: string = 'Todos';
  termoPesquisa: string = '';
  
  // Modo de visualização
  modoVisualizacao: ModoVisualizacao = 'grid';

  constructor(
    private veiculoService: VeiculoService,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user?.nome || null;
    });

    this.loadVeiculos();

    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.categoriaSelecionada = params['categoria'];
        this.aplicarFiltros();
      }
    });
  }

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  loadVeiculos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.veiculoService.getVeiculosDisponiveis().subscribe({
      next: (data) => {
        this.veiculos = data || [];
        this.veiculosFiltrados = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.errorMessage = 'Erro ao carregar veículos. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.aplicarFiltros();
    this.atualizarURL();
  }

  pesquisar(): void {
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.veiculos];

    if (this.categoriaSelecionada !== 'Todos') {
      resultado = resultado.filter(v => v.categoria === this.categoriaSelecionada);
    }

    if (this.termoPesquisa.trim()) {
      const termo = this.termoPesquisa.toLowerCase();
      resultado = resultado.filter(v =>
        v.modelo.toLowerCase().includes(termo) ||
        v.marca.toLowerCase().includes(termo) ||
        v.categoria.toLowerCase().includes(termo)
      );
    }

    this.veiculosFiltrados = resultado;
  }

  private atualizarURL(): void {
    if (this.categoriaSelecionada === 'Todos') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: this.categoriaSelecionada },
        replaceUrl: true
      });
    }
  }

  limparFiltros(): void {
    this.categoriaSelecionada = 'Todos';
    this.termoPesquisa = '';
    this.veiculosFiltrados = [...this.veiculos];
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  /**
   * Muda o modo de visualização
   */
  mudarVisualizacao(modo: ModoVisualizacao): void {
    this.modoVisualizacao = modo;
  }

  /**
   * Retorna a imagem do veículo (placeholder por enquanto)
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

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

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

  alugarVeiculo(veiculoId: number): void {
    if (!this.isAuthenticated) {
      localStorage.setItem('veiculoIntencao', veiculoId.toString());
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/veiculo', veiculoId], { 
        queryParams: { alugar: 'true' } 
      });
    }
  }

  verDetalhes(veiculoId: number): void {
    this.router.navigate(['/veiculo', veiculoId]);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
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
