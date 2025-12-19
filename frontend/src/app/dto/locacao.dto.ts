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
  valorTotal: number;
  status: 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
  observacoes?: string;
  veiculo?: {
    id: number;
    marca: string;
    modelo: string;
    placa?: string;
  };
  usuario: any;
}


export type StatusLocacao = 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
