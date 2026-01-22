package com.performer.logistics.service;

import com.performer.logistics.domain.Historial;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.HistorialRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public List<Historial> listarPorEntidad(Historial.EntidadTipo tipo, Long entidadId) {
        return historialRepository.findByEntidadTipoAndEntidadId(tipo, entidadId);
    }

    // Método de guardar
    public Historial guardar(Historial historial) {
        if (historial.getEntidadTipo() == null || historial.getEntidadId() == null) {
            throw new ResourceNotFoundException("Entidad inválida para historial");
        }
        if (historial.getUsuario() == null) {
            throw new ResourceNotFoundException("Debe especificar el usuario que realizó la acción");
        }
        historial.setTimestamp(LocalDateTime.now());
        return historialRepository.save(historial);
    }
}