// com.performer.logistics.service.AuthService.java
package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.dto.LoginRequest;
import com.performer.logistics.dto.LoginResponse;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final EmpleadoRepository empleadoRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(EmpleadoRepository empleadoRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.empleadoRepository = empleadoRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Empleado empleado = empleadoRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña inválidos"));

        // Solo usuarios ACTIVO pueden iniciar sesión
        if (empleado.getEstado() != Empleado.Estado.ACTIVO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta no está activa");
        }

        // Comparar hash vs contraseña en texto
        if (!passwordEncoder.matches(request.getPassword(), empleado.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña inválidos");
        }

        String token = jwtUtil.generateToken(
                empleado.getEmail(),
                empleado.getRol().name(),
                empleado.getNombre()
        );
        

        return new LoginResponse(token, empleado.getRol().name(), empleado.getNombre());
    }
    
}



