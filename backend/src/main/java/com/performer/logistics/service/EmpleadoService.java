// com.performer.logistics.service.EmpleadoService.java
package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.repository.EmpleadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmpleadoService {
    private final EmpleadoRepository repo; 
    private final PasswordEncoder passwordEncoder; 
    
    public EmpleadoService(EmpleadoRepository repo, PasswordEncoder passwordEncoder) { 
        this.repo = repo; this.passwordEncoder = passwordEncoder; 
    }

    public List<Empleado> listar() { return repo.findAll(); }

    public Empleado obtener(Long id) { 
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empleado no encontrado")); 
    }

    public Empleado crear(Empleado e) { e.setPasswordHash(passwordEncoder.encode(e.getPasswordHash())); // e.passwordHash viene en texto 
        return repo.save(e); 
    } 
    
    public Empleado actualizar(Long id, Empleado data) { 
        Empleado e = obtener(id); 
        e.setNombre(data.getNombre()); 
        e.setEmail(data.getEmail()); 
        if (data.getPasswordHash() != null && !data.getPasswordHash().isBlank()) { 
            e.setPasswordHash(passwordEncoder.encode(data.getPasswordHash())); 
        } 
        e.setRol(data.getRol()); 
        e.setEstado(data.getEstado()); return repo.save(e); 
    }

    public void eliminar(Long id) { repo.deleteById(id); }

    public Empleado aprobar(Long id) {
        Empleado e = obtener(id);
        e.setEstado(Empleado.Estado.ACTIVO);
        return repo.save(e);
    }

    public Empleado rechazar(Long id) {
        Empleado e = obtener(id);
        e.setEstado(Empleado.Estado.INACTIVO);
        return repo.save(e);
    }

    public Empleado cambiarRol(Long id, Empleado.Rol rol) {
        Empleado e = obtener(id);
        e.setRol(rol);
        return repo.save(e);
    }
}

