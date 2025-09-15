import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  BarChart3, 
  Download, 
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const HomePage = () => {
  const { state, computed } = useApp();

  // Estatísticas do sistema
  const systemStats = [
    {
      icon: Users,
      label: 'Alunos Processados',
      value: computed.totalStudents || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      label: 'Média Geral',
      value: computed.averageScore ? `${computed.averageScore.toFixed(1)}%` : '0%',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: FileText,
      label: 'PDFs Gerados',
      value: state.pdfsInfo.length || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Clock,
      label: 'Processos',
      value: computed.processCount || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // Cards de ação
  const actionCards = [
    {
      title: 'Novo Simulado',
      description: 'Faça upload de um arquivo Excel com as respostas dos alunos',
      icon: Upload,
      to: '/upload',
      color: 'from-acafe-green to-acafe-light',
      textColor: 'text-white',
      primary: true
    },
    {
      title: 'Ver Resultados',
      description: 'Visualize ranking e estatísticas do último processamento',
      icon: BarChart3,
      to: computed.hasCurrentProcess ? `/results/${state.currentProcess}` : '/upload',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white',
      disabled: !computed.hasCurrentProcess
    },
    {
      title: 'Download PDFs',
      description: 'Baixe os boletins individuais em formato PDF',
      icon: Download,
      to: computed.canDownload ? `/download/${state.currentProcess}` : '/upload',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-white',
      disabled: !computed.canDownload
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-acafe-green to-acafe-light text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Corretor ACAFE Fleming
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Sistema Inteligente de Correção de Simulados
            </p>
            
            <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
              Processe simulados ACAFE de forma rápida e eficiente. 
              Gere boletins individuais, rankings e estatísticas detalhadas 
              com apenas alguns cliques.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-4 bg-white text-acafe-green font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-acafe-green transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Baixar Template
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {systemStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Cards de Ação */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que você gostaria de fazer?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha uma das opções abaixo para começar a usar o sistema
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={card.to}
                    className={`block h-full ${card.disabled ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className={`h-full bg-gradient-to-br ${card.color} rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${card.textColor}`}>
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                      <p className="text-lg opacity-90 mb-6">{card.description}</p>
                      
                      <div className="flex items-center justify-center">
                        <span className="font-semibold">
                          {card.disabled ? 'Indisponível' : 'Acessar'}
                        </span>
                        {!card.disabled && <ArrowRight className="w-5 h-5 ml-2" />}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status do Processo Atual */}
      {computed.hasCurrentProcess && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Processo Ativo
                  </h3>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Em andamento</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-acafe-green">
                    {computed.totalStudents}
                  </p>
                  <p className="text-gray-600">Alunos processados</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-acafe-green">
                    {computed.averageScore.toFixed(1)}%
                  </p>
                  <p className="text-gray-600">Média geral</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-acafe-green">
                    {state.pdfsInfo.length}
                  </p>
                  <p className="text-gray-600">PDFs gerados</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={`/results/${state.currentProcess}`}
                  className="inline-flex items-center px-6 py-3 bg-acafe-green text-white font-semibold rounded-lg hover:bg-acafe-green/90 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Resultados
                </Link>
                
                {computed.canDownload && (
                  <Link
                    to={`/download/${state.currentProcess}`}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDFs
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Como Funciona */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Processo simples e rápido em apenas 3 passos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload do Excel',
                description: 'Faça upload do arquivo Excel com as respostas dos alunos e o gabarito',
                icon: Upload
              },
              {
                step: '2',
                title: 'Processamento',
                description: 'O sistema corrige automaticamente e calcula estatísticas detalhadas',
                icon: BarChart3
              },
              {
                step: '3',
                title: 'Download',
                description: 'Baixe os boletins individuais em PDF e o ranking completo',
                icon: Download
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-acafe-green text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {item.step}
                  </div>
                  <Icon className="w-12 h-12 text-acafe-green mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;