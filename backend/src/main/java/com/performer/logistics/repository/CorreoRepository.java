package com.performer.logistics.repository;

import com.performer.logistics.domain.Correo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorreoRepository extends JpaRepository<Correo, Long> {
    List<Correo> findByDestinatario(String destinatario);
    List<Correo> findBySolicitudId(Long solicitudId);
    List<Correo> findByCotizacionId(Long cotizacionId);
}