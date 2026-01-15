package com.performer.logistics.mapper;

import com.performer.logistics.domain.Empleado;
import com.performer.logistics.dto.EmpleadoDTO;

public class EmpleadoMapper {
    public static EmpleadoDTO toDTO(Empleado e) {
        return new EmpleadoDTO(
                e.getId(),
                e.getNombre(),
                e.getEmail(),
                e.getRol(),
                e.getEstado()
        );
    }
}
