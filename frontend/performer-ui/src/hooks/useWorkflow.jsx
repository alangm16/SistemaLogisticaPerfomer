// src/hooks/useWorkflow.jsx
import { useState } from 'react';
/* import { api } from '../services/api';
 */
/**
 * Hook para manejar workflow de estados
 */
export default function useWorkflow() {
  const [workflow, setWorkflow] = useState(null);

  const cargarWorkflow = async () => {
    try {
      // Puedes crear un endpoint /api/workflow o usar config local
      const workflowConfig = {
        SOLICITUD: {
          PENDIENTE: ['ENVIADO', 'CANCELADO'],
          ENVIADO: ['COMPLETADO', 'CANCELADO'],
          COMPLETADO: [],
          CANCELADO: []
        },
        COTIZACION: {
          PENDIENTE: ['ENVIADO', 'CANCELADO'],
          ENVIADO: ['COMPLETADO', 'CANCELADO'],
          COMPLETADO: [],
          CANCELADO: []
        }
      };
      setWorkflow(workflowConfig);
    } catch (err) {
      console.error('Error cargando workflow:', err);
    }
  };

  const validarTransicion = (entidad, estadoActual, estadoNuevo) => {
    if (!workflow) return true; // Permitir si no hay workflow cargado
    
    const entidadWorkflow = workflow[entidad];
    if (!entidadWorkflow) return false;
    
    const estadosPermitidos = entidadWorkflow[estadoActual] || [];
    return estadosPermitidos.includes(estadoNuevo);
  };

  return {
    workflow,
    cargarWorkflow,
    validarTransicion
  };
}