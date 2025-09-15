import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos
  headers: {
    'Content-Type': 'application/json',
  },
} );

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Log da requisição em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Log do erro
    console.error('Erro na resposta:', error);
    
    // Tratar diferentes tipos de erro
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response;
      console.error(`❌ ${status}: ${data?.detail || 'Erro desconhecido'}`);
    } else if (error.request) {
      // Erro de rede
      console.error('❌ Erro de rede - servidor não respondeu');
    } else {
      // Erro na configuração da requisição
      console.error('❌ Erro na configuração:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Funções da API

// Health Check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API não está respondendo');
  }
};

// Upload de arquivo
export const uploadFile = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    // Adicionar callback de progresso se fornecido
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await api.post('/api/upload', formData, config);
    return response.data;
  } catch (error) {
    if (error.response?.data?.erro) {
      throw new Error(error.response.data.erro);
    }
    throw new Error('Erro ao fazer upload do arquivo');
  }
};

// Processar simulado
export const processSimulado = async (processId, onProgress = null) => {
  try {
    const response = await api.post(`/api/processar/${processId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao processar simulado');
  }
};

// Obter estatísticas
export const getStatistics = async (processId) => {
  try {
    const response = await api.get(`/api/estatisticas/${processId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao obter estatísticas');
  }
};

// Obter ranking
export const getRanking = async (processId) => {
  try {
    const response = await api.get(`/api/ranking/${processId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao obter ranking');
  }
};

// Gerar PDFs
export const generatePdfs = async (processId, onProgress = null) => {
  try {
    const response = await api.post(`/api/gerar-pdfs/${processId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao gerar PDFs');
  }
};

// Download de PDF individual
export const downloadPdf = async (processId, alunoId, nomeAluno) => {
  try {
    const response = await api.get(`/api/download-pdf/${processId}/${alunoId}`, {
      responseType: 'blob',
    });

    // Criar URL do blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Boletim_${nomeAluno.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL do blob
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao baixar PDF');
  }
};

// Download de todos os PDFs (ZIP)
export const downloadAllPdfs = async (processId) => {
  try {
    const response = await api.get(`/api/download-todos-pdfs/${processId}`, {
      responseType: 'blob',
    });

    // Criar URL do blob
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);

    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `boletins_simulado_${processId.slice(0, 8)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL do blob
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao baixar ZIP dos PDFs');
  }
};

// Download do template Excel
export const downloadTemplate = async () => {
  try {
    const response = await api.get('/api/template-excel', {
      responseType: 'blob',
    });

    // Criar URL do blob
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);

    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_simulado_acafe.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL do blob
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao baixar template');
  }
};

// Limpar processo
export const clearProcess = async (processId) => {
  try {
    const response = await api.delete(`/api/limpar/${processId}`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erro ao limpar processo');
  }
};

// Função helper para processar fluxo completo
export const processCompleteFlow = async (file, callbacks = {}) => {
  const {
    onUploadProgress,
    onUploadComplete,
    onProcessingStart,
    onProcessingComplete,
    onPdfGenerationStart,
    onPdfGenerationComplete,
    onError,
  } = callbacks;

  try {
    // 1. Upload do arquivo
    if (onUploadProgress) onUploadProgress(0);
    const uploadResult = await uploadFile(file, onUploadProgress);
    if (onUploadComplete) onUploadComplete(uploadResult);

    const processId = uploadResult.processo_id;

    // 2. Processar simulado
    if (onProcessingStart) onProcessingStart();
    const processingResult = await processSimulado(processId);
    if (onProcessingComplete) onProcessingComplete(processingResult);

    // 3. Gerar PDFs
    if (onPdfGenerationStart) onPdfGenerationStart();
    const pdfsResult = await generatePdfs(processId);
    if (onPdfGenerationComplete) onPdfGenerationComplete(pdfsResult);

    return {
      processId,
      uploadResult,
      processingResult,
      pdfsResult,
    };
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

// Função helper para validar arquivo antes do upload
export const validateFile = (file) => {
  const errors = [];
  const warnings = [];

  // Verificar tipo de arquivo
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Arquivo deve ser Excel (.xlsx ou .xls)');
  }

  // Verificar tamanho (200MB max)
  const maxSize = 200 * 1024 * 1024; // 200MB em bytes
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande (máximo 200MB)');
  }

  // Verificar nome do arquivo
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    warnings.push('Extensão do arquivo pode não ser reconhecida');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Função helper para formatar erros da API
export const formatApiError = (error) => {
  if (error.response) {
    // Erro com resposta do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.detail || 'Dados inválidos';
      case 404:
        return 'Recurso não encontrado';
      case 413:
        return 'Arquivo muito grande';
      case 422:
        return 'Dados não processáveis';
      case 500:
        return 'Erro interno do servidor';
      case 503:
        return 'Serviço temporariamente indisponível';
      default:
        return data?.detail || `Erro ${status}`;
    }
  } else if (error.request) {
    // Erro de rede
    return 'Erro de conexão - verifique sua internet';
  } else {
    // Erro na configuração
    return error.message || 'Erro desconhecido';
  }
};

// Função helper para retry automático
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Não fazer retry para erros 4xx (erro do cliente)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Aguardar antes do próximo retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Exportar instância do axios para uso direto se necessário
export { api };

// Exportar URL base
export { API_BASE_URL };
