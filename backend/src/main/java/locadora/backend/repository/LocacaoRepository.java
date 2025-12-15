package locadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import locadora.backend.model.Locacao;
import locadora.backend.model.StatusLocacao;
import locadora.backend.model.Usuario;

@Repository
public interface LocacaoRepository extends JpaRepository<Locacao, Long> {
    List<Locacao> findByUsuario(Usuario usuario);
    List<Locacao> findByUsuarioId(Long usuarioId);
    List<Locacao> findByStatus(StatusLocacao status);
    List<Locacao> findByVeiculoId(Long veiculoId);
    List<Locacao> findByUsuarioIdOrderByDataRetiradaDesc(Long usuarioId);
}
