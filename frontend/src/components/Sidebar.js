import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  Upload, 
  BarChart3, 
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ isOpen, onClose, currentProcess }) => {
  const location = useLocation();
  const { state, computed } = useApp();

  // Links de navegação
  const navigationLinks = [
    {
      to: '/',
      icon: Home,
      label: 'Início',
      description: 'Página inicial'
    },
    {
      to: '/upload',
      icon: Upload,
      label: 'Upload',
      description: 'Enviar arquivo Excel'
    }
  ];

  // Links condicionais baseados no processo atual
  const processLinks = currentProcess ? [
    {
      to: `/results/${currentProcess}`,
      icon: BarChart3,
      label: 'Resultados',
      description: 'Ver ranking e estatísticas'
    },
    {
      to: `/download/${currentProcess}`,
      icon: Download,
      label: 'Download',
      description: 'Baixar boletins em PDF'
    }
  ] : [];

  const allLinks = [...navigationLinks, ...processLinks];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header da sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-acafe-green to-acafe-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <p className="text-xs text-gray-600">Navegação</p>
            </div>
          </div>
          
          {/* Botão fechar - apenas mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {allLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-acafe-green text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-acafe-green'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">{link.label}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {link.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Status do processo atual */}
        {currentProcess && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Processo Atual
                </h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 mb-3">
                ID: {currentProcess.slice(0, 8)}...
              </div>

              {/* Estatísticas rápidas */}
              {computed.hasResults && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-acafe-green" />
                    <div className="font-semibold text-gray-900">
                      {computed.totalStudents}
                    </div>
                    <div className="text-gray-600">Alunos</div>
                  </div>
                  
                  <div className="bg-white rounded p-2 text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-acafe-green" />
                    <div className="font-semibold text-gray-900">
                      {computed.averageScore.toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Média</div>
                  </div>
                </div>
              )}

              {/* Status dos PDFs */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">PDFs:</span>
                  {computed.hasPdfs ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">Prontos</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">Pendente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Como usar
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>1. Faça upload do Excel</li>
                  <li>2. Aguarde o processamento</li>
                  <li>3. Baixe os boletins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Template Excel */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Implementar download do template
              console.log('Download template');
            }}
            className="w-full flex items-center justify-center px-3 py-2 bg-acafe-green text-white rounded-lg text-sm font-medium hover:bg-acafe-green/90 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Baixar Template
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Corretor ACAFE Fleming
            </p>
            <p className="text-xs text-gray-400">
              Versão 2.0 - FastAPI + React
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;