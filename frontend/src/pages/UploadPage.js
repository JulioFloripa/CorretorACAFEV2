import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { uploadFile, validateFile, downloadTemplate } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const { actions } = useApp();
  
  const [uploadState, setUploadState] = useState({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    validationResult: null,
    error: null
  });

  // Validar e processar arquivo
  const handleFileSelect = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validação local
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.errors.join(', ')
      }));
      toast.error(validation.errors[0]);
      return;
    }

    // Mostrar warnings se houver
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        toast.warning(warning);
      });
    }

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      uploadProgress: 0
    }));

    // Upload automático
    await handleUpload(file);
  }, []);

  // Configuração do dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024, // 200MB
    multiple: false
  });

  // Fazer upload
  const handleUpload = async (file) => {
    setUploadState(prev => ({ ...prev, isUploading: true }));
    actions.setLoading(true, 'Fazendo upload do arquivo...');

    try {
      const result = await uploadFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, uploadProgress: progress }));
        actions.setProgress(progress);
      });

      // Sucesso no upload
      actions.setUploadedFile(file);
      actions.setValidationResult(result.validacao);
      actions.setCurrentProcess(result.processo_id);
      
      setUploadState(prev => ({
        ...prev,
        validationResult: result.validacao,
        isUploading: false
      }));

      toast.success('Arquivo enviado com sucesso!');

      // Redirecionar para resultados após 2 segundos
      setTimeout(() => {
        navigate(`/results/${result.processo_id}`);
      }, 2000);

    } catch (error) {
      console.error('Erro no upload:', error);
      
      setUploadState(prev => ({
        ...prev,
        error: error.message,
        isUploading: false
      }));
      
      actions.setError(error.message);
      toast.error(error.message);
    } finally {
      actions.setLoading(false);
      actions.setProgress(0);
    }
  };

  // Remover arquivo
  const handleRemoveFile = () => {
    setUploadState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      validationResult: null,
      error: null
    });
    actions.resetProcess();
  };

  // Download do template
  const handleDownloadTemplate = async () => {
    try {
      toast.loading('Preparando template...');
      await downloadTemplate();
      toast.dismiss();
      toast.success('Template baixado com sucesso!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao baixar template: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload do Simulado
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Faça upload do arquivo Excel com as respostas dos alunos e o gabarito. 
            O sistema processará automaticamente e gerará os boletins.
          </p>
        </motion.div>

        {/* Template Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Precisa do template?
                </h3>
                <p className="text-blue-700">
                  Baixe o modelo Excel com a estrutura correta para o simulado ACAFE
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </button>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {!uploadState.file ? (
            // Dropzone
            <div
              {...getRootProps()}
              className={`p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-acafe-green bg-green-50'
                  : isDragReject
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-acafe-green hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  isDragActive
                    ? 'bg-acafe-green text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Upload className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragActive
                      ? 'Solte o arquivo aqui'
                      : 'Arraste o arquivo Excel ou clique para selecionar'
                    }
                  </h3>
                  <p className="text-gray-600">
                    Formatos aceitos: .xlsx, .xls (máximo 200MB)
                  </p>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center px-6 py-3 bg-acafe-green text-white font-medium rounded-lg hover:bg-acafe-green/90 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Selecionar Arquivo
                </button>
              </div>
            </div>
          ) : (
            // Arquivo selecionado
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {uploadState.file.name}
                    </h3>
                    <p className="text-gray-600">
                      {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                {!uploadState.isUploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {uploadState.isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Enviando arquivo...
                    </span>
                    <span className="text-sm text-gray-600">
                      {uploadState.uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadState.uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-acafe-green h-2 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Validation Results */}
              <AnimatePresence>
                {uploadState.validationResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Sucesso */}
                    {uploadState.validationResult.valido && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <h4 className="font-semibold text-green-800">
                            Arquivo validado com sucesso!
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-green-700">
                              {uploadState.validationResult.estrutura_detectada?.total_alunos || 0} alunos
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-green-700">
                              {uploadState.validationResult.estrutura_detectada?.total_questoes || 0} questões
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-green-700">
                              Estrutura correta
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Erros */}
                    {uploadState.validationResult.erros?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <h4 className="font-semibold text-red-800">
                            Problemas encontrados:
                          </h4>
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {uploadState.validationResult.erros.map((erro, index) => (
                            <li key={index}>{erro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Avisos */}
                    {uploadState.validationResult.avisos?.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                          <h4 className="font-semibold text-yellow-800">
                            Avisos:
                          </h4>
                        </div>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                          {uploadState.validationResult.avisos.map((aviso, index) => (
                            <li key={index}>{aviso}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {uploadState.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">
                      {uploadState.error}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {uploadState.isUploading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-acafe-green animate-spin mr-3" />
                  <span className="text-lg text-gray-700">
                    Processando arquivo...
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Instruções para o arquivo Excel:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Aba RESPOSTAS:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Coluna ID: Identificador único do aluno</li>
                <li>• Coluna Nome: Nome completo do aluno</li>
                <li>• Colunas Questão 01-70: Respostas (A, B, C, D, E)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Aba GABARITO:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Coluna Questão: Número da questão</li>
                <li>• Coluna Resposta: Resposta correta (A, B, C, D, E)</li>
                <li>• Coluna Disciplina: Nome da disciplina</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;