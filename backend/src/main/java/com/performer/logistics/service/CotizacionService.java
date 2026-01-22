package com.performer.logistics.service;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.CotizacionRepository;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.repository.SolicitudRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final HistorialService historialService;
    private final SolicitudRepository solicitudRepository;
    private final EmpleadoRepository empleadoRepository;

    public CotizacionService(CotizacionRepository cotizacionRepository, HistorialService historialService, SolicitudRepository solicitudRepository, 
            EmpleadoRepository empleadoRepository) {
        this.cotizacionRepository = cotizacionRepository;
        this.historialService = historialService;
        this.solicitudRepository = solicitudRepository;
        this.empleadoRepository = empleadoRepository;
    }

    public List<Cotizacion> listarTodas() {
        return cotizacionRepository.findAll();
    }

    public Cotizacion guardar(Cotizacion cotizacion) {
        // Obtener usuario autenticado
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado para el email: " + email));
        
        Cotizacion c = cotizacionRepository.save(cotizacion);
        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.COTIZACION)
                .entidadId(c.getId())
                .accion("CREADO")
                .detalle("Cotización creada para solicitud " + c.getSolicitud().getId())
                .usuario(usuario)
                .timestamp(LocalDateTime.now())
                .build());
        return c;
    }

    public List<Cotizacion> listarPorSolicitud(Long solicitudId) {
        return cotizacionRepository.findBySolicitudId(solicitudId);
    }
    
    public List<Cotizacion> sugerenciasPorSolicitud(Long solicitudId) {
        Solicitud s = solicitudRepository.findById(solicitudId)   // usar la instancia inyectada
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        // Heurística simple: mismo tipoTransporte y origen/destino aproximados
        return cotizacionRepository.findAll().stream()
                .filter(c -> c.getTipoTransporte().name().equals(s.getTipoServicio().name()))
                .filter(c -> c.getOrigen().toLowerCase().contains(s.getOrigenCiudad().toLowerCase()))
                .filter(c -> c.getDestino().toLowerCase().contains(s.getDestinoCiudad().toLowerCase()))
                .limit(10)
                .toList();
    }
    
    public Cotizacion buscarPorId(Long id) {
        return cotizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización no encontrada"));
    }

    public void eliminar(Long id) {
        Cotizacion c = buscarPorId(id);
        cotizacionRepository.delete(c);

        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.COTIZACION)
                .entidadId(id)
                .accion("ELIMINADO")
                .detalle("Cotización eliminada")
                .usuario(c.getSolicitud().getCreadoPor())
                .timestamp(LocalDateTime.now())
                .build());
    }

}