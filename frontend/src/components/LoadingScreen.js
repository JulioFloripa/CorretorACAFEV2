import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Carregando sistema...', progress = null }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-acafe-green to-acafe-light flex items-center justify-center z-50">
      <div className="text-center text-white">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            Corretor ACAFE Fleming
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg opacity-90"
          >
            Sistema Inteligente de Correção
          </motion.p>
        </motion.div>

        {/* Mensagem de loading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-lg font-medium mb-2">{message}</p>
          
          {/* Barra de progresso se fornecida */}
          {progress !== null && (
            <div className="w-64 mx-auto">
              <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-full h-2"
                />
              </div>
              <p className="text-sm opacity-80">{progress}%</p>
            </div>
          )}
        </motion.div>

        {/* Pontos animados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-white rounded-full"
            />
          ))}
        </motion.div>

        {/* Versão */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <p className="text-sm opacity-70">Versão 2.0 - FastAPI + React</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;