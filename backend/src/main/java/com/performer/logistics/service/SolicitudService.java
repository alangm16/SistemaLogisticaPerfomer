package com.performer.logistics.service;

import com.performer.logistics.domain.Cliente;
import com.performer.logistics.domain.Empleado;
import com.performer.logistics.domain.Historial;
import com.performer.logistics.domain.Solicitud;
import com.performer.logistics.exception.ResourceNotFoundException;
import com.performer.logistics.repository.ClienteRepository;
import com.performer.logistics.repository.EmpleadoRepository;
import com.performer.logistics.repository.SolicitudRepository;
import java.time.LocalDateTime;
import java.time.Year;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final HistorialService historialService;
    private final EmpleadoRepository empleadoRepository;
    private final ClienteRepository clienteRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, HistorialService historialService, EmpleadoRepository empleadoRepository, ClienteRepository clienteRepository) {
        this.solicitudRepository = solicitudRepository;
        this.historialService = historialService;
        this.empleadoRepository = empleadoRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Solicitud> listarTodas() {
        return solicitudRepository.findAll(Sort.by(Sort.Direction.DESC, "creadoEn"));
    }

    public Solicitud guardar(Solicitud solicitud) {

        // Obtener usuario autenticado
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado para el email: " + email));

        // Generar folio
        String empresa = solicitud.getEmpresaCodigo();
        int year = Year.now().getValue();

        long count = solicitudRepository.countByEmpresaCodigoAndYear(empresa, year) + 1;

        String folio = String.format("%s-%05d-%d", empresa, count, year);

        solicitud.setFolioCodigo(folio);

        // Setear auditoría
        solicitud.setCreadoPor(usuario);
        solicitud.setCreadoEn(LocalDateTime.now());
        solicitud.setEstado(Solicitud.Estado.PENDIENTE);

        // Guardar
        Solicitud s = solicitudRepository.save(solicitud);

        // Historial
        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.SOLICITUD)
                .entidadId(s.getId())
                .accion("CREADO")
                .detalle("Solicitud creada con folio " + s.getFolioCodigo())
                .usuario(usuario)
                .timestamp(LocalDateTime.now())
                .build());

        return s;
    }

    public List<Solicitud> listarRecientes(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "creadoEn"));
        return solicitudRepository.findAll(pageRequest).getContent();
    }

    public Solicitud obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada con ID: " + id));
    }

    public Solicitud actualizar(Long id, Solicitud solicitudActualizada) {
        // Obtener solicitud existente
        Solicitud solicitudExistente = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Solicitud no encontrada con ID: " + id));

        // Obtener usuario autenticado desde JWT
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Empleado usuario = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empleado no encontrado para el email: " + email));

        // Actualizar campos permitidos
        solicitudExistente.setTipoServicio(solicitudActualizada.getTipoServicio());
        solicitudExistente.setOrigenPais(solicitudActualizada.getOrigenPais());
        solicitudExistente.setOrigenCiudad(solicitudActualizada.getOrigenCiudad());
        solicitudExistente.setOrigenDireccion(solicitudActualizada.getOrigenDireccion());
        solicitudExistente.setOrigenCp(solicitudActualizada.getOrigenCp());
        solicitudExistente.setDestinoPais(solicitudActualizada.getDestinoPais());
        solicitudExistente.setDestinoCiudad(solicitudActualizada.getDestinoCiudad());
        solicitudExistente.setDestinoDireccion(solicitudActualizada.getDestinoDireccion());
        solicitudExistente.setDestinoCp(solicitudActualizada.getDestinoCp());
        solicitudExistente.setCantidad(solicitudActualizada.getCantidad());
        solicitudExistente.setLargoCm(solicitudActualizada.getLargoCm());
        solicitudExistente.setAnchoCm(solicitudActualizada.getAnchoCm());
        solicitudExistente.setAltoCm(solicitudActualizada.getAltoCm());
        solicitudExistente.setPesoKg(solicitudActualizada.getPesoKg());
        solicitudExistente.setApilable(solicitudActualizada.getApilable());
        solicitudExistente.setValorDeclaradoUsd(solicitudActualizada.getValorDeclaradoUsd());
        solicitudExistente.setTipoEmpaque(solicitudActualizada.getTipoEmpaque());
        solicitudExistente.setMaterialPeligroso(solicitudActualizada.getMaterialPeligroso());

        // Guardar solicitud
        Solicitud solicitudGuardada = solicitudRepository.save(solicitudExistente);

        // Guardar historial
        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.SOLICITUD)
                .entidadId(solicitudGuardada.getId())
                .accion("ACTUALIZADO")
                .detalle("Solicitud actualizada con folio " + solicitudGuardada.getFolioCodigo())
                .usuario(usuario)
                .timestamp(LocalDateTime.now())
                .build());

        return solicitudGuardada;
    }


    public Solicitud cambiarEstado(Long id, Solicitud.Estado nuevoEstado, Empleado usuario) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada con ID: " + id));

        Solicitud.Estado estadoAnterior = solicitud.getEstado();
        solicitud.setEstado(nuevoEstado);
        Solicitud solicitudGuardada = solicitudRepository.save(solicitud);

        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.SOLICITUD)
                .entidadId(solicitudGuardada.getId())
                .accion("ESTADO_CAMBIADO")
                .detalle("Estado cambiado de " + estadoAnterior + " a " + nuevoEstado)
                .usuario(usuario)
                .timestamp(LocalDateTime.now())
                .build());

        return solicitudGuardada;
    }

    public List<Solicitud> listarPorEstado(Solicitud.Estado estado) {
        return solicitudRepository.findByEstado(estado);
    }
    
    public List<Solicitud> listarAsignadas(Long empleadoId) {
        return solicitudRepository.findByAsignadoAId(empleadoId);
    }

    public List<Solicitud> listarMisSolicitudes(Long empleadoId) {
        return solicitudRepository.findByCreadoPorId(empleadoId);
    }

    public Solicitud asignar(Long solicitudId, Long empleadoId) {
        Solicitud s = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));
        Empleado e = empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado"));
        s.setAsignadoA(e);
        Solicitud saved = solicitudRepository.save(s);
        historialService.guardar(Historial.builder()
                .entidadTipo(Historial.EntidadTipo.SOLICITUD)
                .entidadId(saved.getId())
                .accion("ASIGNADO")
                .detalle("Asignado a empleado " + e.getNombre())
                .usuario(e)
                .timestamp(LocalDateTime.now())
                .build());
        return saved;
    }
}