// Crear WorkflowConfig.java en el paquete config
package com.performer.logistics.config;

import org.springframework.context.annotation.Configuration;

import java.util.*;

@Configuration
public class WorkflowConfig {
    
    public Map<String, List<String>> getWorkflowTransiciones() {
        Map<String, List<String>> workflow = new HashMap<>();
        
        // Workflow para Solicitud
        workflow.put("SOLICITUD_PENDIENTE", Arrays.asList("ENVIADO", "CANCELADO"));
        workflow.put("SOLICITUD_ENVIADO", Arrays.asList("COMPLETADO", "CANCELADO"));
        workflow.put("SOLICITUD_COMPLETADO", Collections.emptyList());
        workflow.put("SOLICITUD_CANCELADO", Collections.emptyList());
        
        // Workflow para Cotización
        workflow.put("COTIZACION_PENDIENTE", Arrays.asList("ENVIADO", "CANCELADO"));
        workflow.put("COTIZACION_ENVIADO", Arrays.asList("COMPLETADO", "CANCELADO"));
        workflow.put("COTIZACION_COMPLETADO", Collections.emptyList());
        workflow.put("COTIZACION_CANCELADO", Collections.emptyList());
        
        return workflow;
    }
    
    public boolean validarTransicion(String entidad, String estadoActual, String estadoNuevo) {
        String key = entidad.toUpperCase() + "_" + estadoActual.toUpperCase();
        List<String> transicionesPermitidas = getWorkflowTransiciones().get(key);
        return transicionesPermitidas != null && 
               transicionesPermitidas.contains(estadoNuevo.toUpperCase());
    }
}