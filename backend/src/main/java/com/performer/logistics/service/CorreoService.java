package com.performer.logistics.service;

import com.performer.logistics.domain.Correo;
import com.performer.logistics.repository.CorreoRepository;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;

@Service
public class CorreoService {

    private final CorreoRepository correoRepository;
    private final JavaMailSender mailSender;
    
    public CorreoService(CorreoRepository correoRepository, JavaMailSender mailSender) { 
        this.correoRepository = correoRepository; 
        this.mailSender = mailSender; 
    }

    public List<Correo> listarTodos() {
        return correoRepository.findAll();
    }

    public List<Correo> listarPorDestinatario(String destinatario) {
        return correoRepository.findByDestinatario(destinatario);
    }
    
    public Correo guardar(Correo correo) { 
        // enviar correo 
        SimpleMailMessage msg = new SimpleMailMessage(); 
        msg.setTo(correo.getDestinatario()); 
        msg.setSubject(correo.getAsunto()); 
        msg.setText(correo.getCuerpo()); 
        mailSender.send(msg); // persistir log 
        return correoRepository.save(correo); 
    }
}
