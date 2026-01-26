package com.performer.logistics.controller;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.dto.CotizacionSugerenciaDTO;
import com.performer.logistics.service.CotizacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')") 
    @GetMapping
    public List<Cotizacion> listar() {
        return cotizacionService.listarTodas();
    }

    @PreAuthorize("hasAnyRole('PRICING','ADMIN')") 
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
    
    @PreAuthorize("hasAnyRole('PRICING','ADMIN')")
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
    
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','PRICING')")
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
}