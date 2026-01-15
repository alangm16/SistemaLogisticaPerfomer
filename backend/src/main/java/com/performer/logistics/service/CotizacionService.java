package com.performer.logistics.service;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.CotizacionRepository;
import com.performer.logistics.repository.SolicitudRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final HistorialService historialService;
    private final SolicitudRepository solicitudRepository;

    public CotizacionService(CotizacionRepository cotizacionRepository, HistorialService historialService, SolicitudRepository solicitudRepository) {
        this.cotizacionRepository = cotizacionRepository;
        this.historialService = historialService;
        this.solicitudRepository = solicitudRepository;
    }

    public List<Cotizacion> listarTodas() {
        return cotizacionRepository.findAll();
    }

    public Cotizacion guardar(Cotizacion cotizacion) {
        Cotizacion c = cotizacionRepository.save(cotizacion);
        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.COTIZACION)
                .entidadId(c.getId())
                .accion("CREADO")
                .detalle("Cotización creada para solicitud " + c.getSolicitud().getId())
                .usuario(c.getSolicitud().getCreadoPor())
                .timestamp(LocalDateTime.now())
                .build());
        return c;
    }

    public List<Cotizacion> listarPorSolicitud(Long solicitudId) {
        return cotizacionRepository.findBySolicitudId(solicitudId);
    }
    
    public List<Cotizacion> sugerenciasPorSolicitud(Long solicitudId) {
        Solicitud s = solicitudRepository.findById(solicitudId)   // ✅ usar la instancia inyectada
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        // Heurística simple: mismo tipoTransporte y origen/destino aproximados
        return cotizacionRepository.findAll().stream()
                .filter(c -> c.getTipoTransporte().name().equals(s.getTipoServicio().name()))
                .filter(c -> c.getOrigen().toLowerCase().contains(s.getOrigenCiudad().toLowerCase()))
                .filter(c -> c.getDestino().toLowerCase().contains(s.getDestinoCiudad().toLowerCase()))
                .limit(10)
                .toList();
    }

}

