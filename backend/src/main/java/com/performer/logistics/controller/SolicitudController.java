package com.performer.logistics.controller;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.dto.SolicitudDTO;
import com.performer.logistics.mapper.SolicitudMapper;
import com.performer.logistics.service.SolicitudService;
import com.performer.logistics.service.EmpleadoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final EmpleadoService empleadoService;

    public SolicitudController(SolicitudService solicitudService, EmpleadoService empleadoService) {
        this.solicitudService = solicitudService;
        this.empleadoService = empleadoService;
    }

    @GetMapping 
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')") 
    public List<SolicitudDTO> listar() { 
        return solicitudService.listarTodas().stream().map(SolicitudMapper::toDTO).toList(); 
    }

    @GetMapping("/recientes")
    @PreAuthorize("hasAnyRole('PRICING','ADMIN')")
    public List<SolicitudDTO> listarRecientes(@RequestParam(defaultValue = "20") int limit) {
        return solicitudService.listarRecientes(limit).stream().map(SolicitudMapper::toDTO).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')")
    public SolicitudDTO obtenerPorId(@PathVariable Long id) {
        Solicitud solicitud = solicitudService.obtenerPorId(id);
        return SolicitudMapper.toDTO(solicitud);
    }

    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING')")
    @PostMapping
    public Solicitud crear(@RequestBody Solicitud solicitud) {
        return solicitudService.guardar(solicitud);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')")
    public Solicitud actualizar(@PathVariable Long id, @RequestBody Solicitud solicitud) {
        return solicitudService.actualizar(id, solicitud);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('PRICING','ADMIN')")
    public Solicitud cambiarEstado(
            @PathVariable Long id, 
            @RequestParam Solicitud.Estado estado,
            Authentication authentication) {
        String email = authentication.getName();
        Empleado usuario = empleadoService.buscarPorEmail(email);
        return solicitudService.cambiarEstado(id, estado, usuario);
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')")
    public List<SolicitudDTO> listarPorEstado(@PathVariable Solicitud.Estado estado) {
        return solicitudService.listarPorEstado(estado).stream().map(SolicitudMapper::toDTO).toList();
    }
    
    @PreAuthorize("hasAnyRole('PRICING','ADMIN')")
    @GetMapping("/asignadas/{empleadoId}")
    public List<SolicitudDTO> listarAsignadas(@PathVariable Long empleadoId) {
        return solicitudService.listarAsignadas(empleadoId).stream().map(SolicitudMapper::toDTO).toList();
    }

//    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING','ADMIN')")
//    @GetMapping("/mis/{empleadoId}")
//    public List<SolicitudDTO> listarMisSolicitudes(@PathVariable Long empleadoId) {
//        return solicitudService.listarMisSolicitudes(empleadoId).stream().map(SolicitudMapper::toDTO).toList();
//    }
    
    @PutMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('PRICING','ADMIN')")
    public Solicitud asignar(@PathVariable Long id, @RequestParam Long empleadoId) {
        return solicitudService.asignar(id, empleadoId);
    }
    
    @GetMapping("/mis")
    @PreAuthorize("hasAnyRole('VENDEDOR','PRICING')")
    public List<SolicitudDTO> misSolicitudes(Authentication auth) {
        String email = auth.getName();
        Empleado usuario = empleadoService.buscarPorEmail(email);

        return solicitudService
                .listarMisSolicitudes(usuario.getId())
                .stream()
                .map(SolicitudMapper::toDTO)
                .toList();
    }
    
    @GetMapping("/asignadas")
    @PreAuthorize("hasAnyRole('PRICING','ADMIN','VENDEDOR')")
    public List<SolicitudDTO> solicitudesAsignadas(Authentication auth) {
        String email = auth.getName();
        Empleado usuario = empleadoService.buscarPorEmail(email);

        return solicitudService
                .listarAsignadas(usuario.getId())
                .stream()
                .map(SolicitudMapper::toDTO)
                .toList();
    }
}