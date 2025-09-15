import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Enviar erro para serviço de monitoramento (se configurado)
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Implementar integração com serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };
      
      // Enviar para API de logs (implementar conforme necessário)
      console.log('Erro logado:', errorData);
    } catch (logError) {
      console.error('Erro ao logar erro:', logError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copiar para clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Relatório de erro copiado para a área de transferência!');
      })
      .catch(() => {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorReport, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Relatório de erro copiado para a área de transferência!');
      });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            {/* Card de erro */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              {/* Ícone de erro */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Algo deu errado
              </h1>

              {/* Descrição */}
              <p className="text-gray-600 mb-6">
                Ocorreu um erro inesperado no sistema. Nossa equipe foi notificada 
                e está trabalhando para resolver o problema.
              </p>

              {/* ID do erro */}
              <div className="bg-gray-100 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600 mb-1">ID do Erro:</p>
                <code className="text-sm font-mono text-gray-800">
                  {this.state.errorId}
                </code>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                {/* Recarregar página */}
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-4 py-3 bg-acafe-green text-white rounded-lg font-medium hover:bg-acafe-green/90 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Recarregar Página
                </button>

                {/* Voltar ao início */}
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </button>

                {/* Reportar erro */}
                <button
                  onClick={this.handleReportError}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  <Bug className="w-5 h-5 mr-2" />
                  Copiar Relatório de Erro
                </button>
              </div>

              {/* Informações de contato */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Se o problema persistir, entre em contato com o suporte:
                </p>
                <p className="text-sm text-acafe-green font-medium mt-1">
                  suporte@colegiofleming.com.br
                </p>
              </div>
            </div>

            {/* Detalhes técnicos (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  Detalhes Técnicos (Desenvolvimento)
                </h3>
                
                <div className="space-y-4">
                  {/* Mensagem de erro */}
                  <div>
                    <h4 className="font-medium text-red-700 mb-1">Mensagem:</h4>
                    <code className="text-sm bg-red-100 p-2 rounded block text-red-800">
                      {this.state.error.message}
                    </code>
                  </div>

                  {/* Stack trace */}
                  <div>
                    <h4 className="font-medium text-red-700 mb-1">Stack Trace:</h4>
                    <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40 text-red-800">
                      {this.state.error.stack}
                    </pre>
                  </div>

                  {/* Component stack */}
                  {this.state.errorInfo && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-1">Component Stack:</h4>
                      <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-40 text-red-800">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;