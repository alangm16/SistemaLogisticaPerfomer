package com.performer.logistics.repository;

import com.performer.logistics.domain.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {
    List<Cotizacion> findBySolicitudId(Long solicitudId);
    List<Cotizacion> findByProveedorId(Long proveedorId);
}
