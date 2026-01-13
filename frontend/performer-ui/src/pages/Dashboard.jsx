// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [status, setStatus] = useState('loading');

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    // Verificar el estado del sistema
    fetch('/api/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      
      <div className="dashboard-content">
        <Header nombre={nombre} rol={rol} />
        <Subheader status={status} />
        <MainContent rol={rol} nombre={nombre} />
        <Footer />
      </div>
    </div>
  );
}