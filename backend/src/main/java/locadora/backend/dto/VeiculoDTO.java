package locadora.backend.dto;

import java.math.BigDecimal;

import locadora.backend.model.Veiculo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VeiculoDTO {
    private Long id;
    private String modelo;
    private String marca;
    private String placa;
    private Integer ano;
    private String categoria;
    private BigDecimal valorDiaria;
    private Boolean disponivel;
    private String descricao;

    public VeiculoDTO(Veiculo veiculo) {
        this.id = veiculo.getId();
        this.modelo = veiculo.getModelo();
        this.marca = veiculo.getMarca();
        this.placa = veiculo.getPlaca();
        this.ano = veiculo.getAno();
        this.categoria = veiculo.getCategoria();
        this.valorDiaria = veiculo.getValorDiaria();
        this.disponivel = veiculo.getDisponivel();
        this.descricao = veiculo.getDescricao();
    }
}
