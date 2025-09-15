import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial
const initialState = {
  // Status da API
  apiStatus: 'checking', // 'checking', 'online', 'offline'
  
  // Processo atual
  currentProcess: null,
  
  // Dados do upload
  uploadedFile: null,
  validationResult: null,
  
  // Resultados do processamento
  processingResults: null,
  statistics: null,
  ranking: null,
  
  // PDFs
  pdfsGenerated: false,
  pdfsInfo: [],
  
  // UI State
  isLoading: false,
  loadingMessage: '',
  progress: 0,
  
  // Histórico de processos
  processHistory: [],
  
  // Configurações
  settings: {
    theme: 'light',
    autoDownload: false,
    showAnimations: true,
  },
  
  // Erros
  error: null,
  warnings: [],
};

// Action types
const ActionTypes = {
  // API Status
  SET_API_STATUS: 'SET_API_STATUS',
  
  // Loading
  SET_LOADING: 'SET_LOADING',
  SET_PROGRESS: 'SET_PROGRESS',
  
  // Upload
  SET_UPLOADED_FILE: 'SET_UPLOADED_FILE',
  SET_VALIDATION_RESULT: 'SET_VALIDATION_RESULT',
  
  // Processamento
  SET_CURRENT_PROCESS: 'SET_CURRENT_PROCESS',
  SET_PROCESSING_RESULTS: 'SET_PROCESSING_RESULTS',
  SET_STATISTICS: 'SET_STATISTICS',
  SET_RANKING: 'SET_RANKING',
  
  // PDFs
  SET_PDFS_GENERATED: 'SET_PDFS_GENERATED',
  SET_PDFS_INFO: 'SET_PDFS_INFO',
  
  // Histórico
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  
  // Configurações
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Erros
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_WARNING: 'ADD_WARNING',
  CLEAR_WARNINGS: 'CLEAR_WARNINGS',
  
  // Reset
  RESET_PROCESS: 'RESET_PROCESS',
  RESET_ALL: 'RESET_ALL',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_API_STATUS:
      return {
        ...state,
        apiStatus: action.payload,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
      };

    case ActionTypes.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };

    case ActionTypes.SET_UPLOADED_FILE:
      return {
        ...state,
        uploadedFile: action.payload,
        error: null,
      };

    case ActionTypes.SET_VALIDATION_RESULT:
      return {
        ...state,
        validationResult: action.payload,
        warnings: action.payload?.avisos || [],
      };

    case ActionTypes.SET_CURRENT_PROCESS:
      return {
        ...state,
        currentProcess: action.payload,
      };

    case ActionTypes.SET_PROCESSING_RESULTS:
      return {
        ...state,
        processingResults: action.payload,
      };

    case ActionTypes.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload,
      };

    case ActionTypes.SET_RANKING:
      return {
        ...state,
        ranking: action.payload,
      };

    case ActionTypes.SET_PDFS_GENERATED:
      return {
        ...state,
        pdfsGenerated: action.payload,
      };

    case ActionTypes.SET_PDFS_INFO:
      return {
        ...state,
        pdfsInfo: action.payload,
      };

    case ActionTypes.ADD_TO_HISTORY:
      const newHistory = [action.payload, ...state.processHistory.slice(0, 9)]; // Manter apenas 10 últimos
      return {
        ...state,
        processHistory: newHistory,
      };

    case ActionTypes.CLEAR_HISTORY:
      return {
        ...state,
        processHistory: [],
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.ADD_WARNING:
      return {
        ...state,
        warnings: [...state.warnings, action.payload],
      };

    case ActionTypes.CLEAR_WARNINGS:
      return {
        ...state,
        warnings: [],
      };

    case ActionTypes.RESET_PROCESS:
      return {
        ...state,
        currentProcess: null,
        uploadedFile: null,
        validationResult: null,
        processingResults: null,
        statistics: null,
        ranking: null,
        pdfsGenerated: false,
        pdfsInfo: [],
        progress: 0,
        error: null,
        warnings: [],
      };

    case ActionTypes.RESET_ALL:
      return {
        ...initialState,
        apiStatus: state.apiStatus,
        settings: state.settings,
        processHistory: state.processHistory,
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('corretor-acafe-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }

    const savedHistory = localStorage.getItem('corretor-acafe-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        dispatch({ type: ActionTypes.ADD_TO_HISTORY, payload: history });
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('corretor-acafe-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (state.processHistory.length > 0) {
      localStorage.setItem('corretor-acafe-history', JSON.stringify(state.processHistory));
    }
  }, [state.processHistory]);

  // Actions helpers
  const actions = {
    // API Status
    setApiStatus: (status) => {
      dispatch({ type: ActionTypes.SET_API_STATUS, payload: status });
    },

    // Loading
    setLoading: (isLoading, message = '') => {
      dispatch({ 
        type: ActionTypes.SET_LOADING, 
        payload: { isLoading, message } 
      });
    },

    setProgress: (progress) => {
      dispatch({ type: ActionTypes.SET_PROGRESS, payload: progress });
    },

    // Upload
    setUploadedFile: (file) => {
      dispatch({ type: ActionTypes.SET_UPLOADED_FILE, payload: file });
    },

    setValidationResult: (result) => {
      dispatch({ type: ActionTypes.SET_VALIDATION_RESULT, payload: result });
    },

    // Processamento
    setCurrentProcess: (processId) => {
      dispatch({ type: ActionTypes.SET_CURRENT_PROCESS, payload: processId });
    },

    setProcessingResults: (results) => {
      dispatch({ type: ActionTypes.SET_PROCESSING_RESULTS, payload: results });
    },

    setStatistics: (stats) => {
      dispatch({ type: ActionTypes.SET_STATISTICS, payload: stats });
    },

    setRanking: (ranking) => {
      dispatch({ type: ActionTypes.SET_RANKING, payload: ranking });
    },

    // PDFs
    setPdfsGenerated: (generated) => {
      dispatch({ type: ActionTypes.SET_PDFS_GENERATED, payload: generated });
    },

    setPdfsInfo: (info) => {
      dispatch({ type: ActionTypes.SET_PDFS_INFO, payload: info });
    },

    // Histórico
    addToHistory: (processInfo) => {
      const historyItem = {
        ...processInfo,
        timestamp: new Date().toISOString(),
        id: processInfo.processo_id || Date.now().toString(),
      };
      dispatch({ type: ActionTypes.ADD_TO_HISTORY, payload: historyItem });
    },

    clearHistory: () => {
      dispatch({ type: ActionTypes.CLEAR_HISTORY });
      localStorage.removeItem('corretor-acafe-history');
    },

    // Configurações
    updateSettings: (newSettings) => {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: newSettings });
    },

    // Erros
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    addWarning: (warning) => {
      dispatch({ type: ActionTypes.ADD_WARNING, payload: warning });
    },

    clearWarnings: () => {
      dispatch({ type: ActionTypes.CLEAR_WARNINGS });
    },

    // Reset
    resetProcess: () => {
      dispatch({ type: ActionTypes.RESET_PROCESS });
    },

    resetAll: () => {
      dispatch({ type: ActionTypes.RESET_ALL });
    },
  };

  // Computed values
  const computed = {
    hasCurrentProcess: !!state.currentProcess,
    hasResults: !!state.processingResults,
    hasStatistics: !!state.statistics,
    hasPdfs: state.pdfsGenerated && state.pdfsInfo.length > 0,
    isProcessing: state.isLoading && state.currentProcess,
    canDownload: state.pdfsGenerated && state.pdfsInfo.length > 0,
    totalStudents: state.statistics?.gerais?.total_alunos || 0,
    averageScore: state.statistics?.gerais?.media_geral || 0,
    processCount: state.processHistory.length,
  };

  const value = {
    state,
    dispatch,
    actions,
    computed,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}

// Seletores específicos
export function useApiStatus() {
  const { state } = useApp();
  return state.apiStatus;
}

export function useCurrentProcess() {
  const { state } = useApp();
  return state.currentProcess;
}

export function useProcessingResults() {
  const { state } = useApp();
  return {
    results: state.processingResults,
    statistics: state.statistics,
    ranking: state.ranking,
    hasResults: !!state.processingResults,
  };
}

export function useLoadingState() {
  const { state } = useApp();
  return {
    isLoading: state.isLoading,
    message: state.loadingMessage,
    progress: state.progress,
  };
}

export function usePdfsState() {
  const { state } = useApp();
  return {
    generated: state.pdfsGenerated,
    info: state.pdfsInfo,
    count: state.pdfsInfo.length,
    canDownload: state.pdfsGenerated && state.pdfsInfo.length > 0,
  };
}

export function useSettings() {
  const { state, actions } = useApp();
  return {
    settings: state.settings,
    updateSettings: actions.updateSettings,
  };
}

export function useProcessHistory() {
  const { state, actions } = useApp();
  return {
    history: state.processHistory,
    addToHistory: actions.addToHistory,
    clearHistory: actions.clearHistory,
    count: state.processHistory.length,
  };
}

export { ActionTypes };