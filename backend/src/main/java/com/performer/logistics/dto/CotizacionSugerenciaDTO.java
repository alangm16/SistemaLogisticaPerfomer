// com.performer.logistics.dto
package com.performer.logistics.dto;

import java.time.LocalDate;

public record CotizacionSugerenciaDTO(
        Long id,
        String folioSolicitud,
        String proveedorNombre,
        String tipoTransporte,
        String origen,
        String destino,
        String tipoUnidad,
        String tiempoEstimado,  
        Double costo,
        LocalDate validoHasta, 
        Integer diasCredito,
        Double margenGananciaPct,
        Double puntuacion,
        String razon
) {}
