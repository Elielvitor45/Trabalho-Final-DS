package locadora.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import locadora.backend.dto.VeiculoCreateDTO;
import locadora.backend.dto.VeiculoDTO;
import locadora.backend.service.VeiculoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/veiculos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VeiculoController {

    private final VeiculoService veiculoService;

    @GetMapping
    public ResponseEntity<List<VeiculoDTO>> listarTodos() {
        return ResponseEntity.ok(veiculoService.listarTodos());
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<VeiculoDTO>> listarDisponiveis() {
        return ResponseEntity.ok(veiculoService.listarDisponiveis());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeiculoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.buscarPorId(id));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<VeiculoDTO>> buscarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(veiculoService.buscarPorCategoria(categoria));
    }

    @PostMapping
    public ResponseEntity<VeiculoDTO> criar(@Valid @RequestBody VeiculoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeiculoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody VeiculoCreateDTO dto) {
        return ResponseEntity.ok(veiculoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        veiculoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<Void> alterarDisponibilidade(@PathVariable Long id, @RequestParam Boolean disponivel) {
        veiculoService.alterarDisponibilidade(id, disponivel);
        return ResponseEntity.ok().build();
    }
}
