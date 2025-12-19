package locadora.backend.dto;

import jakarta.validation.constraints.NotBlank;
import locadora.backend.model.Endereco;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnderecoDTO {
    
    private Long id;
    
    @NotBlank(message = "CEP é obrigatório")
    private String cep;
    
    @NotBlank(message = "Logradouro é obrigatório")
    private String logradouro;
    
    @NotBlank(message = "Número é obrigatório")
    private String numero;
    
    private String complemento;
    
    @NotBlank(message = "Bairro é obrigatório")
    private String bairro;
    
    @NotBlank(message = "Cidade é obrigatória")
    private String cidade;
    
    @NotBlank(message = "Estado é obrigatório")
    private String estado;

    // Construtor a partir da entidade Endereco
    public EnderecoDTO(Endereco endereco) {
        if (endereco != null) {
            this.id = endereco.getId();
            this.cep = endereco.getCep();
            this.logradouro = endereco.getLogradouro();
            this.numero = endereco.getNumero();
            this.complemento = endereco.getComplemento();
            this.bairro = endereco.getBairro();
            this.cidade = endereco.getCidade();
            this.estado = endereco.getEstado();
        }
    }
}
