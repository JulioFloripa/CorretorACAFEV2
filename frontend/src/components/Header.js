import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Upload, 
  BarChart3, 
  Download,
  Settings,
  Wifi,
  WifiOff,
  Bell,
  User
} from 'lucide-react';

const Header = ({ onMenuClick, apiStatus }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Determinar título da página atual
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Início';
      case '/upload':
        return 'Upload de Arquivo';
      case '/results':
        return 'Resultados';
      case '/download':
        return 'Download';
      case '/stats':
        return 'Estatísticas';
      default:
        if (location.pathname.includes('/results/')) return 'Resultados';
        if (location.pathname.includes('/download/')) return 'Download';
        if (location.pathname.includes('/stats/')) return 'Estatísticas';
        return 'Corretor ACAFE';
    }
  };

  // Status da API
  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'online':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-yellow-500 rounded-full animate-pulse" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'online':
        return 'Sistema Online';
      case 'offline':
        return 'Sistema Offline';
      default:
        return 'Verificando...';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Menu Mobile */}
          <div className="flex items-center">
            {/* Botão do menu mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-acafe-green hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center space-x-3">
                {/* Logo ACAFE */}
                <div className="w-10 h-10 bg-gradient-to-r from-acafe-green to-acafe-light rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                
                {/* Título */}
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">
                    Corretor ACAFE
                  </h1>
                  <p className="text-sm text-gray-600">
                    Colégio Fleming
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Título da página atual - Desktop */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-acafe-green text-white'
                  : 'text-gray-600 hover:text-acafe-green hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Início
            </Link>
            
            <Link
              to="/upload"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/upload'
                  ? 'bg-acafe-green text-white'
                  : 'text-gray-600 hover:text-acafe-green hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Link>
          </nav>

          {/* Status e Ações */}
          <div className="flex items-center space-x-4">
            {/* Horário atual */}
            <div className="hidden sm:block text-sm text-gray-600">
              {currentTime.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>

            {/* Status da API */}
            <div className="flex items-center space-x-2">
              {getApiStatusIcon()}
              <span className="hidden md:block text-sm text-gray-600">
                {getApiStatusText()}
              </span>
            </div>

            {/* Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-gray-600 hover:text-acafe-green hover:bg-gray-100 transition-colors relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {/* Badge de notificação */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Dropdown de notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notificações
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-center text-gray-500 py-8">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma notificação</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu do usuário */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-acafe-green hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-fleming-blue to-fleming-light rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  Usuário
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progresso global (se houver) */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-gradient-to-r from-acafe-green to-acafe-light transition-all duration-300 ease-out w-0"></div>
      </div>

      {/* Overlay para fechar notificações */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
};

export default Header;