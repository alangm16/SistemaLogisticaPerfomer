package com.performer.logistics.service;

import com.performer.logistics.domain.Proveedor;
import com.performer.logistics.exception.BadRequestException;
import com.performer.logistics.repository.ProveedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    public Optional<Proveedor> buscarPorId(Long id) {
        return proveedorRepository.findById(id);
    }

    public Proveedor guardar(Proveedor proveedor) {
        if (proveedor.getEmail() != null && proveedorRepository.existsByEmail(proveedor.getEmail())) {
            throw new BadRequestException("Ya existe un proveedor con ese email");
        }
        return proveedorRepository.save(proveedor);

    }

    public Proveedor actualizar(Long id, Proveedor proveedorActualizado) {
        return proveedorRepository.findById(id)
                .map(p -> {
                    p.setNombre(proveedorActualizado.getNombre());
                    p.setEmail(proveedorActualizado.getEmail());
                    p.setTelefono(proveedorActualizado.getTelefono());
                    p.setPais(proveedorActualizado.getPais());
                    p.setCiudad(proveedorActualizado.getCiudad());
                    p.setActivo(proveedorActualizado.getActivo());
                    
                    if (proveedorActualizado.getEmail() != null && !proveedorActualizado.getEmail().equals(p.getEmail())
                            && proveedorRepository.existsByEmail(proveedorActualizado.getEmail())) {
                        throw new BadRequestException("Email ya registrado por otro proveedor");
}

                    return proveedorRepository.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id " + id));
    }

    public void eliminar(Long id) {
        proveedorRepository.deleteById(id);
    }
}