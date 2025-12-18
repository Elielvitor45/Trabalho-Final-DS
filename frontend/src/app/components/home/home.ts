import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  userName: string | null = null;
  isAuthenticated = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user?.nome || null;
    });
  }

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

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

  logout(): void {
    this.authService.logout();
  }
}
