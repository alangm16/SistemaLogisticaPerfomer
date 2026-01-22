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

    /*public Historial() {
    }*/

    public Historial(Long id, EntidadTipo entidadTipo, Long entidadId, String accion, String detalle, Empleado usuario) {
        this.id = id;
        this.entidadTipo = entidadTipo;
        this.entidadId = entidadId;
        this.accion = accion;
        this.detalle = detalle;
        this.usuario = usuario;
    }
    
    public enum EntidadTipo {
        SOLICITUD, COTIZACION, USUARIO
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EntidadTipo getEntidadTipo() {
        return entidadTipo;
    }

    public void setEntidadTipo(EntidadTipo entidadTipo) {
        this.entidadTipo = entidadTipo;
    }

    public Long getEntidadId() {
        return entidadId;
    }

    public void setEntidadId(Long entidadId) {
        this.entidadId = entidadId;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public Empleado getUsuario() {
        return usuario;
    }

    public void setUsuario(Empleado usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public static HistorialBuilder builder() {
    return new HistorialBuilder();
}

    public static class HistorialBuilder {
        private Long id;
        private EntidadTipo entidadTipo;
        private Long entidadId;
        private String accion;
        private String detalle;
        private Empleado usuario;
        private LocalDateTime timestamp = LocalDateTime.now();

        public HistorialBuilder id(Long id) { this.id = id; return this; }
        public HistorialBuilder entidadTipo(EntidadTipo entidadTipo) { this.entidadTipo = entidadTipo; return this; }
        public HistorialBuilder entidadId(Long entidadId) { this.entidadId = entidadId; return this; }
        public HistorialBuilder accion(String accion) { this.accion = accion; return this; }
        public HistorialBuilder detalle(String detalle) { this.detalle = detalle; return this; }
        public HistorialBuilder usuario(Empleado usuario) { this.usuario = usuario; return this; }
        public HistorialBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public Historial build() {
            return new Historial(id, entidadTipo, entidadId, accion, detalle, usuario);
        }
    }
}