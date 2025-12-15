package locadora.backend.service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import locadora.backend.dto.LocacaoCreateDTO;
import locadora.backend.dto.LocacaoDTO;
import locadora.backend.model.Locacao;
import locadora.backend.model.StatusLocacao;
import locadora.backend.model.Usuario;
import locadora.backend.model.Veiculo;
import locadora.backend.repository.LocacaoRepository;
import locadora.backend.repository.UsuarioRepository;
import locadora.backend.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocacaoService {
    private final LocacaoRepository locacaoRepository;
    private final VeiculoRepository veiculoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<LocacaoDTO> listarTodas() {
        return locacaoRepository.findAll().stream()
                .map(LocacaoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LocacaoDTO> listarPorUsuario(Long usuarioId) {
        return locacaoRepository.findByUsuarioIdOrderByDataRetiradaDesc(usuarioId).stream()
                .map(LocacaoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LocacaoDTO buscarPorId(Long id) {
        Locacao locacao = locacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locação não encontrada"));
        return new LocacaoDTO(locacao);
    }

    @Transactional
    public LocacaoDTO criar(LocacaoCreateDTO dto, String emailUsuario) {
        // Buscar usuário
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Buscar veículo
        Veiculo veiculo = veiculoRepository.findById(dto.getVeiculoId())
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

        // Verificar disponibilidade
        if (!veiculo.getDisponivel()) {
            throw new RuntimeException("Veículo não disponível");
        }

        // Validar datas
        if (dto.getDataDevolucao().isBefore(dto.getDataRetirada())) {
            throw new RuntimeException("Data de devolução deve ser posterior à data de retirada");
        }

        // Calcular valor total
        long dias = ChronoUnit.DAYS.between(dto.getDataRetirada(), dto.getDataDevolucao());
        if (dias == 0) dias = 1; // Mínimo 1 dia
        BigDecimal valorTotal = veiculo.getValorDiaria().multiply(BigDecimal.valueOf(dias));

        // Criar locação
        Locacao locacao = new Locacao();
        locacao.setDataRetirada(dto.getDataRetirada());
        locacao.setDataDevolucao(dto.getDataDevolucao());
        locacao.setUsuario(usuario);
        locacao.setVeiculo(veiculo);
        locacao.setObservacoes(dto.getObservacoes());
        locacao.setValorTotal(valorTotal);
        locacao.setStatus(StatusLocacao.ATIVA);

        // Marcar veículo como indisponível
        veiculo.setDisponivel(false);
        veiculoRepository.save(veiculo);

        locacao = locacaoRepository.save(locacao);
        return new LocacaoDTO(locacao);
    }

    @Transactional
    public LocacaoDTO finalizar(Long id) {
        Locacao locacao = locacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locação não encontrada"));

        if (locacao.getStatus() != StatusLocacao.ATIVA) {
            throw new RuntimeException("Apenas locações ativas podem ser finalizadas");
        }

        locacao.setStatus(StatusLocacao.FINALIZADA);
        
        // Liberar veículo
        Veiculo veiculo = locacao.getVeiculo();
        veiculo.setDisponivel(true);
        veiculoRepository.save(veiculo);

        locacao = locacaoRepository.save(locacao);
        return new LocacaoDTO(locacao);
    }

    @Transactional
    public LocacaoDTO cancelar(Long id) {
        Locacao locacao = locacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locação não encontrada"));

        if (locacao.getStatus() != StatusLocacao.ATIVA) {
            throw new RuntimeException("Apenas locações ativas podem ser canceladas");
        }

        locacao.setStatus(StatusLocacao.CANCELADA);
        
        // Liberar veículo
        Veiculo veiculo = locacao.getVeiculo();
        veiculo.setDisponivel(true);
        veiculoRepository.save(veiculo);

        locacao = locacaoRepository.save(locacao);
        return new LocacaoDTO(locacao);
    }
}
