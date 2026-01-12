// com.performer.logistics.controller.EmpleadoController.java
package com.performer.logistics.controller;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.service.EmpleadoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {
    private final EmpleadoService service;

    public EmpleadoController(EmpleadoService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Empleado> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado obtener(@PathVariable Long id) { return service.obtener(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado crear(@RequestBody Empleado e) { return service.crear(e); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado actualizar(@PathVariable Long id, @RequestBody Empleado e) {
        return service.actualizar(id, e);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }

    @PostMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado aprobar(@PathVariable Long id) { return service.aprobar(id); }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado rechazar(@PathVariable Long id) { return service.rechazar(id); }

    @PostMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public Empleado cambiarRol(@PathVariable Long id, @RequestParam Empleado.Rol rol) {
        return service.cambiarRol(id, rol);
    }
    
}



