// com.performer.logistics.service.AuthService.java
package com.performer.logistics.service;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.dto.LoginRequest;
import com.performer.logistics.dto.LoginResponse;
import com.performer.logistics.dto.RegisterRequest;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.security.JwtUtil;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final EmpleadoRepository empleadoRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final HistorialService historialService; // para registrar acciones

    public AuthService(EmpleadoRepository empleadoRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder,
                       HistorialService historialService) {
        this.empleadoRepository = empleadoRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.historialService = historialService;
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

    // Nuevo: registro de usuario (register)
    public Empleado register(RegisterRequest req) {
        // Validaciones básicas
        if (req.getEmail() == null || req.getPassword() == null || req.getNombre() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre, email y contraseña son obligatorios");
        }

        // Verificar unicidad de email
        if (empleadoRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese email");
        }

        // Crear entidad Empleado
        Empleado nuevo = new Empleado();
        nuevo.setNombre(req.getNombre());
        nuevo.setEmail(req.getEmail());
        // Guardar hash, nunca la contraseña en texto
        nuevo.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        // Rol por defecto (puedes cambiar a null si prefieres que admin asigne)
        nuevo.setRol(Empleado.Rol.VENDEDOR);
        // Estado inicial pendiente
        nuevo.setEstado(Empleado.Estado.PENDIENTE);
        nuevo.setCreadoEn(LocalDateTime.now());

        Empleado guardado = empleadoRepository.save(nuevo);

        // Registrar en historial: acción CREADO por el mismo usuario (o por sistema -> usuarioId = null)
        // Aquí usamos usuarioId = guardado.getId() para indicar quién fue creado; si quieres registrar actor distinto,
        // pasa el id del actor que ejecuta la acción.
        String detalle = String.format("{\"accion\":\"registro\",\"email\":\"%s\",\"rol\":\"%s\"}", guardado.getEmail(), guardado.getRol());
        try {
            historialService.registrar(Historial.EntidadTipo.USUARIO, guardado.getId(), "CREADO", detalle, guardado.getId());
        } catch (Exception ex) {
            // No bloquear el registro por fallo en auditoría; loguear
            // logger.warn("No se pudo registrar historial de creación de usuario", ex);
        }

        return guardado;
    }
}
