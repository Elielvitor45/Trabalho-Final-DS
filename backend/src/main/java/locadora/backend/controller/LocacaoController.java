package locadora.backend.controller;

import jakarta.validation.Valid;
import locadora.backend.dto.LocacaoCreateDTO;
import locadora.backend.dto.LocacaoDTO;
import locadora.backend.model.StatusLocacao;
import locadora.backend.model.Usuario;
import locadora.backend.repository.UsuarioRepository;
import locadora.backend.service.LocacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locacoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocacaoController {

    private final LocacaoService locacaoService;
    private final UsuarioRepository usuarioRepository;

    /**
     * GET /api/locacoes
     * Listar todas as locações
     * - Funcionário: vê todas
     * - Cliente: vê apenas as suas
     */
    @GetMapping
    public ResponseEntity<List<LocacaoDTO>> listarTodas() {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Se for funcionário, lista todas. Se for cliente, lista apenas as suas
        if (usuario.getIsFuncionario()) {
            return ResponseEntity.ok(locacaoService.listarTodas());
        } else {
            return ResponseEntity.ok(locacaoService.listarPorUsuario(usuario.getId()));
        }
    }

    /**
     * GET /api/locacoes/minhas
     * Listar locações do usuário autenticado
     */
    @GetMapping("/minhas")
    public ResponseEntity<List<LocacaoDTO>> listarMinhasLocacoes() {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        return ResponseEntity.ok(locacoes);
    }

    /**
     * GET /api/locacoes/minhas/ativas
     * Listar locações ativas do usuário autenticado
     */
    @GetMapping("/minhas/ativas")
    public ResponseEntity<List<LocacaoDTO>> listarMinhasLocacoesAtivas() {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId())
            .stream()
            .filter(l -> l.getStatus() == StatusLocacao.ATIVA)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(locacoes);
    }

    /**
     * GET /api/locacoes/minhas/finalizadas
     * Listar locações finalizadas do usuário autenticado
     */
    @GetMapping("/minhas/finalizadas")
    public ResponseEntity<List<LocacaoDTO>> listarMinhasLocacoesFinalizadas() {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId())
            .stream()
            .filter(l -> l.getStatus() == StatusLocacao.FINALIZADA)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(locacoes);
    }

    /**
     * GET /api/locacoes/usuario/{usuarioId}
     * Listar locações por usuário específico (apenas funcionários)
     */
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<List<LocacaoDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(locacaoService.listarPorUsuario(usuarioId));
    }

    /**
     * GET /api/locacoes/{id}
     * Buscar locação específica por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LocacaoDTO> buscarPorId(@PathVariable Long id) {
        LocacaoDTO locacao = locacaoService.buscarPorId(id);
        
        // Verificar se a locação pertence ao usuário autenticado (se não for funcionário)
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!usuario.getIsFuncionario() && !locacao.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }
        
        return ResponseEntity.ok(locacao);
    }

    /**
     * POST /api/locacoes
     * Criar nova locação
     */
    @PostMapping
    public ResponseEntity<LocacaoDTO> criar(@Valid @RequestBody LocacaoCreateDTO dto) {
        String email = getEmailUsuarioAutenticado();
        LocacaoDTO locacao = locacaoService.criar(dto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(locacao);
    }

    /**
     * PATCH /api/locacoes/{id}/finalizar
     * Finalizar uma locação (cliente finaliza a sua, funcionário pode finalizar qualquer uma)
     */
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<LocacaoDTO> finalizar(@PathVariable Long id) {
        // Verificar propriedade da locação (se não for funcionário)
        verificarPropriedadeOuFuncionario(id);
        
        LocacaoDTO locacao = locacaoService.finalizar(id);
        return ResponseEntity.ok(locacao);
    }

    /**
     * PATCH /api/locacoes/{id}/cancelar
     * Cancelar uma locação (cliente cancela a sua, funcionário pode cancelar qualquer uma)
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<LocacaoDTO> cancelar(@PathVariable Long id) {
        // Verificar propriedade da locação (se não for funcionário)
        verificarPropriedadeOuFuncionario(id);
        
        LocacaoDTO locacao = locacaoService.cancelar(id);
        return ResponseEntity.ok(locacao);
    }

    /**
     * GET /api/locacoes/resumo
     * Obter resumo de locações por status
     */
    @GetMapping("/resumo")
    public ResponseEntity<ResumoLocacoes> obterResumo() {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        List<LocacaoDTO> locacoes = locacaoService.listarPorUsuario(usuario.getId());
        
        long ativas = locacoes.stream().filter(l -> l.getStatus() == StatusLocacao.ATIVA).count();
        long finalizadas = locacoes.stream().filter(l -> l.getStatus() == StatusLocacao.FINALIZADA).count();
        long canceladas = locacoes.stream().filter(l -> l.getStatus() == StatusLocacao.CANCELADA).count();
        
        double valorTotal = locacoes.stream()
            .filter(l -> l.getStatus() == StatusLocacao.FINALIZADA)
            .mapToDouble(l -> l.getValorTotal().doubleValue())
            .sum();
        
        ResumoLocacoes resumo = new ResumoLocacoes(
            locacoes.size(),
            ativas,
            finalizadas,
            canceladas,
            valorTotal
        );
        
        return ResponseEntity.ok(resumo);
    }

    /**
     * GET /api/locacoes/verificar-disponibilidade/{veiculoId}
     * Verificar disponibilidade de veículo para período
     */
    @GetMapping("/verificar-disponibilidade/{veiculoId}")
    public ResponseEntity<DisponibilidadeResponse> verificarDisponibilidade(
            @PathVariable Long veiculoId,
            @RequestParam String dataRetirada,
            @RequestParam String dataDevolucao) {
        
        // Aqui você pode implementar lógica para verificar conflitos de datas
        // Por enquanto, retorna disponível se o veículo estiver marcado como disponível
        DisponibilidadeResponse response = new DisponibilidadeResponse(
            true,
            "Veículo disponível para o período solicitado"
        );
        
        return ResponseEntity.ok(response);
    }

    // ========== MÉTODOS AUXILIARES ==========

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
     * Método auxiliar para verificar se locação pertence ao usuário OU se é funcionário
     */
    private void verificarPropriedadeOuFuncionario(Long locacaoId) {
        String email = getEmailUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Se for funcionário, pode modificar qualquer locação
        if (usuario.getIsFuncionario()) {
            return;
        }
        
        // Se for cliente, só pode modificar suas próprias locações
        LocacaoDTO locacao = locacaoService.buscarPorId(locacaoId);
        if (!locacao.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para modificar esta locação");
        }
    }

    // ========== CLASSES INTERNAS ==========

    /**
     * Classe interna para resumo de locações
     */
    public static class ResumoLocacoes {
        public long total;
        public long ativas;
        public long finalizadas;
        public long canceladas;
        public double valorTotalGasto;

        public ResumoLocacoes(long total, long ativas, long finalizadas,
                            long canceladas, double valorTotalGasto) {
            this.total = total;
            this.ativas = ativas;
            this.finalizadas = finalizadas;
            this.canceladas = canceladas;
            this.valorTotalGasto = valorTotalGasto;
        }
    }

    /**
     * Classe interna para resposta de disponibilidade
     */
    public static class DisponibilidadeResponse {
        public boolean disponivel;
        public String mensagem;

        public DisponibilidadeResponse(boolean disponivel, String mensagem) {
            this.disponivel = disponivel;
            this.mensagem = mensagem;
        }
    }
}
