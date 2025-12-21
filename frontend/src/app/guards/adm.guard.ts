import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canActivate(): boolean {
    let user = this.auth.getCurrentUser();

    // Fallback: se currentUser ainda for null, tenta pegar do localStorage
    if (!user) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        user = JSON.parse(userData);
      }
    }

    console.log('🛡️ AdminGuard - usuário:', user);

    if (!user || !user.isFuncionario) {
      console.log('❌ AdminGuard bloqueou acesso');
      this.router.navigate(['/home']);
      return false;
    }

    console.log('✅ AdminGuard liberou acesso');
    return true;
  }
}
