import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useIdleTimeout = (timeoutInMinutes = 30) => {
  const navigate = useNavigate();
  const timeoutMs = timeoutInMinutes * 60 * 1000;

  const logout = useCallback(() => {
    // Limpia el almacenamiento local usado en tu sistema
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    // Redirige al login
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, timeoutMs);
    };

    // Eventos que se consideran "actividad"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Agregar listeners
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    // Iniciar el temporizador al montar
    resetTimer();

    // Limpieza al desmontar el componente
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [logout, timeoutMs]);
};

export default useIdleTimeout;