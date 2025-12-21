import { Routes } from '@angular/router';
import { VeiculoDetalhesComponent } from './components/veiculo-detalhes/veiculo-detalhes';
import { AdminGuard } from './guards/adm.guard';
import { ClienteGuard } from './guards/cliente.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // ========== ROTAS PÚBLICAS (sem guard) ==========
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./components/cadastro/cadastro').then(m => m.Cadastro)
  },

  // ========== ROTAS DE CLIENTE (bloqueia funcionário) ==========
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home').then(m => m.Home),
    canActivate: [ClienteGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil/perfil').then(m => m.Perfil),
    canActivate: [ClienteGuard]
  },
  {
    path: 'veiculos',
    loadComponent: () =>
      import('./components/pesquisa-veiculos/pesquisa-veiculos').then(m => m.PesquisaVeiculosComponent),
    canActivate: [ClienteGuard]
  },
  {
    path: 'veiculo/:id',
    component: VeiculoDetalhesComponent,
    canActivate: [ClienteGuard]
  },

  // ========== ROTAS DE ADMIN (só funcionário) ==========
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home-funcionario/home-funcionario').then(m => m.HomeFuncionario)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./components/admin-usuarios/admin-usuarios').then(m => m.AdminUsuariosComponent)
      },
      {
        path: 'usuarios/novo',
        loadComponent: () =>
          import('./components/criar-funcionario/criar-funcionario').then(m => m.CriarFuncionarioComponent)
      }
    ]
  },

  // ========== FALLBACK ==========
  {
    path: '**',
    redirectTo: '/home'
  }
];
