package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.repository.EmpleadoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    public EmpleadoService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    public List<Empleado> listarTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> buscarPorId(Long id) {
        return empleadoRepository.findById(id);
    }

    public Empleado guardar(Empleado empleado) {
        return empleadoRepository.save(empleado);
    }

    public Empleado actualizar(Long id, Empleado empleadoActualizado) {
        return empleadoRepository.findById(id)
                .map(emp -> {
                    emp.setNombre(empleadoActualizado.getNombre());
                    emp.setEmail(empleadoActualizado.getEmail());
                    emp.setPasswordHash(empleadoActualizado.getPasswordHash());
                    emp.setRol(empleadoActualizado.getRol());
                    emp.setEstado(empleadoActualizado.getEstado());
                    return empleadoRepository.save(emp);
                })
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id " + id));
    }

    public void eliminar(Long id) {
        empleadoRepository.deleteById(id);
    }
}

