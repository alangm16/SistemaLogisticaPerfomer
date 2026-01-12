package com.performer.logistics.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Historial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name="entidad_tipo", nullable = false, length = 20)
    private EntidadTipo entidadTipo; // SOLICITUD, COTIZACION, USUARIO

    @Column(name="entidad_id", nullable = false)
    private Long entidadId; // ID de la entidad afectada

    @Column(nullable = false, length = 80)
    private String accion; // Ej: "CREADO", "ESTADO_CAMBIADO", "ASIGNADO"

    @Column(columnDefinition = "TEXT")
    private String detalle; // JSON o texto con los cambios

    @ManyToOne
    @JoinColumn(name="usuario_id", nullable = false)
    private Empleado usuario; // quién hizo el cambio

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum EntidadTipo {
        SOLICITUD, COTIZACION, USUARIO
    }
}
