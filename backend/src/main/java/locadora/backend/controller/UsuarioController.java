package locadora.backend.controller;

import jakarta.validation.Valid;
import locadora.backend.dto.EnderecoDTO;
import locadora.backend.dto.LocacaoDTO;
import locadora.backend.dto.RegisterRequest;
import locadora.backend.dto.UsuarioDTO;
import locadora.backend.model.Endereco;
import locadora.backend.model.Usuario;
import locadora.backend.repository.UsuarioRepository;
import locadora.backend.service.LocacaoService;
import locadora.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final LocacaoService locacaoService;

    // ========== ENDPOINTS DO PRÓPRIO USUÁRIO (CLIENTE OU FUNCIONÁRIO) ==========

    /**
     * GET /api/usuarios/perfil
     * Obter perfil do usuário autenticado
     */
    @GetMapping("/perfil")
    public ResponseEntity<Usuario> getPerfil() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Remover senha da resposta
        usuario.setSenha(null);
        
        return ResponseEntity.ok(usuario);
    }

    /**
     * PUT /api/usuarios/perfil
     * Atualizar dados básicos do perfil do usuário autenticado
     */
    @PutMapping("/perfil")
    public ResponseEntity<Usuario> atualizarPerfil(@Valid @RequestBody Usuario usuarioAtualizado) {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Atualizar apenas campos permitidos
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
        usuario.setSenha(null);
        
        return ResponseEntity.ok(usuario);
    }

    /**
     * PUT /api/usuarios/endereco
     * Atualizar endereço do usuário autenticado
     */
    @PutMapping("/endereco")
    public ResponseEntity<Usuario> atualizarEndereco(@Valid @RequestBody EnderecoDTO enderecoDTO) {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (usuario.getEndereco() == null) {
            usuario.setEndereco(new Endereco());
        }
        
        Endereco endereco = usuario.getEndereco();
        endereco.setCep(enderecoDTO.getCep());
        endereco.setLogradouro(enderecoDTO.getLogradouro());
        endereco.setNumero(enderecoDTO.getNumero());
        endereco.setComplemento(enderecoDTO.getComplemento());
        endereco.setBairro(enderecoDTO.getBairro());
        endereco.setCidade(enderecoDTO.getCidade());
        endereco.setEstado(enderecoDTO.getEstado());
        
        usuario = usuarioRepository.save(usuario);
        usuario.setSenha(null);
        
        return ResponseEntity.ok(usuario);
    }

    /**
     * DELETE /api/usuarios/endereco
     * Remover endereço do usuário autenticado
     */
    @DeleteMapping("/endereco")
    public ResponseEntity<Void> removerEndereco() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setEndereco(null);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/usuarios/locacoes
     * Obter histórico de locações do usuário autenticado
     */
    @GetMapping("/locacoes")
    public ResponseEntity<List<LocacaoDTO>> getMinhasLocacoes() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        
        return ResponseEntity.ok(locacoes);
    }

    /**
     * GET /api/usuarios/locacoes/ativas
     * Obter locações ativas do usuário autenticado
     */
    @GetMapping("/locacoes/ativas")
    public ResponseEntity<List<LocacaoDTO>> getLocacoesAtivas() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        
        // Filtrar apenas ativas
        List<LocacaoDTO> locacoesAtivas = locacoes.stream()
            .filter(l -> l.getStatus().name().equals("ATIVA"))
            .toList();
        
        return ResponseEntity.ok(locacoesAtivas);
    }

    /**
     * GET /api/usuarios/estatisticas
     * Obter estatísticas do usuário autenticado
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<EstatisticasUsuario> getEstatisticas() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        
        long totalLocacoes = locacoes.size();
        
        long locacoesAtivas = locacoes.stream()
            .filter(l -> "ATIVA".equals(l.getStatus().name()))
            .count();
        
        long locacoesFinalizadas = locacoes.stream()
            .filter(l -> "FINALIZADA".equals(l.getStatus().name()))
            .count();
        
        double valorTotalGasto = locacoes.stream()
            .filter(l -> !"CANCELADA".equals(l.getStatus().name()))
            .filter(l -> l.getValorTotal() != null)
            .mapToDouble(l -> l.getValorTotal().doubleValue())
            .sum();
        
        EstatisticasUsuario stats = new EstatisticasUsuario(
            totalLocacoes,
            locacoesAtivas,
            locacoesFinalizadas,
            valorTotalGasto
        );
        
        return ResponseEntity.ok(stats);
    }

    /**
     * PATCH /api/usuarios/desativar
     * Desativar conta do usuário autenticado
     */
    @PatchMapping("/desativar")
    public ResponseEntity<Void> desativarConta() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Verificar se possui locações ativas
        List<LocacaoDTO> locacoesAtivas = locacaoService.listarPorUsuario(usuario.getId())
            .stream()
            .filter(l -> l.getStatus().name().equals("ATIVA"))
            .toList();
        
        if (!locacoesAtivas.isEmpty()) {
            throw new RuntimeException("Não é possível desativar conta com locações ativas");
        }
        
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.noContent().build();
    }

    // ========== ENDPOINTS ADMINISTRATIVOS (APENAS FUNCIONÁRIOS) ==========

    /**
     * GET /api/usuarios
     * Listar todos os usuários (apenas funcionários)
     */
    @GetMapping
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        List<UsuarioDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * GET /api/usuarios/funcionarios
     * Listar apenas funcionários
     */
    @GetMapping("/funcionarios")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<List<UsuarioDTO>> listarFuncionarios() {
        List<UsuarioDTO> funcionarios = usuarioService.listarFuncionarios();
        return ResponseEntity.ok(funcionarios);
    }

    /**
     * GET /api/usuarios/clientes
     * Listar apenas clientes
     */
    @GetMapping("/clientes")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<List<UsuarioDTO>> listarClientes() {
        List<UsuarioDTO> clientes = usuarioService.listarClientes();
        return ResponseEntity.ok(clientes);
    }

    /**
     * GET /api/usuarios/{id}
     * Buscar usuário por ID (apenas funcionários)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * POST /api/usuarios/funcionario
     * Criar novo funcionário (apenas funcionários podem criar)
     */
    @PostMapping("/funcionario")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> criarFuncionario(@Valid @RequestBody RegisterRequest request) {
        request.setIsFuncionario(true);
        UsuarioDTO usuario = usuarioService.criar(request);
        return ResponseEntity.ok(usuario);
    }

    /**
     * PUT /api/usuarios/{id}
     * Atualizar usuário por ID (apenas funcionários)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(
            @PathVariable Long id, 
            @Valid @RequestBody Usuario usuarioAtualizado) {
        UsuarioDTO usuario = usuarioService.atualizar(id, usuarioAtualizado);
        return ResponseEntity.ok(usuario);
    }

    /**
     * PUT /api/usuarios/{id}/promover
     * Promover cliente a funcionário (apenas funcionários)
     */
    @PutMapping("/{id}/promover")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> promoverAFuncionario(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.promoverAFuncionario(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * PUT /api/usuarios/{id}/rebaixar
     * Rebaixar funcionário a cliente (apenas funcionários)
     */
    @PutMapping("/{id}/rebaixar")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> rebaixarACliente(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.rebaixarACliente(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * PATCH /api/usuarios/{id}/ativar
     * Ativar usuário (apenas funcionários)
     */
    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> ativarUsuario(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.ativar(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * PATCH /api/usuarios/{id}/desativar
     * Desativar usuário (apenas funcionários)
     */
    @PatchMapping("/{id}/desativar")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<UsuarioDTO> desativarUsuario(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.desativar(id);
        return ResponseEntity.ok(usuario);
    }

    /**
     * DELETE /api/usuarios/{id}
     * Deletar usuário (soft delete - apenas funcionários)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ========== MÉTODO AUXILIAR ==========

    /**
     * Método auxiliar para obter email do usuário autenticado
     */
    private String getEmailUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuário não autenticado");
        }
        return authentication.getName();
    }

    // ========== CLASSE INTERNA PARA ESTATÍSTICAS ==========

    /**
     * Classe interna para estatísticas do usuário
     */
    public static class EstatisticasUsuario {
        public long totalLocacoes;
        public long locacoesAtivas;
        public long locacoesFinalizadas;
        public double valorTotalGasto;

        public EstatisticasUsuario(long totalLocacoes, long locacoesAtivas, 
                                  long locacoesFinalizadas, double valorTotalGasto) {
            this.totalLocacoes = totalLocacoes;
            this.locacoesAtivas = locacoesAtivas;
            this.locacoesFinalizadas = locacoesFinalizadas;
            this.valorTotalGasto = valorTotalGasto;
        }
    }
}
