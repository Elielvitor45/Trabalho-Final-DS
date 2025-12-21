import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class ClienteGuard implements CanActivate {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.auth.getCurrentUser();

    // Se não estiver logado, permite (para login/cadastro)
    if (!user) {
      return true;
    }

    // Se for funcionário, bloqueia e manda para painel admin
    if (user.isFuncionario) {
      this.router.navigate(['/admin/home']);
      return false;
    }

    // Cliente normal pode acessar
    return true;
  }
}
