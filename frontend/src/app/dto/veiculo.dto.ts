export interface VeiculoDTO {
  id: number;
  modelo: string;
  marca: string;
  placa: string;
  ano: number;
  categoria: string;
  valorDiaria: number;
  disponivel: boolean;
  descricao: string;
}

export interface VeiculoCreateDTO {
  modelo: string;
  marca: string;
  placa: string;
  ano: number;
  categoria: string;
  valorDiaria: number;
  descricao: string;
}

export type CategoriaVeiculo = 'Econômico' | 'Intermediário' | 'SUV' | 'Luxo' | 'Esportivo';
