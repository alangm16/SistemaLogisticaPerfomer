package com.performer.logistics.service;

import com.performer.logistics.domain.Historial;
import com.performer.logistics.repository.HistorialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistorialService {

    private final HistorialRepository historialRepository;

    public HistorialService(HistorialRepository historialRepository) {
        this.historialRepository = historialRepository;
    }

    public List<Historial> listarTodos() {
        return historialRepository.findAll();
    }

    public Historial guardar(Historial historial) {
        return historialRepository.save(historial);
    }

    public List<Historial> listarPorEntidad(Historial.EntidadTipo tipo, Long entidadId) {
        return historialRepository.findByEntidadTipoAndEntidadId(tipo, entidadId);
    }
}
