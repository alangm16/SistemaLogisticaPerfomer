package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.dto.LoginRequest;
import com.performer.logistics.dto.LoginResponse;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.security.JwtUtil;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final EmpleadoRepository empleadoRepository;
    private final JwtUtil jwtUtil;

    public AuthService(EmpleadoRepository empleadoRepository, JwtUtil jwtUtil) {
        this.empleadoRepository = empleadoRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {

        Empleado empleado = empleadoRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!empleado.getPasswordHash().equals(request.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(
                empleado.getEmail(),
                empleado.getRol().name(),
                empleado.getNombre()
        );

        return new LoginResponse(
                token,
                empleado.getRol().name(),
                empleado.getNombre()
        );
    }
}


