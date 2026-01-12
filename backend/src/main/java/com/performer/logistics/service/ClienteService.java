package com.performer.logistics.service;

import com.performer.logistics.domain.Cliente;
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
                    return clienteRepository.save(c);
                })
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id " + id));
    }

    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }
}
