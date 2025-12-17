import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(m => m.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    {
        path: 'cadastro',
        loadComponent: () => import('./components/cadastro/cadastro').then(m => m.Cadastro)
    },
    {
        path: 'perfil',
        loadComponent: () => import('./components/perfil/perfil').then(m => m.Perfil)
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
