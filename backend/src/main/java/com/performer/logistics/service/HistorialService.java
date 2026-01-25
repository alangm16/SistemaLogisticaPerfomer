package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.repository.HistorialRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistorialService {

    private final HistorialRepository historialRepository;
    private final EmpleadoRepository empleadoRepository;

    public HistorialService(HistorialRepository historialRepository, EmpleadoRepository empleadoRepository) {
        this.historialRepository = historialRepository;
        this.empleadoRepository = empleadoRepository;
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
    
    public void registrar(Historial.EntidadTipo tipo, Long entidadId, String accion, String detalleJson, Long usuarioId) { 
        Empleado actor = null;
        if (usuarioId != null) { 
            actor = empleadoRepository.findById(usuarioId) .orElseThrow(() -> new ResourceNotFoundException("Usuario (actor) no encontrado con id " + usuarioId));
        } else { 
            // opcional: crear un Empleado "SYSTEM" o dejar null si tu entidad lo permite 
            throw new ResourceNotFoundException("Debe especificar el usuario que realizó la acción"); 
        } 
        Historial h = Historial.builder() 
                .entidadTipo(tipo) 
                .entidadId(entidadId) 
                .accion(accion) 
                .detalle(detalleJson) 
                .usuario(actor) 
                .timestamp(LocalDateTime.now()) 
                .build(); 
        historialRepository.save(h); 
    }
}