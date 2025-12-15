package locadora.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocacaoCreateDTO {
    
    @NotNull(message = "Data de retirada é obrigatória")
    private LocalDate dataRetirada;
    
    @NotNull(message = "Data de devolução é obrigatória")
    private LocalDate dataDevolucao;
    
    @NotNull(message = "Veículo é obrigatório")
    private Long veiculoId;
    
    private String observacoes;
}
