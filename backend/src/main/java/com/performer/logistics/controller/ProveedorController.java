package com.performer.logistics.controller;

import com.performer.logistics.domain.Proveedor;
import com.performer.logistics.service.ProveedorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listarTodos();
    }

    @GetMapping("/{id}")
    public Proveedor obtenerPorId(@PathVariable Long id) {
        return proveedorService.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id " + id));
    }

    @PostMapping
    public Proveedor crear(@RequestBody Proveedor proveedor) {
        return proveedorService.guardar(proveedor);
    }

    @PutMapping("/{id}")
    public Proveedor actualizar(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        return proveedorService.actualizar(id, proveedor);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
    }
}
