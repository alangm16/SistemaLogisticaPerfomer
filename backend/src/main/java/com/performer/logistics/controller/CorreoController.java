package com.performer.logistics.controller;

import com.performer.logistics.domain.Correo;
import com.performer.logistics.service.CorreoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/correos")
public class CorreoController {

    private final CorreoService correoService;

    public CorreoController(CorreoService correoService) {
        this.correoService = correoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public List<Correo> listar() {
        return correoService.listarTodos();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public Correo crear(@RequestBody Correo correo) {
        return correoService.guardar(correo);
    }

    @GetMapping("/destinatario/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRICING','VENDEDOR')")
    public List<Correo> listarPorDestinatario(@PathVariable String email) {
        return correoService.listarPorDestinatario(email);
    }
}