package com.performer.logistics.service;

import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;

    public SolicitudService(SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    public List<Solicitud> listarTodas() {
        return solicitudRepository.findAll();
    }

    public Solicitud guardar(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public List<Solicitud> listarPorEstado(Solicitud.Estado estado) {
        return solicitudRepository.findByEstado(estado);
    }
}
