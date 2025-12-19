package locadora.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tipo = "Bearer";
    private Long id;
    private String nome;
    private String email;
    private Boolean isFuncionario;
    private Long expiresIn;

    public AuthResponse(String token, Long id, String nome, String email, 
                       Boolean isFuncionario, Long expiresIn) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.isFuncionario = isFuncionario;
        this.expiresIn = expiresIn;
    }
}
