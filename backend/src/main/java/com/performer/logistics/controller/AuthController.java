package com.performer.logistics.controller;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.dto.LoginRequest;
import com.performer.logistics.dto.LoginResponse;
import com.performer.logistics.dto.RegisterRequest;
import com.performer.logistics.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
      LoginResponse resp = authService.login(request);
      return ResponseEntity.ok(resp);
    }

    @PostMapping("/register") 
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) { 
        Empleado creado = authService.register(req);
        // No devolver passwordHash; mapear a DTO si quieres 
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", creado.getId(), "email", creado.getEmail(), "estado", creado.getEstado())); 
    }
}