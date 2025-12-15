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
    private Long expiresIn; // milissegundos

    public AuthResponse(String token, Long id, String nome, String email, Long expiresIn) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.expiresIn = expiresIn;
    }
}
