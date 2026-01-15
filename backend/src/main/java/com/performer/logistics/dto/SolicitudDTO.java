package com.performer.logistics.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SolicitudDTO(
    Long id,
    String folioCodigo,
    String empresaCodigo,
    LocalDate fechaEmision,
    Long clienteId,
    String clienteNombre,
    String tipoServicio,
    String origenPais,
    String origenCiudad,
    String destinoPais,
    String destinoCiudad,
    String estado,
    Long asignadoAId,
    Long creadoPorId,
    LocalDateTime creadoEn
) {}
