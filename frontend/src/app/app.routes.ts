import { Component } from '@angular/core';
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
        path: 'veiculos',
        loadComponent: () => import('./components/pesquisa-veiculos/pesquisa-veiculos').then(m => m.PesquisaVeiculosComponent)
    },
    // {
    //     path: 'veiculo/:id',
    //     loadComponent: () => import('./components/pesquisa-veiculos/pesquisa-veiculos').then(m => m.DetalhesVeiculoComponent)
    //     // TODO: Criar este componente depois
    // },
    {
        path: '**',
        redirectTo: '/home'
    }
];
