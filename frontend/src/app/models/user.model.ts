export interface Usuario {
  id: number;
  nome: string;
  email: string;
  isFuncionario: boolean;
}

export interface UsuarioPerfil {
  id: number;
  isFuncionario: boolean;
  nome: string;
  cpf: string;
  email: string;
  senha: null;
  telefone: string;
  dataNascimento: string | null;
  endereco: Endereco | null;
  ativo: boolean;
}

export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}
