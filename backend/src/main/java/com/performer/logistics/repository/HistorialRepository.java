package com.performer.logistics.repository;

import com.performer.logistics.domain.Historial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialRepository extends JpaRepository<Historial, Long> {
    List<Historial> findByEntidadTipoAndEntidadId(Historial.EntidadTipo tipo, Long entidadId);
}