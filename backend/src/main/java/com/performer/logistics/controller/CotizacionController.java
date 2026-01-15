package com.performer.logistics.controller;

import com.performer.logistics.domain.Cotizacion;
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

}

