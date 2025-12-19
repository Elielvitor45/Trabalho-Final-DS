package locadora.backend.dto;

import locadora.backend.model.Usuario;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String email;
    private String telefone;
    private LocalDateTime dataNascimento;
    private Boolean ativo;
    private Boolean isFuncionario;
    private EnderecoDTO endereco;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.cpf = usuario.getCpf();
        this.email = usuario.getEmail();
        this.telefone = usuario.getTelefone();
        this.dataNascimento = usuario.getDataNascimento();
        this.ativo = usuario.getAtivo();
        this.isFuncionario = usuario.getIsFuncionario();
        this.criadoEm = usuario.getCriadoEm();
        this.atualizadoEm = usuario.getAtualizadoEm();
        
        if (usuario.getEndereco() != null) {
            this.endereco = new EnderecoDTO(usuario.getEndereco());
        }
    }
}
