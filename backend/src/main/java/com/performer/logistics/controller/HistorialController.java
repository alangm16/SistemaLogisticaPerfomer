package com.performer.logistics.controller;

import com.performer.logistics.domain.Historial;
import com.performer.logistics.service.HistorialService;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/historial")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public List<Historial> listar() {
        return historialService.listarTodos();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public Historial crear(@RequestBody Historial historial) {
        return historialService.guardar(historial);
    }

    @GetMapping("/{tipo}/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public List<Historial> listarPorEntidad(@PathVariable Historial.EntidadTipo tipo,
                                            @PathVariable Long id) {
        return historialService.listarPorEntidad(tipo, id);
    }
    
    @GetMapping("/filtrado")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public List<Historial> obtenerHistorialFiltrado(
        @RequestParam Historial.EntidadTipo tipo,
        @RequestParam Long entidadId,
        @RequestParam(required = false) String accion,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
            LocalDateTime fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
            LocalDateTime fechaHasta) {

        return historialService.obtenerHistorialFiltrado(
            tipo, entidadId, accion, fechaDesde, fechaHasta
        );
    }

    @GetMapping("/resumen/{tipo}/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public Map<String, Object> obtenerResumenHistorial(
        @PathVariable Historial.EntidadTipo tipo,
        @PathVariable Long id) {

        List<Historial> historial = historialService.listarPorEntidad(tipo, id);

        // Agrupar por acción
        Map<String, Long> conteoPorAccion = historial.stream()
            .collect(Collectors.groupingBy(
                Historial::getAccion,
                Collectors.counting()
            ));

        // Obtener último cambio
        Optional<Historial> ultimoCambio = historial.stream()
            .max(Comparator.comparing(Historial::getTimestamp));

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalCambios", historial.size());
        resumen.put("conteoPorAccion", conteoPorAccion);
        resumen.put("ultimoCambio", ultimoCambio.orElse(null));
        resumen.put("primerCambio", historial.isEmpty() ? null : 
            historial.stream().min(Comparator.comparing(Historial::getTimestamp)).orElse(null));

        return resumen;
    }
}