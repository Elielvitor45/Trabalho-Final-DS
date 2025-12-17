import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Jwt } from '../services/jwt';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(Jwt);
  const token = jwtService.getToken();

  console.log('🔐 Interceptor chamado para:', req.url);
  console.log('📝 Token encontrado:', token ? 'SIM' : 'NÃO');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Token adicionado ao header');
    return next(cloned);
  }

  console.log('⚠️ Requisição sem token');
  return next(req);
};
