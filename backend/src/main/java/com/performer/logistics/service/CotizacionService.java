package com.performer.logistics.service;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.domain.Proveedor;
import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.dto.CalculadoraMargenDTO;
import com.performer.logistics.dto.CotizacionComparativaDTO;
import com.performer.logistics.dto.CotizacionSugerenciaDTO;
import com.performer.logistics.exception.BadRequestException;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.CotizacionRepository;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.repository.SolicitudRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final HistorialService historialService;
    private final SolicitudRepository solicitudRepository;
    private final EmpleadoRepository empleadoRepository;

    public CotizacionService(CotizacionRepository cotizacionRepository, HistorialService historialService, SolicitudRepository solicitudRepository, 
            EmpleadoRepository empleadoRepository) {
        this.cotizacionRepository = cotizacionRepository;
        this.historialService = historialService;
        this.solicitudRepository = solicitudRepository;
        this.empleadoRepository = empleadoRepository;
    }

    public List<Cotizacion> listarTodas() {
        return cotizacionRepository.findAll();
    }
    
    public Cotizacion buscarPorId(Long id) {
        return cotizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización no encontrada con id: " + id));
    }

    public Cotizacion guardar(Cotizacion cotizacion) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado para el email: " + email));

        // Si es una cotización existente, verificar si cambió el estado
        if (cotizacion.getId() != null) {
            Cotizacion existente = cotizacionRepository.findById(cotizacion.getId()).orElse(null);
            if (existente != null && !existente.getEstado().equals(cotizacion.getEstado())) {
                // Registrar cambio de estado en historial
                historialService.registrar(
                    Historial.EntidadTipo.COTIZACION,
                    cotizacion.getId(),
                    "ESTADO_CAMBIADO",
                    String.format("{\"estado_anterior\":\"%s\",\"estado_nuevo\":\"%s\"}", 
                        existente.getEstado(), cotizacion.getEstado()),
                    usuario.getId()
                );
            }
        }

        Cotizacion c = cotizacionRepository.save(cotizacion);

        // Registrar creación si es nueva
        if (cotizacion.getId() == null) {
            historialService.registrar(
                Historial.EntidadTipo.COTIZACION,
                c.getId(),
                "CREADO",
                "Cotización creada",
                usuario.getId()
            );
        }

        return c;
    }

    // Nuevo método para cambiar estado con validación de workflow
    public Cotizacion cambiarEstado(Long id, Cotizacion.Estado nuevoEstado, Empleado usuario) {
        Cotizacion cotizacion = buscarPorId(id);
        Cotizacion.Estado estadoAnterior = cotizacion.getEstado();

        // Validar transición de estado permitida
        if (!validarTransicionEstado(estadoAnterior, nuevoEstado)) {
            throw new BadRequestException(
                String.format("Transición de estado no permitida: %s -> %s", 
                    estadoAnterior, nuevoEstado)
            );
        }

        cotizacion.setEstado(nuevoEstado);
        Cotizacion actualizada = cotizacionRepository.save(cotizacion);

        // Registrar en historial
        historialService.registrar(
            Historial.EntidadTipo.COTIZACION,
            id,
            "ESTADO_CAMBIADO",
            String.format("{\"estado_anterior\":\"%s\",\"estado_nuevo\":\"%s\",\"comentario\":\"Cambio manual de estado\"}",
                estadoAnterior, nuevoEstado),
            usuario.getId()
        );

        return actualizada;
    }

    // Método para validar transiciones de estado
    private boolean validarTransicionEstado(Cotizacion.Estado actual, Cotizacion.Estado nuevo) {
        // Workflow: PENDIENTE -> ENVIADO -> COMPLETADO
        //            PENDIENTE -> CANCELADO (en cualquier momento)
        Map<Cotizacion.Estado, List<Cotizacion.Estado>> transicionesPermitidas = Map.of(
            Cotizacion.Estado.PENDIENTE, Arrays.asList(
                Cotizacion.Estado.ENVIADO, 
                Cotizacion.Estado.CANCELADO
            ),
            Cotizacion.Estado.ENVIADO, Arrays.asList(
                Cotizacion.Estado.COMPLETADO,
                Cotizacion.Estado.CANCELADO
            ),
            Cotizacion.Estado.COMPLETADO, Arrays.asList(), // No se puede cambiar desde completado
            Cotizacion.Estado.CANCELADO, Arrays.asList()   // No se puede cambiar desde cancelado
        );

        return transicionesPermitidas.getOrDefault(actual, new ArrayList<>())
                .contains(nuevo);
    }

    // Método para obtener historial completo de una cotización
    public List<Historial> obtenerHistorialCotizacion(Long cotizacionId) {
        return historialService.listarPorEntidad(
            Historial.EntidadTipo.COTIZACION, 
            cotizacionId
        );
    }

    public List<Cotizacion> listarPorSolicitud(Long solicitudId) {
        return cotizacionRepository.findBySolicitudId(solicitudId);
    }
    
    public void eliminar(Long id) {
        Cotizacion cotizacion = buscarPorId(id);
        cotizacionRepository.delete(cotizacion);
        
        // Registrar eliminación en historial
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado"));
                
        historialService.registrar(
            Historial.EntidadTipo.COTIZACION,
            id,
            "ELIMINADO",
            "Cotización eliminada",
            usuario.getId()
        );
    }
    
    public List<Cotizacion> sugerenciasPorSolicitud(Long solicitudId) {
        Solicitud s = solicitudRepository.findById(solicitudId)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        List<Cotizacion> todas = cotizacionRepository.findAll();

        return todas.stream()
            .filter(c -> c.getTipoTransporte().name().equals(s.getTipoServicio().name()))
            .filter(c -> {
                // Origen
                boolean origenOk = false;
                if (s.getOrigenCiudad() != null && s.getOrigenPais() != null) {
                    origenOk = c.getOrigen().toLowerCase().contains(s.getOrigenCiudad().toLowerCase())
                        && c.getOrigen().toLowerCase().contains(s.getOrigenPais().toLowerCase());
                } else if (s.getOrigenCiudad() != null) {
                    origenOk = c.getOrigen().toLowerCase().contains(s.getOrigenCiudad().toLowerCase());
                } else if (s.getOrigenPais() != null) {
                    origenOk = c.getOrigen().toLowerCase().contains(s.getOrigenPais().toLowerCase());
                }
                return origenOk;
            })
            .filter(c -> {
                // Destino
                boolean destinoOk = false;
                if (s.getDestinoCiudad() != null && s.getDestinoPais() != null) {
                    destinoOk = c.getDestino().toLowerCase().contains(s.getDestinoCiudad().toLowerCase())
                        && c.getDestino().toLowerCase().contains(s.getDestinoPais().toLowerCase());
                } else if (s.getDestinoCiudad() != null) {
                    destinoOk = c.getDestino().toLowerCase().contains(s.getDestinoCiudad().toLowerCase());
                } else if (s.getDestinoPais() != null) {
                    destinoOk = c.getDestino().toLowerCase().contains(s.getDestinoPais().toLowerCase());
                }
                return destinoOk;
            })
            .limit(5)
            .collect(Collectors.toList());
    }
    
    // Método mejorado con puntuación y ranking
    public List<CotizacionSugerenciaDTO> sugerenciasAvanzadas(Long solicitudId) {
        Solicitud solicitudActual = solicitudRepository.findById(solicitudId)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        // Obtener cotizaciones de los últimos 6 meses para mayor relevancia
        LocalDateTime fechaLimite = LocalDateTime.now().minusMonths(6);
        List<Cotizacion> cotizacionesRecientes = cotizacionRepository.findByCreadoEnAfter(fechaLimite);

        List<CotizacionSugerenciaDTO> sugerencias = cotizacionesRecientes.stream()
        .map(c -> calcularPuntuacion(c, solicitudActual))
        .filter(dto -> dto.puntuacion() >= 30.0)   // 👈 AQUÍ
        .sorted(Comparator.comparing(CotizacionSugerenciaDTO::puntuacion).reversed()) // 👈 Y AQUÍ
        .limit(10)
        .collect(Collectors.toList());

        return sugerencias;
    }
    
    private CotizacionSugerenciaDTO calcularPuntuacion(Cotizacion cotizacion, Solicitud solicitudActual) {
         double puntuacion = 0.0;
         List<String> razones = new ArrayList<>();

         // Obtener la solicitud original de esta cotización
         Solicitud solicitudOriginal = cotizacion.getSolicitud();

         // 1. Tipo de transporte (20 puntos)
         if (cotizacion.getTipoTransporte().name().equals(solicitudActual.getTipoServicio().name())) {
             puntuacion += 20;
             razones.add("Mismo tipo de transporte");
         }

         // 2. Origen similar (15 puntos)
         if (esUbicacionSimilar(cotizacion.getOrigen(), 
                                solicitudActual.getOrigenCiudad(), 
                                solicitudActual.getOrigenPais())) {
             puntuacion += 15;
             razones.add("Origen similar");
         }

         // 3. Destino similar (15 puntos)
         if (esUbicacionSimilar(cotizacion.getDestino(), 
                                solicitudActual.getDestinoCiudad(), 
                                solicitudActual.getDestinoPais())) {
             puntuacion += 15;
             razones.add("Destino similar");
         }

         // 4. Proveedor confiable (10 puntos)
         if (cotizacion.getProveedor().getActivo() && 
             "bueno".equalsIgnoreCase(calificarProveedor(cotizacion.getProveedor()))) {
             puntuacion += 10;
             razones.add("Proveedor confiable");
         }

         // 5. Peso similar (15 puntos) - Comparar con la solicitud original
         if (solicitudActual.getPesoKg() != null && solicitudOriginal.getPesoKg() != null) {
             double diferenciaPorcentual = Math.abs(
                 (solicitudOriginal.getPesoKg() - solicitudActual.getPesoKg()) / solicitudActual.getPesoKg() * 100
             );
             if (diferenciaPorcentual <= 20) { // +/- 20%
                 puntuacion += 15;
                 razones.add("Peso similar");
             }
         }

         // 6. Tipo de empaque similar (10 puntos) - Comparar con la solicitud original
         if (solicitudActual.getTipoEmpaque() != null && 
             solicitudOriginal.getTipoEmpaque() != null &&
             solicitudActual.getTipoEmpaque().equalsIgnoreCase(solicitudOriginal.getTipoEmpaque())) {
             puntuacion += 10;
             razones.add("Mismo tipo de empaque");
         }

         // 7. Reciente (15 puntos basado en antigüedad)
         long diasAntiguedad = ChronoUnit.DAYS.between(
             cotizacion.getCreadoEn().toLocalDate(), 
             LocalDate.now()
         );
         if (diasAntiguedad <= 30) {
             puntuacion += 15;
             razones.add("Cotización reciente");
         } else if (diasAntiguedad <= 90) {
             puntuacion += 10;
             razones.add("Cotización moderadamente reciente");
         } else {
             puntuacion += 5;
         }

         // 8. Material peligroso coincidente (5 puntos)
         if (solicitudActual.getMaterialPeligroso() != null && 
             solicitudOriginal.getMaterialPeligroso() != null &&
             solicitudActual.getMaterialPeligroso().equals(solicitudOriginal.getMaterialPeligroso())) {
             puntuacion += 5;
             razones.add("Mismo tipo de material (peligroso/no peligroso)");
         }

         String razonTexto = String.join(", ", razones);

         return new CotizacionSugerenciaDTO(
             cotizacion.getId(),
             cotizacion.getSolicitud().getFolioCodigo(),
             cotizacion.getProveedor().getNombre(),
             cotizacion.getTipoTransporte().name(),
             cotizacion.getOrigen(),
             cotizacion.getDestino(),
             cotizacion.getTipoUnidad(),
             cotizacion.getTiempoEstimado(),
             cotizacion.getCosto(),
             cotizacion.getValidoHasta(),
             cotizacion.getDiasCredito(),
             cotizacion.getMargenGananciaPct(),
             Math.min(100, puntuacion), // Cap a 100
             razonTexto
         );
     }
    
    private boolean esUbicacionSimilar(String ubicacionCotizacion, 
                                       String ciudadSolicitud, 
                                       String paisSolicitud) {
        if (ubicacionCotizacion == null || ciudadSolicitud == null) return false;
        
        String ubicacionLower = ubicacionCotizacion.toLowerCase();
        String ciudadLower = ciudadSolicitud.toLowerCase();
        
        // Verificar coincidencia de ciudad
        boolean coincideCiudad = ubicacionLower.contains(ciudadLower);
        
        // Si hay país, verificarlo también
        if (paisSolicitud != null) {
            String paisLower = paisSolicitud.toLowerCase();
            boolean coincidePais = ubicacionLower.contains(paisLower);
            return coincideCiudad || coincidePais;
        }
        
        return coincideCiudad;
    }
    
    private String calificarProveedor(Proveedor proveedor) {
        // Lógica simple de calificación
        // En producción, podrías usar historial de entregas a tiempo, calidad, etc.
        return "bueno"; // Simplificado para el ejemplo
    }
    
    // Método para obtener cotizaciones por atributos específicos
    public List<Cotizacion> buscarCotizacionesSimilares(Solicitud solicitud) {
        // Consulta optimizada con múltiples criterios
        return cotizacionRepository.findByTipoTransporteAndOrigenContainingAndDestinoContaining(
            Cotizacion.TipoTransporte.valueOf(solicitud.getTipoServicio().name()),
            solicitud.getOrigenCiudad(),
            solicitud.getDestinoCiudad()
        );
    }
    
    // En CotizacionService.java
    public Cotizacion reutilizarCotizacion(Long cotizacionId, Long nuevaSolicitudId, Double nuevoCosto) {
        // 1. Obtener la cotización original
        Cotizacion original = buscarPorId(cotizacionId);

        // 2. Obtener la nueva solicitud
        Solicitud nuevaSolicitud = solicitudRepository.findById(nuevaSolicitudId)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        // 3. Crear nueva cotización basada en la original
        Cotizacion nueva = new Cotizacion();
        nueva.setSolicitud(nuevaSolicitud);
        nueva.setProveedor(original.getProveedor());
        nueva.setTipoTransporte(original.getTipoTransporte());
        nueva.setOrigen(original.getOrigen());
        nueva.setDestino(original.getDestino());
        nueva.setTipoUnidad(original.getTipoUnidad());
        nueva.setTiempoEstimado(original.getTiempoEstimado());

        // 4. Usar nuevo costo si se especifica, sino el original
        nueva.setCosto(nuevoCosto != null ? nuevoCosto : original.getCosto());

        nueva.setValidoHasta(LocalDate.now().plusDays(30)); // 30 días de validez
        nueva.setDiasCredito(original.getDiasCredito());
        nueva.setMargenGananciaPct(original.getMargenGananciaPct());
        nueva.setEstado(Cotizacion.Estado.PENDIENTE);

        // 5. Guardar y registrar en historial
        Cotizacion guardada = guardar(nueva);

        // Registrar acción de reutilización
        historialService.guardar(Historial.builder()
            .entidadTipo(Historial.EntidadTipo.COTIZACION)
            .entidadId(guardada.getId())
            .accion("REUTILIZADA")
            .detalle(String.format("Reutilizada de cotización ID %d con ajuste de costo: %s", 
                    original.getId(), (nuevoCosto != null ? "Sí" : "No")))
            .usuario(original.getSolicitud().getCreadoPor())
            .timestamp(LocalDateTime.now())
            .build());

        return guardada;
    }
    
    /**
     * NUEVOS MÉTODOS PARA MÁRGENES Y COMPARACIÓN
     */
    
    /**
     * Calcula métricas financieras para una cotización
     */
    public CalculadoraMargenDTO calcularMargen(
            Double costoProveedor, 
            Double costosAdicionales,
            Double margenDeseadoPct,
            Long solicitudId) {
        
        // Validar inputs
        if (costoProveedor == null || costoProveedor <= 0) {
            throw new BadRequestException("El costo del proveedor debe ser mayor a 0");
        }
        
        costosAdicionales = costosAdicionales != null ? costosAdicionales : 0.0;
        margenDeseadoPct = margenDeseadoPct != null ? margenDeseadoPct : 15.0; // 15% por defecto
        
        // Calcular costo total
        Double costoTotal = costoProveedor + costosAdicionales;
        
        // Margen mínimo recomendado (10%)
        Double margenMinimoPct = 10.0;
        
        // Calcular precios de venta
        Double precioVentaSugerido = costoTotal / (1 - (margenDeseadoPct / 100));
        Double precioVentaMinimo = costoTotal / (1 - (margenMinimoPct / 100));
        
        // Calcular utilidades
        Double utilidadEstimada = precioVentaSugerido - costoTotal;
        Double utilidadMinima = precioVentaMinimo - costoTotal;
        
        // ROI
        Double roi = (utilidadEstimada / costoTotal) * 100;
        
        // Obtener precios de mercado para la solicitud
        Map<String, Double> preciosMercado = obtenerPreciosMercado(solicitudId);
        
        // Determinar posición en el mercado
        String posicionMercado = determinarPosicionMercado(
            precioVentaSugerido, 
            preciosMercado.get("promedio")
        );
        
        // Generar recomendaciones
        String recomendacion = generarRecomendacion(
            margenDeseadoPct, 
            precioVentaSugerido, 
            preciosMercado
        );
        
        // Generar alertas
        String alertas = generarAlertas(margenDeseadoPct, posicionMercado);
        
        return CalculadoraMargenDTO.builder()
            .costoProveedor(costoProveedor)
            .costosAdicionales(costosAdicionales)
            .costoTotal(costoTotal)
            .margenDeseadoPct(margenDeseadoPct)
            .margenMinimoPct(margenMinimoPct)
            .precioVentaSugerido(Math.round(precioVentaSugerido * 100.0) / 100.0)
            .precioVentaMinimo(Math.round(precioVentaMinimo * 100.0) / 100.0)
            .utilidadEstimada(Math.round(utilidadEstimada * 100.0) / 100.0)
            .utilidadMinima(Math.round(utilidadMinima * 100.0) / 100.0)
            .precioMercadoPromedio(preciosMercado.get("promedio"))
            .precioMercadoMinimo(preciosMercado.get("minimo"))
            .precioMercadoMaximo(preciosMercado.get("maximo"))
            .posicionMercado(posicionMercado)
            .recomendacion(recomendacion)
            .alertas(alertas)
            .roi(Math.round(roi * 100.0) / 100.0)
            .build();
    }
    
    /**
     * Aplica un margen de ganancia a una cotización existente
     */
    public Cotizacion aplicarMargen(Long cotizacionId, Double margenPct) {
        Cotizacion cotizacion = buscarPorId(cotizacionId);
        
        if (margenPct == null || margenPct < 0 || margenPct > 100) {
            throw new BadRequestException("El margen debe estar entre 0 y 100");
        }
        
        // Guardar margen anterior para historial
        Double margenAnterior = cotizacion.getMargenGananciaPct();
        
        // Aplicar nuevo margen
        cotizacion.setMargenGananciaPct(margenPct);
        
        // Guardar
        Cotizacion actualizada = cotizacionRepository.save(cotizacion);
        
        // Registrar en historial
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado"));
        
        historialService.registrar(
            Historial.EntidadTipo.COTIZACION,
            cotizacionId,
            "MARGEN_ACTUALIZADO",
            String.format("{\"margen_anterior\":\"%s\",\"margen_nuevo\":\"%s\"}", 
                margenAnterior, margenPct),
            usuario.getId()
        );
        
        return actualizada;
    }
    
    /**
     * Compara múltiples cotizaciones de una solicitud
     */
    public List<CotizacionComparativaDTO> compararCotizaciones(Long solicitudId) {
        List<Cotizacion> cotizaciones = cotizacionRepository.findBySolicitudId(solicitudId);
        
        if (cotizaciones.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Convertir a DTOs con métricas
        List<CotizacionComparativaDTO> comparativas = cotizaciones.stream()
            .map(this::convertirAComparativa)
            .collect(Collectors.toList());
        
        // Asignar rankings
        asignarRankings(comparativas);
        
        return comparativas;
    }
    
    /**
     * Métodos auxiliares privados
     */
    
    private Map<String, Double> obtenerPreciosMercado(Long solicitudId) {
        if (solicitudId == null) {
            return Map.of(
                "promedio", 0.0,
                "minimo", 0.0,
                "maximo", 0.0
            );
        }
        
        List<Cotizacion> cotizacionesSolicitud = cotizacionRepository.findBySolicitudId(solicitudId);
        
        if (cotizacionesSolicitud.isEmpty()) {
            return Map.of(
                "promedio", 0.0,
                "minimo", 0.0,
                "maximo", 0.0
            );
        }
        
        List<Double> costos = cotizacionesSolicitud.stream()
            .map(Cotizacion::getCosto)
            .filter(c -> c != null && c > 0)
            .collect(Collectors.toList());
        
        if (costos.isEmpty()) {
            return Map.of(
                "promedio", 0.0,
                "minimo", 0.0,
                "maximo", 0.0
            );
        }
        
        Double promedio = costos.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
        
        Double minimo = costos.stream()
            .mapToDouble(Double::doubleValue)
            .min()
            .orElse(0.0);
        
        Double maximo = costos.stream()
            .mapToDouble(Double::doubleValue)
            .max()
            .orElse(0.0);
        
        return Map.of(
            "promedio", Math.round(promedio * 100.0) / 100.0,
            "minimo", Math.round(minimo * 100.0) / 100.0,
            "maximo", Math.round(maximo * 100.0) / 100.0
        );
    }
    
    private String determinarPosicionMercado(Double precioSugerido, Double precioPromedio) {
        if (precioPromedio == null || precioPromedio == 0) {
            return "SIN DATOS";
        }
        
        double diferenciaPct = ((precioSugerido - precioPromedio) / precioPromedio) * 100;
        
        if (diferenciaPct < -10) {
            return "POR DEBAJO";
        } else if (diferenciaPct > 10) {
            return "POR ENCIMA";
        } else {
            return "EN RANGO";
        }
    }
    
    private String generarRecomendacion(
            Double margen, 
            Double precioSugerido, 
            Map<String, Double> preciosMercado) {
        
        StringBuilder recomendacion = new StringBuilder();
        
        // Análisis de margen
        if (margen < 10) {
            recomendacion.append("⚠ Margen bajo. Considera incrementar al menos a 10%. ");
        } else if (margen >= 10 && margen <= 20) {
            recomendacion.append("✓ Margen aceptable. ");
        } else if (margen > 20 && margen <= 30) {
            recomendacion.append("✓ Margen bueno. ");
        } else {
            recomendacion.append("⚠ Margen muy alto. Verifica competitividad. ");
        }
        
        // Análisis de posición en mercado
        if (preciosMercado.get("promedio") > 0) {
            double diferencia = precioSugerido - preciosMercado.get("promedio");
            
            if (diferencia < 0) {
                recomendacion.append("Precio por debajo del promedio - muy competitivo. ");
            } else if (diferencia > preciosMercado.get("promedio") * 0.15) {
                recomendacion.append("Precio significativamente sobre el promedio - revisar estrategia. ");
            }
        }
        
        return recomendacion.toString();
    }
    
    private String generarAlertas(Double margen, String posicionMercado) {
        List<String> alertas = new ArrayList<>();
        
        if (margen < 10) {
            alertas.add("Margen por debajo del mínimo recomendado (10%)");
        }
        
        if (margen > 30) {
            alertas.add("Margen muy alto - puede afectar competitividad");
        }
        
        if ("POR ENCIMA".equals(posicionMercado)) {
            alertas.add("Precio por encima del mercado");
        }
        
        return alertas.isEmpty() ? null : String.join(". ", alertas);
    }
    
    private CotizacionComparativaDTO convertirAComparativa(Cotizacion c) {
        // Calcular precio de venta basado en margen
        Double precioVenta = null;
        if (c.getMargenGananciaPct() != null && c.getMargenGananciaPct() > 0) {
            precioVenta = c.getCosto() / (1 - (c.getMargenGananciaPct() / 100));
        }
        
        // Calcular utilidad estimada
        Double utilidad = precioVenta != null ? precioVenta - c.getCosto() : null;
        
        // Calcular ROI
        Double roi = utilidad != null && c.getCosto() > 0 ? 
            (utilidad / c.getCosto()) * 100 : null;
        
        // Calcular días de vigencia restantes
        Integer diasVigencia = null;
        String estadoVigencia = "SIN FECHA";
        
        if (c.getValidoHasta() != null) {
            diasVigencia = (int) ChronoUnit.DAYS.between(LocalDate.now(), c.getValidoHasta());
            
            if (diasVigencia < 0) {
                estadoVigencia = "VENCIDO";
            } else if (diasVigencia <= 7) {
                estadoVigencia = "PRÓXIMO A VENCER";
            } else {
                estadoVigencia = "VIGENTE";
            }
        }
        
        return CotizacionComparativaDTO.builder()
            .id(c.getId())
            .folioCodigo(c.getSolicitud() != null ? c.getSolicitud().getFolioCodigo() : null)
            .proveedorNombre(c.getProveedor() != null ? c.getProveedor().getNombre() : null)
            .proveedorPais(c.getProveedor() != null ? c.getProveedor().getPais() : null)
            .tipoTransporte(c.getTipoTransporte() != null ? c.getTipoTransporte().name() : null)
            .origen(c.getOrigen())
            .destino(c.getDestino())
            .tipoUnidad(c.getTipoUnidad())
            .tiempoEstimado(c.getTiempoEstimado())
            .costoProveedor(c.getCosto())
            .margenGananciaPct(c.getMargenGananciaPct())
            .precioVenta(precioVenta != null ? Math.round(precioVenta * 100.0) / 100.0 : null)
            .utilidadEstimada(utilidad != null ? Math.round(utilidad * 100.0) / 100.0 : null)
            .diasCredito(c.getDiasCredito())
            .validoHasta(c.getValidoHasta())
            .roi(roi != null ? Math.round(roi * 100.0) / 100.0 : null)
            .diasVigenciaRestantes(diasVigencia)
            .estadoVigencia(estadoVigencia)
            .estado(c.getEstado() != null ? c.getEstado().name() : null)
            .build();
    }
    
    private void asignarRankings(List<CotizacionComparativaDTO> comparativas) {
        // Ranking por costo (menor = mejor)
        List<CotizacionComparativaDTO> ordenadosPorCosto = comparativas.stream()
            .filter(c -> c.getCostoProveedor() != null)
            .sorted(Comparator.comparing(CotizacionComparativaDTO::getCostoProveedor))
            .collect(Collectors.toList());
        
        for (int i = 0; i < ordenadosPorCosto.size(); i++) {
            ordenadosPorCosto.get(i).setRankingPorCosto(i + 1);
        }
        
        // Ranking por margen (mayor = mejor)
        List<CotizacionComparativaDTO> ordenadosPorMargen = comparativas.stream()
            .filter(c -> c.getMargenGananciaPct() != null)
            .sorted(Comparator.comparing(CotizacionComparativaDTO::getMargenGananciaPct).reversed())
            .collect(Collectors.toList());
        
        for (int i = 0; i < ordenadosPorMargen.size(); i++) {
            ordenadosPorMargen.get(i).setRankingPorMargen(i + 1);
        }
        
        // Asignar nivel de competitividad
        for (CotizacionComparativaDTO c : comparativas) {
            Integer rankCosto = c.getRankingPorCosto();
            Integer rankMargen = c.getRankingPorMargen();
            
            if (rankCosto != null && rankMargen != null) {
                double promedio = (rankCosto + rankMargen) / 2.0;
                
                if (promedio <= 2) {
                    c.setNivelCompetitividad("MUY COMPETITIVO");
                } else if (promedio <= 4) {
                    c.setNivelCompetitividad("COMPETITIVO");
                } else {
                    c.setNivelCompetitividad("POCO COMPETITIVO");
                }
            }
        }
    }
}