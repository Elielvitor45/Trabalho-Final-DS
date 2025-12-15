package locadora.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import locadora.backend.model.Veiculo;

import java.util.List;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
    List<Veiculo> findByDisponivelTrue();
    List<Veiculo> findByCategoria(String categoria);
    List<Veiculo> findByMarca(String marca);
    boolean existsByPlaca(String placa);
}
