import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaVeiculo, VeiculoDTO } from '../../dto/veiculo.dto';
import { Auth } from '../../services/auth';
import { VeiculoService } from '../../services/veiculo';

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
  loading = true;
  errorMessage = '';

  categorias: CategoriaVeiculo[] = ['Econômico', 'Intermediário', 'SUV', 'Luxo', 'Esportivo'];
  categoriaSelecionada: string = 'Todos';
  termoPesquisa: string = '';

  constructor(
    private veiculoService: VeiculoService,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Verifica autenticação
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user?.nome || null;
    });

    // Carrega veículos disponíveis
    this.loadVeiculos();

    // Verifica se há filtro de categoria via queryParams
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

  /**
   * Carrega todos os veículos disponíveis
   */
  loadVeiculos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.veiculoService.getVeiculosDisponiveis().subscribe({
      next: (data) => {
        this.veiculos = data;
        this.veiculosFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.errorMessage = 'Erro ao carregar veículos. Tente novamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Filtra veículos por categoria
   */
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.aplicarFiltros();
  }

  /**
   * Busca veículos por termo de pesquisa
   */
  pesquisar(): void {
    this.aplicarFiltros();
  }

  /**
   * Aplica todos os filtros (categoria + pesquisa)
   */
  private aplicarFiltros(): void {
    let resultado = [...this.veiculos];

    // Filtro por categoria
    if (this.categoriaSelecionada !== 'Todos') {
      resultado = resultado.filter(v => v.categoria === this.categoriaSelecionada);
    }

    // Filtro por termo de pesquisa
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

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.categoriaSelecionada = 'Todos';
    this.termoPesquisa = '';
    this.veiculosFiltrados = [...this.veiculos];
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

  /**
   * Ação ao clicar em "Alugar"
   * Se não autenticado, redireciona para login
   * Se autenticado, vai para o perfil do carro
   */
  alugarVeiculo(veiculoId: number): void {
    if (!this.isAuthenticated) {
      // Salva ID do veículo para redirecionar após login
      localStorage.setItem('veiculoIntencao', veiculoId.toString());
      this.router.navigate(['/login']);
    } else {
      // TODO: Redirecionar para perfil do carro (será implementado)
      this.router.navigate(['/veiculo', veiculoId]);
    }
  }

  /**
   * Navega para detalhes do veículo
   */
  verDetalhes(veiculoId: number): void {
    this.router.navigate(['/veiculo', veiculoId]);
  }

  // Navegação
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
