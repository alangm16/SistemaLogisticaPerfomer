// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
  api.get('/health')
    .then(() => setStatus('ok'))
    .catch((err) => {
      console.error("Error al llamar backend:", err);
      setStatus('error');
    });
  }, []);
  return <div>Backend status: {status}</div>;
}
