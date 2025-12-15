package locadora.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import locadora.backend.model.Locacao;
import locadora.backend.model.StatusLocacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocacaoDTO {
    private Long id;
    private LocalDate dataRetirada;
    private LocalDate dataDevolucao;
    private String observacoes;
    private BigDecimal valorTotal;
    private StatusLocacao status;
    private VeiculoDTO veiculo;
    private UsuarioSimplificadoDTO usuario;

    public LocacaoDTO(Locacao locacao) {
        this.id = locacao.getId();
        this.dataRetirada = locacao.getDataRetirada();
        this.dataDevolucao = locacao.getDataDevolucao();
        this.observacoes = locacao.getObservacoes();
        this.valorTotal = locacao.getValorTotal();
        this.status = locacao.getStatus();
        this.veiculo = new VeiculoDTO(locacao.getVeiculo());
        this.usuario = new UsuarioSimplificadoDTO(locacao.getUsuario());
    }
}
