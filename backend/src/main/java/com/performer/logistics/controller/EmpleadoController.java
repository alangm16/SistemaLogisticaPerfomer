package com.performer.logistics.controller;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.service.EmpleadoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @GetMapping
    public List<Empleado> listar() {
        return empleadoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Empleado obtenerPorId(@PathVariable Long id) {
        return empleadoService.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id " + id));
    }

    @PostMapping
    public Empleado crear(@RequestBody Empleado empleado) {
        return empleadoService.guardar(empleado);
    }

    @PutMapping("/{id}")
    public Empleado actualizar(@PathVariable Long id, @RequestBody Empleado empleado) {
        return empleadoService.actualizar(id, empleado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        empleadoService.eliminar(id);
    }
}


