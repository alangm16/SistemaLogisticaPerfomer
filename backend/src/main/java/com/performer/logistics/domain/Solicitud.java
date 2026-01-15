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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFolioCodigo() {
        return folioCodigo;
    }

    public void setFolioCodigo(String folioCodigo) {
        this.folioCodigo = folioCodigo;
    }

    public String getEmpresaCodigo() {
        return empresaCodigo;
    }

    public void setEmpresaCodigo(String empresaCodigo) {
        this.empresaCodigo = empresaCodigo;
    }

    public LocalDate getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDate fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public TipoServicio getTipoServicio() {
        return tipoServicio;
    }

    public void setTipoServicio(TipoServicio tipoServicio) {
        this.tipoServicio = tipoServicio;
    }

    public String getOrigenPais() {
        return origenPais;
    }

    public void setOrigenPais(String origenPais) {
        this.origenPais = origenPais;
    }

    public String getOrigenCiudad() {
        return origenCiudad;
    }

    public void setOrigenCiudad(String origenCiudad) {
        this.origenCiudad = origenCiudad;
    }

    public String getOrigenDireccion() {
        return origenDireccion;
    }

    public void setOrigenDireccion(String origenDireccion) {
        this.origenDireccion = origenDireccion;
    }

    public String getOrigenCp() {
        return origenCp;
    }

    public void setOrigenCp(String origenCp) {
        this.origenCp = origenCp;
    }

    public String getDestinoPais() {
        return destinoPais;
    }

    public void setDestinoPais(String destinoPais) {
        this.destinoPais = destinoPais;
    }

    public String getDestinoCiudad() {
        return destinoCiudad;
    }

    public void setDestinoCiudad(String destinoCiudad) {
        this.destinoCiudad = destinoCiudad;
    }

    public String getDestinoDireccion() {
        return destinoDireccion;
    }

    public void setDestinoDireccion(String destinoDireccion) {
        this.destinoDireccion = destinoDireccion;
    }

    public String getDestinoCp() {
        return destinoCp;
    }

    public void setDestinoCp(String destinoCp) {
        this.destinoCp = destinoCp;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getLargoCm() {
        return largoCm;
    }

    public void setLargoCm(Double largoCm) {
        this.largoCm = largoCm;
    }

    public Double getAnchoCm() {
        return anchoCm;
    }

    public void setAnchoCm(Double anchoCm) {
        this.anchoCm = anchoCm;
    }

    public Double getAltoCm() {
        return altoCm;
    }

    public void setAltoCm(Double altoCm) {
        this.altoCm = altoCm;
    }

    public Double getPesoKg() {
        return pesoKg;
    }

    public void setPesoKg(Double pesoKg) {
        this.pesoKg = pesoKg;
    }

    public Boolean getApilable() {
        return apilable;
    }

    public void setApilable(Boolean apilable) {
        this.apilable = apilable;
    }

    public Double getValorDeclaradoUsd() {
        return valorDeclaradoUsd;
    }

    public void setValorDeclaradoUsd(Double valorDeclaradoUsd) {
        this.valorDeclaradoUsd = valorDeclaradoUsd;
    }

    public String getTipoEmpaque() {
        return tipoEmpaque;
    }

    public void setTipoEmpaque(String tipoEmpaque) {
        this.tipoEmpaque = tipoEmpaque;
    }

    public Boolean getMaterialPeligroso() {
        return materialPeligroso;
    }

    public void setMaterialPeligroso(Boolean materialPeligroso) {
        this.materialPeligroso = materialPeligroso;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public Empleado getAsignadoA() {
        return asignadoA;
    }

    public void setAsignadoA(Empleado asignadoA) {
        this.asignadoA = asignadoA;
    }

    public Empleado getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(Empleado creadoPor) {
        this.creadoPor = creadoPor;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
    
}

