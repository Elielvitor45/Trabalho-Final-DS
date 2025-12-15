package locadora.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import locadora.backend.dto.AuthResponse;
import locadora.backend.dto.LoginRequest;
import locadora.backend.dto.RegisterRequest;
import locadora.backend.model.Endereco;
import locadora.backend.model.Usuario;
import locadora.backend.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validar se email já existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Validar se CPF já existe
        if (usuarioRepository.existsByCpf(request.getCpf())) {
            throw new RuntimeException("CPF já cadastrado");
        }

        // Criar endereço se fornecido
        Endereco endereco = null;
        if (request.getEndereco() != null) {
            endereco = new Endereco();
            endereco.setCep(request.getEndereco().getCep());
            endereco.setLogradouro(request.getEndereco().getLogradouro());
            endereco.setNumero(request.getEndereco().getNumero());
            endereco.setComplemento(request.getEndereco().getComplemento());
            endereco.setBairro(request.getEndereco().getBairro());
            endereco.setCidade(request.getEndereco().getCidade());
            endereco.setEstado(request.getEndereco().getEstado());
        }

        // Criar usuário
        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setTelefone(request.getTelefone());
        usuario.setEndereco(endereco);
        usuario.setAtivo(true);

        usuario = usuarioRepository.save(usuario);

        // Gerar token
        String token = jwtService.generateToken(usuario.getEmail(), usuario.getId());

        return new AuthResponse(token, usuario.getId(), usuario.getNome(), 
                              usuario.getEmail(), jwtExpiration);
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar usuário por email
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos"));

        // Verificar senha
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        // Verificar se usuário está ativo
        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário inativo");
        }

        // Gerar token
        String token = jwtService.generateToken(usuario.getEmail(), usuario.getId());

        return new AuthResponse(token, usuario.getId(), usuario.getNome(), 
                              usuario.getEmail(), jwtExpiration);
    }
}
