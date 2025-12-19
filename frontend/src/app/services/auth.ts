import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Jwt } from './jwt';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, EstatisticasDTO, LoginRequest, RegisterRequest } from '../dto/auth.dto';
import { Usuario, UsuarioPerfil } from '../models/user.model';
import { LocacaoDTO } from './locacao';  // ✅ IMPORT CORRETO

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8080/api/auth';
  private usuariosUrl = 'http://localhost:8080/api/usuarios';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtService: Jwt,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.jwtService.getToken();
    if (token && !this.jwtService.isTokenExpired()) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUserSubject.next(JSON.parse(userData));
      }
    }
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  getUserProfile(): Observable<UsuarioPerfil> {
    return this.http.get<UsuarioPerfil>(`${this.usuariosUrl}/perfil`);
  }

  updateEndereco(data: any): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/endereco`, data);
  }

  /**
   * Busca o histórico de locações do usuário autenticado
   * GET /api/usuarios/locacoes
   */
  getHistoricoLocacoes(): Observable<LocacaoDTO[]> {
    return this.http.get<LocacaoDTO[]>(`${this.usuariosUrl}/locacoes`);
  }

  /**
   * Busca as estatísticas do usuário autenticado
   * GET /api/usuarios/estatisticas
   */
  getEstatisticas(): Observable<EstatisticasDTO> {
    return this.http.get<EstatisticasDTO>(`${this.usuariosUrl}/estatisticas`);
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.jwtService.saveToken(response.token);
    const userData: Usuario = {
      id: response.id,
      nome: response.nome,
      email: response.email
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  logout(): void {
    this.jwtService.destroyToken();
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    const token = this.jwtService.getToken();
    return !!token && !this.jwtService.isTokenExpired();
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }
}
