import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Componentes
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Páginas
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import DownloadPage from './pages/DownloadPage';
import StatsPage from './pages/StatsPage';

// Contexto
import { AppProvider, useApp } from './context/AppContext';

// Serviços
import { healthCheck } from './services/api';

function AppContent() {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Verificar saúde da API
    const checkApiHealth = async () => {
      try {
        await healthCheck();
        dispatch({ type: 'SET_API_STATUS', payload: 'online' });
      } catch (error) {
        console.error('API não está respondendo:', error);
        dispatch({ type: 'SET_API_STATUS', payload: 'offline' });
      } finally {
        setIsLoading(false);
      }
    };

    checkApiHealth();
  }, [dispatch]);

  // Loading screen inicial
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />

      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        apiStatus={state.apiStatus}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentProcess={state.currentProcess}
        />

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="container mx-auto px-4 py-6">
            <Routes>
              {/* Página inicial */}
              <Route path="/" element={<HomePage />} />
              
              {/* Upload de arquivo */}
              <Route path="/upload" element={<UploadPage />} />
              
              {/* Resultados */}
              <Route 
                path="/results/:processId" 
                element={<ResultsPage />} 
              />
              
              {/* Download de PDFs */}
              <Route 
                path="/download/:processId" 
                element={<DownloadPage />} 
              />
              
              {/* Estatísticas */}
              <Route 
                path="/stats/:processId" 
                element={<StatsPage />} 
              />
              
              {/* Redirect para home se rota não encontrada */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Status da API offline */}
      {state.apiStatus === 'offline' && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              <span className="font-medium">Sistema offline</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Overlay para mobile quando sidebar está aberta */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;