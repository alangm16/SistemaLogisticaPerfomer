package com.performer.logistics.service;

import com.performer.logistics.domain.Correo;
import com.performer.logistics.repository.CorreoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CorreoService {

    private final CorreoRepository correoRepository;

    public CorreoService(CorreoRepository correoRepository) {
        this.correoRepository = correoRepository;
    }

    public List<Correo> listarTodos() {
        return correoRepository.findAll();
    }

    public Correo guardar(Correo correo) {
        return correoRepository.save(correo);
    }

    public List<Correo> listarPorDestinatario(String destinatario) {
        return correoRepository.findByDestinatario(destinatario);
    }
}
