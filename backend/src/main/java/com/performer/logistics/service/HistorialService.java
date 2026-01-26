package com.performer.logistics.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.repository.HistorialRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    
    public void registrarCambioDetallado(
        Historial.EntidadTipo tipo,
        Long entidadId,
        String accion,
        Map<String, Object> cambios,
        Long usuarioId) {

        String detalleJson;
        try {
            detalleJson = new ObjectMapper().writeValueAsString(cambios);
        } catch (JsonProcessingException e) {
            detalleJson = "{\"error\":\"No se pudieron serializar los cambios\"}";
        }

        registrar(tipo, entidadId, accion, detalleJson, usuarioId);
    }

    // Método para obtener historial filtrado por acción y rango de fechas
    public List<Historial> obtenerHistorialFiltrado(
        Historial.EntidadTipo tipo,
        Long entidadId,
        String accion,
        LocalDateTime fechaDesde,
        LocalDateTime fechaHasta) {

        List<Historial> historial = listarPorEntidad(tipo, entidadId);

        return historial.stream()
            .filter(h -> accion == null || h.getAccion().equals(accion))
            .filter(h -> fechaDesde == null || !h.getTimestamp().isBefore(fechaDesde))
            .filter(h -> fechaHasta == null || !h.getTimestamp().isAfter(fechaHasta))
            .sorted(Comparator.comparing(Historial::getTimestamp).reversed())
            .collect(Collectors.toList());
    }
}