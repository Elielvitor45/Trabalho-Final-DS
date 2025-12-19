package locadora.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import locadora.backend.dto.RegisterRequest;
import locadora.backend.dto.UsuarioDTO;
import locadora.backend.model.Endereco;
import locadora.backend.model.Usuario;
import locadora.backend.repository.UsuarioRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Listar todos os usuários (apenas para funcionários)
     */
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Buscar usuário por ID
     */
    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return new UsuarioDTO(usuario);
    }

    /**
     * Buscar usuário por email
     */
    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return new UsuarioDTO(usuario);
    }

    /**
     * Criar novo usuário (usado para criar funcionários manualmente)
     */
    @Transactional
    public UsuarioDTO criar(RegisterRequest request) {
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
        usuario.setIsFuncionario(request.getIsFuncionario() != null ? request.getIsFuncionario() : false);

        usuario = usuarioRepository.save(usuario);
        return new UsuarioDTO(usuario);
    }

    /**
     * Atualizar usuário
     */
    @Transactional
    public UsuarioDTO atualizar(Long id, Usuario usuarioAtualizado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualizar campos permitidos
        if (usuarioAtualizado.getNome() != null) {
            usuario.setNome(usuarioAtualizado.getNome());
        }
        if (usuarioAtualizado.getTelefone() != null) {
            usuario.setTelefone(usuarioAtualizado.getTelefone());
        }
        if (usuarioAtualizado.getDataNascimento() != null) {
            usuario.setDataNascimento(usuarioAtualizado.getDataNascimento());
        }

        usuario = usuarioRepository.save(usuario);
        return new UsuarioDTO(usuario);
    }

    /**
     * Promover cliente a funcionário
     */
    @Transactional
    public UsuarioDTO promoverAFuncionario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.getIsFuncionario()) {
            throw new RuntimeException("Usuário já é funcionário");
        }

        usuario.setIsFuncionario(true);
        usuario = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuario);
    }

    /**
     * Rebaixar funcionário a cliente
     */
    @Transactional
    public UsuarioDTO rebaixarACliente(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!usuario.getIsFuncionario()) {
            throw new RuntimeException("Usuário já é cliente");
        }

        usuario.setIsFuncionario(false);
        usuario = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuario);
    }

    /**
     * Ativar usuário
     */
    @Transactional
    public UsuarioDTO ativar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(true);
        usuario = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuario);
    }

    /**
     * Desativar usuário
     */
    @Transactional
    public UsuarioDTO desativar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(false);
        usuario = usuarioRepository.save(usuario);

        return new UsuarioDTO(usuario);
    }

    /**
     * Deletar usuário (soft delete - apenas desativa)
     */
    @Transactional
    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    /**
     * Listar apenas funcionários
     */
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarFuncionarios() {
        return usuarioRepository.findAll().stream()
                .filter(Usuario::getIsFuncionario)
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Listar apenas clientes
     */
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarClientes() {
        return usuarioRepository.findAll().stream()
                .filter(u -> !u.getIsFuncionario())
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }
}
