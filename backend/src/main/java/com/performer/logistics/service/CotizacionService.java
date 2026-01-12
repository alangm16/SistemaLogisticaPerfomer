package com.performer.logistics.service;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.repository.CotizacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;

    public CotizacionService(CotizacionRepository cotizacionRepository) {
        this.cotizacionRepository = cotizacionRepository;
    }

    public List<Cotizacion> listarTodas() {
        return cotizacionRepository.findAll();
    }

    public Cotizacion guardar(Cotizacion cotizacion) {
        return cotizacionRepository.save(cotizacion);
    }

    public List<Cotizacion> listarPorSolicitud(Long solicitudId) {
        return cotizacionRepository.findBySolicitudId(solicitudId);
    }
}

