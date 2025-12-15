package locadora.backend.model;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "veiculos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Modelo é obrigatório")
    @Column(nullable = false, length = 100)
    private String modelo;

    @NotBlank(message = "Marca é obrigatória")
    @Column(nullable = false, length = 100)
    private String marca;

    @NotBlank(message = "Placa é obrigatória")
    @Column(nullable = false, unique = true, length = 10)
    private String placa;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(name = "valor_diaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDiaria;

    @Column(nullable = false)
    private Boolean disponivel = true;

    @Column(length = 500)
    private String descricao;
}
