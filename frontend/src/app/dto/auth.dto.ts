export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone: string;
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

export interface AuthResponse {
  token: string;
  tipo: string;
  id: number;
  nome: string;
  email: string;
  expiresIn: number;
}

export interface LocacaoDTO {
  id: number;
  veiculoNome: string;
  veiculoModelo?: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  valorTotal: number;
}

export interface EstatisticasDTO {
  totalLocacoes: number;
  locacoesAtivas: number;
  locacoesFinalizadas: number;
  valorTotalGasto: number;
}