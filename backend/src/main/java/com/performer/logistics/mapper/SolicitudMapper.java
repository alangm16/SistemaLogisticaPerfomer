package com.performer.logistics.mapper;

import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.dto.SolicitudDTO;

public class SolicitudMapper {
    public static SolicitudDTO toDTO(Solicitud s) {
        return new SolicitudDTO(
            s.getId(),
            s.getFolioCodigo(),
            s.getEmpresaCodigo(),
            s.getFechaEmision(),
            s.getCliente().getId(),
            s.getCliente().getNombre(),
            s.getTipoServicio().name(),
            s.getOrigenPais(),
            s.getOrigenCiudad(),
            s.getDestinoPais(),
            s.getDestinoCiudad(),
            s.getEstado().name(),
            s.getAsignadoA() != null ? s.getAsignadoA().getId() : null,
            s.getCreadoPor() != null ? s.getCreadoPor().getId() : null,
            s.getCreadoEn()
        );
    }
}
