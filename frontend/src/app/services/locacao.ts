import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTOs
export interface LocacaoCreateDTO {
  veiculoId: number;
  dataRetirada: string;
  dataDevolucao: string;
  observacoes?: string;
}

export interface LocacaoDTO {
  id: number;
  dataRetirada: string;
  dataDevolucao: string;
  observacoes?: string;
  valorTotal: number;
  status: StatusLocacao;
  veiculo: any;
  usuario: any;
}

export type StatusLocacao = 'ATIVA' | 'FINALIZADA' | 'CANCELADA';

export interface ResumoLocacaoDTO {
  total: number;
  ativas: number;
  finalizadas: number;
  canceladas: number;
  valorTotalGasto: number;
}

@Injectable({
  providedIn: 'root',
})
export class Locacao {
  private apiUrl = 'http://localhost:8080/api/locacoes'; // URL direta

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  criarLocacao(locacao: LocacaoCreateDTO): Observable<LocacaoDTO> {
    return this.http.post<LocacaoDTO>(this.apiUrl, locacao, {
      headers: this.getHeaders()
    });
  }

  getMinhasLocacoes(): Observable<LocacaoDTO[]> {
    return this.http.get<LocacaoDTO[]>(`${this.apiUrl}/minhas`, {
      headers: this.getHeaders()
    });
  }

  getLocacoesAtivas(): Observable<LocacaoDTO[]> {
    return this.http.get<LocacaoDTO[]>(`${this.apiUrl}/minhas/ativas`, {
      headers: this.getHeaders()
    });
  }

  getLocacoesFinalizadas(): Observable<LocacaoDTO[]> {
    return this.http.get<LocacaoDTO[]>(`${this.apiUrl}/minhas/finalizadas`, {
      headers: this.getHeaders()
    });
  }

  getLocacaoById(id: number): Observable<LocacaoDTO> {
    return this.http.get<LocacaoDTO>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  finalizarLocacao(id: number): Observable<LocacaoDTO> {
    return this.http.patch<LocacaoDTO>(
      `${this.apiUrl}/${id}/finalizar`,
      null,
      { headers: this.getHeaders() }
    );
  }

  cancelarLocacao(id: number): Observable<LocacaoDTO> {
    return this.http.patch<LocacaoDTO>(
      `${this.apiUrl}/${id}/cancelar`,
      null,
      { headers: this.getHeaders() }
    );
  }

  getResumo(): Observable<ResumoLocacaoDTO> {
    return this.http.get<ResumoLocacaoDTO>(`${this.apiUrl}/resumo`, {
      headers: this.getHeaders()
    });
  }

  calcularValorTotal(valorDiaria: number, dataRetirada: string, dataDevolucao: string): number {
    const retirada = new Date(dataRetirada);
    const devolucao = new Date(dataDevolucao);
    const dias = Math.ceil((devolucao.getTime() - retirada.getTime()) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias * valorDiaria : 0;
  }

  calcularDias(dataRetirada: string, dataDevolucao: string): number {
    const retirada = new Date(dataRetirada);
    const devolucao = new Date(dataDevolucao);
    return Math.ceil((devolucao.getTime() - retirada.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatarData(data: string): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  validarDatas(dataRetirada: string, dataDevolucao: string): { valido: boolean; erro?: string } {
    const retirada = new Date(dataRetirada);
    const devolucao = new Date(dataDevolucao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (retirada < hoje) {
      return { valido: false, erro: 'A data de retirada não pode ser no passado.' };
    }

    if (devolucao <= retirada) {
      return { valido: false, erro: 'A data de devolução deve ser posterior à data de retirada.' };
    }

    return { valido: true };
  }
}
