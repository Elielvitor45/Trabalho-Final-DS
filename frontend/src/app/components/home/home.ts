import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  userName: string | null = null;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: Auth,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAuthenticated = !!user;
        this.userName = user?.nome || null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  /**
   * Navega para a página inicial (recarrega a home)
   */
  goToHome(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navega para o perfil do usuário
   */
  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  /**
   * Navega para a página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navega para a página de pesquisa de veículos
   */
  goToVeiculos(): void {
    this.router.navigate(['/veiculos']);
  }

  /**
   * Navega para pesquisa com filtro de categoria
   */
  goToVeiculosPorCategoria(categoria: string): void {
    this.router.navigate(['/veiculos'], { 
      queryParams: { categoria: categoria } 
    });
  }

  /**
   * Scroll suave até a seção de serviços
   */
  scrollToServices(): void {
    const element = document.getElementById('servicos');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  /**
   * Scroll suave até a seção de contato
   */
  scrollToContact(): void {
    const element = document.getElementById('contato');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.authService.logout();
  }
}
