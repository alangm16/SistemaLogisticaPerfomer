package com.performer.logistics.repository;

import com.performer.logistics.domain.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByEstado(Solicitud.Estado estado);

    List<Solicitud> findByEmpresaCodigo(String empresaCodigo);

    List<Solicitud> findByAsignadoAId(Long empleadoId);

    List<Solicitud> findByCreadoPorId(Long empleadoId);

    List<Solicitud> findByClienteId(Long clienteId);

    @Query("""
        SELECT COUNT(s)
        FROM Solicitud s
        WHERE s.empresaCodigo = :empresa
          AND YEAR(s.creadoEn) = :year
    """)
    long countByEmpresaCodigoAndYear(
            @Param("empresa") String empresa,
            @Param("year") int year
    );
}
