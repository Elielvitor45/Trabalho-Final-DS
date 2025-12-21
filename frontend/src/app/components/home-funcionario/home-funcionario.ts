import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home-funcionario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-funcionario.html',
  styleUrls: ['./home-funcionario.css']
})
export class HomeFuncionario implements OnInit, OnDestroy {
  userName: string | null = null;
  isAuthenticated = false;
  isFuncionario = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAuthenticated = !!user;
        this.userName = user?.nome || null;
        this.isFuncionario = !!user?.isFuncionario;

        // Se alguém tentar acessar essa tela sem ser funcionário, redireciona
        if (this.isAuthenticated && !this.isFuncionario) {
          this.router.navigate(['/']); // home normal do cliente
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get firstName(): string {
    return this.userName ? this.userName.split(' ')[0] : '';
  }

  // Navegações do painel
  goToDashboard(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  goToFuncionarios(): void {
    this.router.navigate(['/admin/usuarios']);  // <- CORRIGIDO
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
