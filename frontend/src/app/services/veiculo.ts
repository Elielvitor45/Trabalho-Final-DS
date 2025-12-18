import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VeiculoCreateDTO, VeiculoDTO } from '../dto/veiculo.dto';

@Injectable({
  providedIn: 'root',
})
export class VeiculoService {
  private apiUrl = 'http://localhost:8080/api/veiculos';

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os veículos (Público)
   */
  getVeiculos(): Observable<VeiculoDTO[]> {
    return this.http.get<VeiculoDTO[]>(this.apiUrl);
  }

  /**
   * Lista apenas veículos disponíveis (Público)
   */
  getVeiculosDisponiveis(): Observable<VeiculoDTO[]> {
    return this.http.get<VeiculoDTO[]>(`${this.apiUrl}/disponiveis`);
  }

  /**
   * Busca veículo por ID (Público)
   */
  getVeiculoById(id: number): Observable<VeiculoDTO> {
    return this.http.get<VeiculoDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca veículos por categoria (Público)
   */
  getVeiculosByCategoria(categoria: string): Observable<VeiculoDTO[]> {
    return this.http.get<VeiculoDTO[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  /**
   * Cria um veículo (Protegido - requer token)
   */
  createVeiculo(veiculo: VeiculoCreateDTO): Observable<VeiculoDTO> {
    return this.http.post<VeiculoDTO>(this.apiUrl, veiculo);
  }

  /**
   * Atualiza um veículo (Protegido - requer token)
   */
  updateVeiculo(id: number, veiculo: VeiculoCreateDTO): Observable<VeiculoDTO> {
    return this.http.put<VeiculoDTO>(`${this.apiUrl}/${id}`, veiculo);
  }

  /**
   * Remove um veículo (Protegido - requer token)
   */
  deleteVeiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Altera disponibilidade do veículo (Protegido - requer token)
   */
  updateDisponibilidade(id: number, disponivel: boolean): Observable<VeiculoDTO> {
    return this.http.patch<VeiculoDTO>(
      `${this.apiUrl}/${id}/disponibilidade?disponivel=${disponivel}`,
      {}
    );
  }
}
