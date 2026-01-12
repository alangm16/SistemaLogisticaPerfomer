package com.performer.logistics.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cotizacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Solicitud
    @ManyToOne
    @JoinColumn(name = "solicitud_id", nullable = false)
    private Solicitud solicitud;

    // Relación con Proveedor
    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Enumerated(EnumType.STRING)
    @Column(name="tipo_transporte", nullable = false, length = 20)
    private TipoTransporte tipoTransporte;

    @Column(nullable = false, length = 160)
    private String origen;

    @Column(nullable = false, length = 160)
    private String destino;

    @Column(name="tipo_unidad", length = 120)
    private String tipoUnidad; // Trailer, Torton, Contenedor 40HQ, etc.

    @Column(name="tiempo_estimado", length = 80)
    private String tiempoEstimado; // Ej: "3-5 días"

    @Column(nullable = false)
    private Double costo;

    @Column(name="valido_hasta")
    private LocalDate validoHasta;

    @Column(name="dias_credito")
    private Integer diasCredito;

    @Column(name="margen_ganancia_pct")
    private Double margenGananciaPct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.PENDIENTE;

    @Column(name="creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    public enum TipoTransporte {
        TERRESTRE, MARITIMO, AEREO
    }

    public enum Estado {
        PENDIENTE, ENVIADO, COMPLETADO, CANCELADO
    }
}
