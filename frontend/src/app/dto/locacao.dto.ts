// src/app/dto/locacao.dto.ts
export interface LocacaoCreateDTO {
  veiculoId: number;
  dataRetirada: string; // formato: 'YYYY-MM-DD'
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
