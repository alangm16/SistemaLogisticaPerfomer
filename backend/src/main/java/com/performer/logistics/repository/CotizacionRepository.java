package com.performer.logistics.repository;

import com.performer.logistics.domain.Cotizacion;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {
    List<Cotizacion> findBySolicitudId(Long solicitudId);
    List<Cotizacion> findByProveedorId(Long proveedorId);
    List<Cotizacion> findByEstado(Cotizacion.Estado estado);
    List<Cotizacion> findByTipoTransporte(Cotizacion.TipoTransporte tipo);
    // Método para búsqueda optimizada
    @Query("SELECT c FROM Cotizacion c WHERE " +
           "c.tipoTransporte = :tipoTransporte AND " +
           "(LOWER(c.origen) LIKE LOWER(CONCAT('%', :origen, '%')) OR " +
           "LOWER(c.destino) LIKE LOWER(CONCAT('%', :destino, '%'))) AND " +
           "c.creadoEn >= :fechaInicio")
    List<Cotizacion> findCotizacionesSimilares(
        @Param("tipoTransporte") Cotizacion.TipoTransporte tipoTransporte,
        @Param("origen") String origen,
        @Param("destino") String destino,
        @Param("fechaInicio") LocalDateTime fechaInicio
    );
    
    // Método simplificado
    List<Cotizacion> findByTipoTransporteAndOrigenContainingAndDestinoContaining(
        Cotizacion.TipoTransporte tipoTransporte,
        String origen,
        String destino
    );
    
    // Para obtener cotizaciones recientes
    List<Cotizacion> findByCreadoEnAfter(LocalDateTime fecha);
    
    // Por rango de costo (para sugerencias de precio similar)
    @Query("SELECT c FROM Cotizacion c WHERE " +
           "c.costo BETWEEN :minCosto AND :maxCosto AND " +
           "c.tipoTransporte = :tipoTransporte")
    List<Cotizacion> findByCostoBetweenAndTipoTransporte(
        @Param("minCosto") Double minCosto,
        @Param("maxCosto") Double maxCosto,
        @Param("tipoTransporte") Cotizacion.TipoTransporte tipoTransporte
    );
}