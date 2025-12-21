import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  isFuncionario: boolean;
  ativo: boolean;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuariosComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  usuarioParaDesativar: Usuario | null = null;
  usuarioParaAtivar: Usuario | null = null;

  editForm!: FormGroup;
  modoEdicao = false;

  searchTerm = '';
  filtroAtivo: 'todos' | 'clientes' | 'funcionarios' | 'inativos' = 'todos';

  loading = false;
  desativando = false;
  ativando = false;
  salvando = false;
  modalDetalhesAberto = false;
  modalConfirmarDesativarAberto = false;
  modalConfirmarAtivarAberto = false;

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.criarFormulario();
  }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  criarFormulario(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      senha: [''],
      cpf: [{ value: '', disabled: true }],
      endereco: this.fb.group({
        cep: [''],
        logradouro: [''],
        numero: [''],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['']
      })
    });
  }

  get firstName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nome ? user.nome.split(' ')[0] : '';
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalClientes(): number {
    return this.usuarios.filter(u => !u.isFuncionario).length;
  }

  get totalFuncionarios(): number {
    return this.usuarios.filter(u => u.isFuncionario).length;
  }

  get totalInativos(): number {
    return this.usuarios.filter(u => !u.ativo).length;
  }

  carregarUsuarios(): void {
    this.loading = true;
    console.log('🔄 Carregando usuários...');

    this.http.get<Usuario[]>(this.apiUrl).subscribe({
      next: (usuarios) => {
        console.log('✅ Usuários carregados:', usuarios);
        this.usuarios = usuarios;
        this.filtrarUsuarios();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários. Tente novamente.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarUsuarios(): void {
    let resultado = [...this.usuarios];

    if (this.filtroAtivo === 'clientes') {
      resultado = resultado.filter(u => !u.isFuncionario);
    } else if (this.filtroAtivo === 'funcionarios') {
      resultado = resultado.filter(u => u.isFuncionario);
    } else if (this.filtroAtivo === 'inativos') {
      resultado = resultado.filter(u => !u.ativo);
    }

    if (this.searchTerm.trim()) {
      const termo = this.searchTerm.toLowerCase();
      resultado = resultado.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.cpf.includes(termo)
      );
    }

    this.usuariosFiltrados = resultado;
  }

  filtrarPorTipo(tipo: 'todos' | 'clientes' | 'funcionarios' | 'inativos'): void {
    this.filtroAtivo = tipo;
    this.filtrarUsuarios();
  }

  visualizarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    this.modoEdicao = false;
    
    this.editForm.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      senha: '',
      cpf: usuario.cpf,
      endereco: usuario.endereco || {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
    });

    this.modalDetalhesAberto = true;
  }

  ativarModoEdicao(): void {
    this.modoEdicao = true;
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    if (this.usuarioSelecionado) {
      this.editForm.patchValue({
        nome: this.usuarioSelecionado.nome,
        email: this.usuarioSelecionado.email,
        telefone: this.usuarioSelecionado.telefone || '',
        senha: '',
        endereco: this.usuarioSelecionado.endereco || {}
      });
    }
  }

  salvarAlteracoes(): void {
    if (this.editForm.invalid || !this.usuarioSelecionado) {
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.salvando = true;
    const formValue = this.editForm.getRawValue();
    const id = this.usuarioSelecionado.id;

    const payload: any = {
      nome: formValue.nome.trim(),
      email: formValue.email.trim(),
      telefone: formValue.telefone ? formValue.telefone.trim() : null,
      cpf: formValue.cpf,
      senha: formValue.senha || 'senha-nao-alterada-placeholder-123',
      isFuncionario: this.usuarioSelecionado.isFuncionario,
      ativo: this.usuarioSelecionado.ativo
    };

    if (formValue.endereco && formValue.endereco.cep) {
      payload.endereco = {
        cep: formValue.endereco.cep.trim(),
        logradouro: formValue.endereco.logradouro.trim(),
        numero: formValue.endereco.numero.trim(),
        complemento: formValue.endereco.complemento ? formValue.endereco.complemento.trim() : null,
        bairro: formValue.endereco.bairro.trim(),
        cidade: formValue.endereco.cidade.trim(),
        estado: formValue.endereco.estado
      };
    }

    console.log('💾 Salvando alterações do usuário:', payload);

    this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
      next: (response) => {
        console.log('✅ Usuário atualizado com sucesso:', response);
        alert('Usuário atualizado com sucesso!');
        this.modoEdicao = false;
        this.salvando = false;
        this.carregarUsuarios();
        this.fecharModalDetalhes();
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar usuário:', error);
        alert(error.error?.message || error.error?.senha || 'Erro ao atualizar usuário. Tente novamente.');
        this.salvando = false;
      }
    });
  }

  fecharModalDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.usuarioSelecionado = null;
    this.modoEdicao = false;
    this.editForm.reset();
  }

  confirmarDesativar(usuario: Usuario | null): void {
    if (!usuario) return;

    this.usuarioParaDesativar = usuario;
    this.modalConfirmarDesativarAberto = true;
    this.modalDetalhesAberto = false;
  }

  fecharModalConfirmarDesativar(): void {
    this.modalConfirmarDesativarAberto = false;
    this.usuarioParaDesativar = null;
  }

  desativarUsuario(): void {
    if (!this.usuarioParaDesativar) return;

    this.desativando = true;
    const id = this.usuarioParaDesativar.id;

    this.http.patch(`${this.apiUrl}/${id}/desativar`, {}).subscribe({
      next: () => {
        console.log('✅ Usuário desativado com sucesso');
        alert('Usuário desativado com sucesso!');
        this.carregarUsuarios();
        this.fecharModalConfirmarDesativar();
        this.desativando = false;
      },
      error: (error) => {
        console.error('❌ Erro ao desativar usuário:', error);
        alert(error.error?.message || 'Erro ao desativar usuário. Tente novamente.');
        this.desativando = false;
      }
    });
  }

  confirmarAtivar(usuario: Usuario | null): void {
    if (!usuario) return;

    this.usuarioParaAtivar = usuario;
    this.modalConfirmarAtivarAberto = true;
    this.modalDetalhesAberto = false;
  }

  fecharModalConfirmarAtivar(): void {
    this.modalConfirmarAtivarAberto = false;
    this.usuarioParaAtivar = null;
  }

  ativarUsuario(): void {
    if (!this.usuarioParaAtivar) return;

    this.ativando = true;
    const id = this.usuarioParaAtivar.id;

    this.http.patch(`${this.apiUrl}/${id}/ativar`, {}).subscribe({
      next: () => {
        console.log('✅ Usuário ativado com sucesso');
        alert('Usuário ativado com sucesso!');
        this.carregarUsuarios();
        this.fecharModalConfirmarAtivar();
        this.ativando = false;
      },
      error: (error) => {
        console.error('❌ Erro ao ativar usuário:', error);
        alert(error.error?.message || 'Erro ao ativar usuário. Tente novamente.');
        this.ativando = false;
      }
    });
  }

  abrirModalCriar(): void {
    this.router.navigate(['/admin/usuarios/novo']);
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  getInitials(nome: string): string {
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }

  goToAdminHome(): void {
    this.router.navigate(['/admin/home']);
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
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
