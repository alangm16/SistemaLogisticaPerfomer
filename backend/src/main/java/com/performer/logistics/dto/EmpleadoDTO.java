package com.performer.logistics.dto;

import com.performer.logistics.domain.Empleado;

public record EmpleadoDTO(
        Long id,
        String nombre,
        String email,
        Empleado.Rol rol,
        Empleado.Estado estado
        ) {
}