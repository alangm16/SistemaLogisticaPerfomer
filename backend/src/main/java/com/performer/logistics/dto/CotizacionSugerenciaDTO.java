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
        
        
) {

    public CotizacionSugerenciaDTO(Long id, String folioSolicitud, String proveedorNombre, String tipoTransporte, String origen, String destino, String tipoUnidad, String tiempoEstimado, Double costo, LocalDate validoHasta, Integer diasCredito, Double margenGananciaPct, Double puntuacion, String razon) {
        this.id = id;
        this.folioSolicitud = folioSolicitud;
        this.proveedorNombre = proveedorNombre;
        this.tipoTransporte = tipoTransporte;
        this.origen = origen;
        this.destino = destino;
        this.tipoUnidad = tipoUnidad;
        this.tiempoEstimado = tiempoEstimado;
        this.costo = costo;
        this.validoHasta = validoHasta;
        this.diasCredito = diasCredito;
        this.margenGananciaPct = margenGananciaPct;
        this.puntuacion = puntuacion;
        this.razon = razon;
    }
       
}
