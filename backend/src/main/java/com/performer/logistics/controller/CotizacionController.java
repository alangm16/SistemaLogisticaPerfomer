package com.performer.logistics.controller;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.dto.CotizacionSugerenciaDTO;
import com.performer.logistics.service.CotizacionService;
import com.performer.logistics.service.EmpleadoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;
    private final EmpleadoService empleadoService;
    
    public CotizacionController(CotizacionService cotizacionService, EmpleadoService empleadoService ) {
        this.cotizacionService = cotizacionService;
        this.empleadoService = empleadoService;
    }

    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')") 
    @GetMapping
    public List<Cotizacion> listar() {
        return cotizacionService.listarTodas();
    }

    @PreAuthorize("hasAnyRole('PRICING')") 
    @PostMapping
    public Cotizacion crear(@RequestBody Cotizacion cotizacion) {
        return cotizacionService.guardar(cotizacion);
    }

    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')") 
    @GetMapping("/solicitud/{id}")
    public List<Cotizacion> listarPorSolicitud(@PathVariable Long id) {
        return cotizacionService.listarPorSolicitud(id);
    }
    
    @GetMapping("/sugerencias")
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')")
    public List<Cotizacion> sugerencias(@RequestParam Long solicitudId) {
        return cotizacionService.sugerenciasPorSolicitud(solicitudId);
    }
    
    @PreAuthorize("hasAnyRole('PRICING')")
    @PutMapping("/{id}")
    public Cotizacion actualizar(
            @PathVariable Long id,
            @RequestBody Cotizacion cotizacion) {

        Cotizacion existente = cotizacionService.buscarPorId(id);

        existente.setSolicitud(cotizacion.getSolicitud());
        existente.setProveedor(cotizacion.getProveedor());
        existente.setTipoTransporte(cotizacion.getTipoTransporte());
        existente.setOrigen(cotizacion.getOrigen());
        existente.setDestino(cotizacion.getDestino());
        existente.setTipoUnidad(cotizacion.getTipoUnidad());
        existente.setTiempoEstimado(cotizacion.getTiempoEstimado());
        existente.setCosto(cotizacion.getCosto());
        existente.setValidoHasta(cotizacion.getValidoHasta());
        existente.setDiasCredito(cotizacion.getDiasCredito());
        existente.setMargenGananciaPct(cotizacion.getMargenGananciaPct());
        existente.setEstado(cotizacion.getEstado());

        return cotizacionService.guardar(existente);
    }
    
    @PreAuthorize("hasAnyRole('ADMIN','PRICING')")
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        cotizacionService.eliminar(id);
    }
    
    @GetMapping("/sugerencias-avanzadas")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'PRICING', 'ADMIN')")
    public List<CotizacionSugerenciaDTO> sugerenciasAvanzadas(@RequestParam Long solicitudId) {
        return cotizacionService.sugerenciasAvanzadas(solicitudId);
    }
    
    @PostMapping("/reutilizar/{cotizacionId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'PRICING', 'ADMIN')")
    public Cotizacion reutilizarCotizacion(
            @PathVariable Long cotizacionId,
            @RequestParam Long nuevaSolicitudId,
            @RequestParam(required = false) Double nuevoCosto) {
        
        return cotizacionService.reutilizarCotizacion(cotizacionId, nuevaSolicitudId, nuevoCosto);
    }
    
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('PRICING')")
    public Cotizacion cambiarEstado(
        @PathVariable Long id,
        @RequestParam Cotizacion.Estado estado,
        Authentication authentication) {

        String email = authentication.getName();
        Empleado usuario = empleadoService.buscarPorEmail(email);

        return cotizacionService.cambiarEstado(id, estado, usuario);
    }

    @GetMapping("/{id}/historial")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'PRICING', 'ADMIN')")
    public List<Historial> obtenerHistorial(@PathVariable Long id) {
        return cotizacionService.obtenerHistorialCotizacion(id);
    }
}