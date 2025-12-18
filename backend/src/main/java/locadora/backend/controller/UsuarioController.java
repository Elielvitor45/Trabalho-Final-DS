package locadora.backend.controller;

import jakarta.validation.Valid;
import locadora.backend.dto.EnderecoDTO;
import locadora.backend.dto.LocacaoDTO;
import locadora.backend.model.Endereco;
import locadora.backend.model.Usuario;
import locadora.backend.repository.UsuarioRepository;
import locadora.backend.service.LocacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    private final LocacaoService locacaoService;

    /**
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
     * Atualizar dados básicos do perfil
     */
    @PutMapping("/perfil")
    public ResponseEntity<Usuario> atualizarPerfil(@Valid @RequestBody Usuario usuarioAtualizado) {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario == null) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
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
     * Atualizar endereço do usuário
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
     * Remover endereço do usuário
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
     * Obter locações ativas do usuário
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
     * Obter estatísticas do usuário
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<EstatisticasUsuario> getEstatisticas() {
        String email = getEmailUsuarioAutenticado();
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        
        long totalLocacoes = locacoes.size();
        long locacoesAtivas = locacoes.stream().filter(l -> l.getStatus().name().equals("ATIVA")).count();
        long locacoesFinalizadas = locacoes.stream().filter(l -> l.getStatus().name().equals("FINALIZADA")).count();
        
        double valorTotalGasto = locacoes.stream()
            .filter(l -> l.getStatus().name().equals("FINALIZADA"))
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
     * Desativar conta do usuário
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

    /**
     * Classe interna para estatísticas
     */
    public static class EstatisticasUsuario {
        public long totalLocacoes;
        public long locacoesAtivas;
        public long locacoesFinalizadas;
        public double valorTotalGasto;

        public EstatisticasUsuario(long totalLocacoes, long locacoesAtivas, long locacoesFinalizadas, double valorTotalGasto) {
            this.totalLocacoes = totalLocacoes;
            this.locacoesAtivas = locacoesAtivas;
            this.locacoesFinalizadas = locacoesFinalizadas;
            this.valorTotalGasto = valorTotalGasto;
        }
    }
}
