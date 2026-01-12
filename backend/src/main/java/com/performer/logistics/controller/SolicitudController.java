package com.performer.logistics.controller;

import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.service.SolicitudService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<Solicitud> listar() {
        return solicitudService.listarTodas();
    }

    @PostMapping
    public Solicitud crear(@RequestBody Solicitud solicitud) {
        return solicitudService.guardar(solicitud);
    }

    @GetMapping("/estado/{estado}")
    public List<Solicitud> listarPorEstado(@PathVariable Solicitud.Estado estado) {
        return solicitudService.listarPorEstado(estado);
    }
}
