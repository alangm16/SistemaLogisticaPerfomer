package com.performer.logistics.repository;

import com.performer.logistics.domain.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    List<Solicitud> findByEstado(Solicitud.Estado estado);
    List<Solicitud> findByEmpresaCodigo(String empresaCodigo);
}
