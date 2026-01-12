package com.performer.logistics.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="folio_codigo", nullable = false, unique = true, length = 30)
    private String folioCodigo;   // PER-00001-2025

    @Column(name="empresa_codigo", nullable = false, length = 10)
    private String empresaCodigo; // PER, KLI, GAM, etc.

    @Column(name="fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @ManyToOne
    @JoinColumn(name="cliente_id", nullable = false)
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(name="tipo_servicio", nullable = false, length = 20)
    private TipoServicio tipoServicio;

    // Origen
    private String origenPais;
    private String origenCiudad;
    private String origenDireccion;
    private String origenCp;

    // Destino
    private String destinoPais;
    private String destinoCiudad;
    private String destinoDireccion;
    private String destinoCp;

    // Datos de carga
    private Integer cantidad;
    private Double largoCm;
    private Double anchoCm;
    private Double altoCm;
    private Double pesoKg;
    private Boolean apilable;
    private Double valorDeclaradoUsd;
    private String tipoEmpaque;
    private Boolean materialPeligroso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.PENDIENTE;

    @ManyToOne
    @JoinColumn(name="asignado_a")
    private Empleado asignadoA;

    @ManyToOne
    @JoinColumn(name="creado_por", nullable = false)
    private Empleado creadoPor;

    @Column(name="creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    public enum TipoServicio {
        TERRESTRE, MARITIMO, AEREO, MULTIMODAL, EXCESO_DIMENSIONES
    }

    public enum Estado {
        PENDIENTE, ENVIADO, COMPLETADO, CANCELADO
    }
}

