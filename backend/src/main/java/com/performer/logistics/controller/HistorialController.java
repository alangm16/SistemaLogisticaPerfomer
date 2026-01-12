package com.performer.logistics.controller;

import com.performer.logistics.domain.Historial;
import com.performer.logistics.service.HistorialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @GetMapping
    public List<Historial> listar() {
        return historialService.listarTodos();
    }

    @PostMapping
    public Historial crear(@RequestBody Historial historial) {
        return historialService.guardar(historial);
    }

    @GetMapping("/{tipo}/{id}")
    public List<Historial> listarPorEntidad(@PathVariable Historial.EntidadTipo tipo,
                                            @PathVariable Long id) {
        return historialService.listarPorEntidad(tipo, id);
    }
}

