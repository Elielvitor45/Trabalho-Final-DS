package locadora.backend.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VeiculoCreateDTO {
    
    @NotBlank(message = "Modelo é obrigatório")
    private String modelo;
    
    @NotBlank(message = "Marca é obrigatória")
    private String marca;
    
    @NotBlank(message = "Placa é obrigatória")
    private String placa;
    
    @NotNull(message = "Ano é obrigatório")
    private Integer ano;
    
    @NotBlank(message = "Categoria é obrigatória")
    private String categoria;
    
    @NotNull(message = "Valor diário é obrigatório")
    @Positive(message = "Valor diário deve ser positivo")
    private BigDecimal valorDiaria;
    
    private String descricao;
}
