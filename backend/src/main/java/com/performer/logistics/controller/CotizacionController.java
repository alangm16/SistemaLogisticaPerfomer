package com.performer.logistics.controller;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.service.CotizacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @GetMapping
    public List<Cotizacion> listar() {
        return cotizacionService.listarTodas();
    }

    @PostMapping
    public Cotizacion crear(@RequestBody Cotizacion cotizacion) {
        return cotizacionService.guardar(cotizacion);
    }

    @GetMapping("/solicitud/{id}")
    public List<Cotizacion> listarPorSolicitud(@PathVariable Long id) {
        return cotizacionService.listarPorSolicitud(id);
    }
}

