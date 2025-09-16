import axios from 'axios';

// -------- BASE DA API --------
// Em produção (build do React), usamos '/api' para o Nginx do frontend
// fazer o proxy para o backend no Cloud Run.
// Em desenvolvimento, usa http://localhost:8000 (seu backend local).
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

// Instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 min
  headers: { 'Content-Type': 'application/json' },
});

// Logs de request/response no dev
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`❌ ${status}: ${data?.detail || 'Erro desconhecido'}`);
    } else if (error.request) {
      console.error('❌ Erro de rede - servidor não respondeu');
    } else {
      console.error('❌ Erro na configuração:', error.message);
    }
    return Promise.reject(error);
  }
);

// ---------- ENDPOINTS ----------

// Health
export const healthCheck = async () => {
  try {
    const { data } = await api.get('/health'); // em prod vira /api/health
    return data;
  } catch {
    throw new Error('API não está respondendo');
  }
};

// Upload de arquivo
export const uploadFile = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...(onProgress && {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          onProgress(pct);
        },
      }),
    };

    const { data } = await api.post('/upload', formData, config); // em prod vira /api/upload
    return data;
  } catch (error) {
    if (error.response?.data?.erro) throw new Error(error.response.data.erro);
    throw new Error('Erro ao fazer upload do arquivo');
  }
};

// Processar simulado
export const processSimulado = async (processId) => {
  try {
    const { data } = await api.post(`/processar/${processId}`);
    return data;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao processar simulado');
  }
};

// Estatísticas
export const getStatistics = async (processId) => {
  try {
    const { data } = await api.get(`/estatisticas/${processId}`);
    return data;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao obter estatísticas');
  }
};

// Ranking
export const getRanking = async (processId) => {
  try {
    const { data } = await api.get(`/ranking/${processId}`);
    return data;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao obter ranking');
  }
};

// Gerar PDFs
export const generatePdfs = async (processId) => {
  try {
    const { data } = await api.post(`/gerar-pdfs/${processId}`);
    return data;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao gerar PDFs');
  }
};

// Download PDF individual
export const downloadPdf = async (processId, alunoId, nomeAluno) => {
  try {
    const resp = await api.get(`/download-pdf/${processId}/${alunoId}`, { responseType: 'blob' });
    const blob = new Blob([resp.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Boletim_${nomeAluno.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao baixar PDF');
  }
};

// Download de todos PDFs (ZIP)
export const downloadAllPdfs = async (processId) => {
  try {
    const resp = await api.get(`/download-todos-pdfs/${processId}`, { responseType: 'blob' });
    const blob = new Blob([resp.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boletins_simulado_${processId.slice(0, 8)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao baixar ZIP dos PDFs');
  }
};

// Download do template Excel
export const downloadTemplate = async () => {
  try {
    const resp = await api.get('/template-excel', { responseType: 'blob' });
    const blob = new Blob([resp.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_simulado_acafe.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao baixar template');
  }
};

// Limpar processo
export const clearProcess = async (processId) => {
  try {
    const { data } = await api.delete(`/limpar/${processId}`);
    return data;
  } catch (error) {
    if (error.response?.data?.detail) throw new Error(error.response.data.detail);
    throw new Error('Erro ao limpar processo');
  }
};

// Fluxo completo (upload → processar → gerar PDFs)
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
    if (onUploadProgress) onUploadProgress(0);
    const uploadResult = await uploadFile(file, onUploadProgress);
    if (onUploadComplete) onUploadComplete(uploadResult);

    const processId = uploadResult.processo_id;

    if (onProcessingStart) onProcessingStart();
    const processingResult = await processSimulado(processId);
    if (onProcessingComplete) onProcessingComplete(processingResult);

    if (onPdfGenerationStart) onPdfGenerationStart();
    const pdfsResult = await generatePdfs(processId);
    if (onPdfGenerationComplete) onPdfGenerationComplete(pdfsResult);

    return { processId, uploadResult, processingResult, pdfsResult };
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

// Helpers
export const validateFile = (file) => {
  const errors = [];
  const warnings = [];

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (!allowedTypes.includes(file.type)) errors.push('Arquivo deve ser Excel (.xlsx ou .xls)');

  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) errors.push('Arquivo muito grande (máximo 200MB)');

  if (!file.name.match(/\.(xlsx|xls)$/i)) warnings.push('Extensão do arquivo pode não ser reconhecida');

  return { isValid: errors.length === 0, errors, warnings };
};

export const formatApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400: return data?.detail || 'Dados inválidos';
      case 404: return 'Recurso não encontrado';
      case 413: return 'Arquivo muito grande';
      case 422: return 'Dados não processáveis';
      case 500: return 'Erro interno do servidor';
      case 503: return 'Serviço temporariamente indisponível';
      default:  return data?.detail || `Erro ${status}`;
    }
  } else if (error.request) {
    return 'Erro de conexão - verifique sua internet';
  }
  return error.message || 'Erro desconhecido';
};

export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (error.response?.status >= 400 && error.response?.status < 500) throw error;
      if (i < maxRetries - 1) await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastError;
};

export { api, API_BASE_URL };
