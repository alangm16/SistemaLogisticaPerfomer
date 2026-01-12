package com.performer.logistics.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "correo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación opcional con Solicitud
    @ManyToOne
    @JoinColumn(name = "solicitud_id")
    private Solicitud solicitud;

    // Relación opcional con Cotización
    @ManyToOne
    @JoinColumn(name = "cotizacion_id")
    private Cotizacion cotizacion;

    @Column(nullable = false, length = 160)
    private String destinatario;

    @Column(nullable = false, length = 160)
    private String asunto;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String cuerpo;

    @Column(name="enviado_en", nullable = false)
    private LocalDateTime enviadoEn = LocalDateTime.now();
}
