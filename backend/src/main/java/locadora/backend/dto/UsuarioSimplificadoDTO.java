package locadora.backend.dto;

import locadora.backend.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioSimplificadoDTO {
    private Long id;
    private String nome;
    private String email;
    private String cpf;

    public UsuarioSimplificadoDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.cpf = usuario.getCpf();
    }
}
