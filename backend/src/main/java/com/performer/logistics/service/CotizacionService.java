package com.performer.logistics.service;

import com.performer.logistics.domain.Cotizacion;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.domain.Proveedor;
import com.performer.logistics.domain.Solicitud;
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
    
    public List<Cotizacion> sugerenciasPorSolicitud(Long solicitudId) {
    Solicitud s = solicitudRepository.findById(solicitudId)
        .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

    // Obtener todas las cotizaciones, pero podríamos limitar a las más recientes (por ejemplo, últimos 6 meses)
    // Por ahora, todas
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
        .sorted(Comparator.comparing(Cotizacion::getCreadoEn).reversed())
        .limit(10)
        .collect(Collectors.toList());
}
    
    public Cotizacion buscarPorId(Long id) {
        return cotizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización no encontrada"));
    }

    public void eliminar(Long id) {
        Cotizacion c = buscarPorId(id);
        cotizacionRepository.delete(c);

        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.COTIZACION)
                .entidadId(id)
                .accion("ELIMINADO")
                .detalle("Cotización eliminada")
                .usuario(c.getSolicitud().getCreadoPor())
                .timestamp(LocalDateTime.now())
                .build());
    }
    
    // En CotizacionService.java - Modificar sugerenciasAvanzadas
    public List<CotizacionSugerenciaDTO> sugerenciasAvanzadas(Long solicitudId) {
        Solicitud solicitudActual = solicitudRepository.findById(solicitudId)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

        // Obtener cotizaciones recientes (últimos 6 meses) que tengan datos completos
        LocalDate seisMesesAtras = LocalDate.now().minusMonths(6);
        List<Cotizacion> cotizacionesRecientes = cotizacionRepository
            .findByCreadoEnAfter(seisMesesAtras.atStartOfDay())
            .stream()
            // Filtrar cotizaciones que tengan los datos mínimos necesarios
            .filter(c -> c.getTiempoEstimado() != null && !c.getTiempoEstimado().isEmpty())
            .filter(c -> c.getValidoHasta() != null)
            .filter(c -> c.getCosto() != null && c.getCosto() > 0)
            .collect(Collectors.toList());

        return cotizacionesRecientes.stream()
            .map(c -> calcularPuntuacion(c, solicitudActual))
            .filter(p -> p.puntuacion() >= 50.0) // Solo sugerencias relevantes
            .sorted((a, b) -> Double.compare(b.puntuacion(), a.puntuacion()))
            .limit(5)
            .collect(Collectors.toList());
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

}