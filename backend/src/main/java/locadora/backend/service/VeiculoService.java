package locadora.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import locadora.backend.dto.VeiculoCreateDTO;
import locadora.backend.dto.VeiculoDTO;
import locadora.backend.model.Veiculo;
import locadora.backend.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;

    @Transactional(readOnly = true)
    public List<VeiculoDTO> listarTodos() {
        return veiculoRepository.findAll()
                .stream()
                .map(VeiculoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VeiculoDTO> listarDisponiveis() {
        return veiculoRepository.findByDisponivelTrue().stream()
                .map(VeiculoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VeiculoDTO buscarPorId(Long id) {
        return veiculoRepository.findById(id)
                .map(VeiculoDTO::new)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<VeiculoDTO> buscarPorCategoria(String categoria) {
        return veiculoRepository.findByCategoria(categoria).stream()
                .map(VeiculoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public VeiculoDTO criar(VeiculoCreateDTO dto) {
        if (veiculoRepository.existsByPlaca(dto.getPlaca())) {
            throw new RuntimeException("Placa já cadastrada");
        }

        Veiculo veiculo = new Veiculo();
        veiculo.setModelo(dto.getModelo());
        veiculo.setMarca(dto.getMarca());
        veiculo.setPlaca(dto.getPlaca());
        veiculo.setAno(dto.getAno());
        veiculo.setCategoria(dto.getCategoria());
        veiculo.setValorDiaria(dto.getValorDiaria());
        veiculo.setDescricao(dto.getDescricao());
        veiculo.setDisponivel(true);

        veiculo = veiculoRepository.save(veiculo);
        return new VeiculoDTO(veiculo);
    }

    @Transactional
    public VeiculoDTO atualizar(Long id, VeiculoCreateDTO dto) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

        veiculo.setModelo(dto.getModelo());
        veiculo.setMarca(dto.getMarca());
        veiculo.setAno(dto.getAno());
        veiculo.setCategoria(dto.getCategoria());
        veiculo.setValorDiaria(dto.getValorDiaria());
        veiculo.setDescricao(dto.getDescricao());

        veiculo = veiculoRepository.save(veiculo);
        return new VeiculoDTO(veiculo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!veiculoRepository.existsById(id)) {
            throw new RuntimeException("Veículo não encontrado");
        }
        veiculoRepository.deleteById(id);
    }

    @Transactional
    public void alterarDisponibilidade(Long id, Boolean disponivel) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));
        veiculo.setDisponivel(disponivel);
        veiculoRepository.save(veiculo);
    }

}
