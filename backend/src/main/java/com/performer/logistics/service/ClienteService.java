package com.performer.logistics.service;

import com.performer.logistics.domain.Cliente;
import com.performer.logistics.exception.BadRequestException;
import com.performer.logistics.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente guardar(Cliente cliente) {
        if (cliente.getEmail() != null && clienteRepository.existsByEmail(cliente.getEmail())) { 
            throw new BadRequestException("Ya existe un cliente con ese email"); 
        } 
        if (cliente.getRfc() != null && clienteRepository.existsByRfc(cliente.getRfc())) { 
            throw new BadRequestException("Ya existe un cliente con ese RFC"); 
        } 
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente clienteActualizado) {
        
        return clienteRepository.findById(id)
                .map(c -> {
                    c.setNombre(clienteActualizado.getNombre());
                    c.setRfc(clienteActualizado.getRfc());
                    c.setEmail(clienteActualizado.getEmail());
                    c.setTelefono(clienteActualizado.getTelefono());
                    c.setDireccion(clienteActualizado.getDireccion());
                    c.setCiudad(clienteActualizado.getCiudad());
                    c.setPais(clienteActualizado.getPais());
                    c.setCodigoPostal(clienteActualizado.getCodigoPostal());
                    c.setActivo(clienteActualizado.getActivo());
                    
                    if (clienteActualizado.getEmail() != null && !clienteActualizado.getEmail().equals(c.getEmail())
                            && clienteRepository.existsByEmail(clienteActualizado.getEmail())) {
                        throw new BadRequestException("Email ya registrado por otro cliente");
                    }
                    if (clienteActualizado.getRfc() != null && !clienteActualizado.getRfc().equals(c.getRfc())
                            && clienteRepository.existsByRfc(clienteActualizado.getRfc())) {
                        throw new BadRequestException("RFC ya registrado por otro cliente");
}

                    return clienteRepository.save(c);
                })
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id " + id));
    }

    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }
}
