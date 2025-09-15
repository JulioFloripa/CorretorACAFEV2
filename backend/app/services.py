import pandas as pd
import numpy as np
import asyncio
from typing import Dict, List, Any, Tuple, Optional
import logging
from datetime import datetime

from .models import (
    DadosAluno, QuestaoGabarito, ResultadoCorrecao, 
    EstudanteResponse, EstatisticasGerais, DisciplinaEstatistica,
    EstatisticasResponse, ValidacaoResponse, StatusPerformance,
    ConfiguracaoSistema
)

logger = logging.getLogger(__name__)

class ProcessadorSimulado:
    """Classe principal para processamento de simulados ACAFE"""
    
    def __init__(self):
        self.config = ConfiguracaoSistema()
    
    def validar_estrutura(self, dados: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Valida a estrutura do arquivo Excel"""
        
        erros = []
        avisos = []
        
        # Verificar abas obrigatórias
        abas_obrigatorias = ['RESPOSTAS', 'GABARITO']
        for aba in abas_obrigatorias:
            if aba not in dados:
                erros.append(f"Aba '{aba}' não encontrada")
        
        if erros:
            return {
                "valido": False,
                "erros": erros,
                "avisos": avisos,
                "estrutura_detectada": {}
            }
        
        # Validar aba RESPOSTAS
        respostas_df = dados['RESPOSTAS']
        colunas_obrigatorias_respostas = ['ID', 'Nome']
        
        for coluna in colunas_obrigatorias_respostas:
            if coluna not in respostas_df.columns:
                erros.append(f"Coluna '{coluna}' não encontrada na aba RESPOSTAS")
        
        # Verificar colunas de questões
        colunas_questoes = [col for col in respostas_df.columns if col.startswith('Questão')]
        if len(colunas_questoes) == 0:
            erros.append("Nenhuma coluna de questão encontrada (formato: 'Questão 01', 'Questão 02', etc.)")
        
        # Validar aba GABARITO
        gabarito_df = dados['GABARITO']
        colunas_obrigatorias_gabarito = ['Questão', 'Resposta', 'Disciplina']
        
        for coluna in colunas_obrigatorias_gabarito:
            if coluna not in gabarito_df.columns:
                erros.append(f"Coluna '{coluna}' não encontrada na aba GABARITO")
        
        if not erros:
            # Validações adicionais
            
            # Verificar questões duplicadas por disciplina
            questoes_duplicadas = self._verificar_questoes_duplicadas(gabarito_df)
            if questoes_duplicadas:
                avisos.extend(questoes_duplicadas)
            
            # Verificar se há alunos sem respostas
            alunos_sem_respostas = respostas_df[respostas_df[colunas_questoes].isnull().all(axis=1)]
            if len(alunos_sem_respostas) > 0:
                avisos.append(f"{len(alunos_sem_respostas)} aluno(s) sem respostas encontrado(s)")
            
            # Verificar questões de línguas (Inglês/Espanhol)
            linguas_detectadas = self._detectar_questoes_linguas(gabarito_df)
            if linguas_detectadas:
                avisos.append(f"Questões de línguas detectadas: {', '.join(linguas_detectadas)}")
        
        estrutura_detectada = {
            "total_alunos": len(respostas_df) if 'RESPOSTAS' in dados else 0,
            "total_questoes": len(gabarito_df) if 'GABARITO' in dados else 0,
            "disciplinas": gabarito_df['Disciplina'].unique().tolist() if 'GABARITO' in dados else [],
            "colunas_questoes": len(colunas_questoes) if 'RESPOSTAS' in dados else 0
        }
        
        return {
            "valido": len(erros) == 0,
            "erros": erros,
            "avisos": avisos,
            "estrutura_detectada": estrutura_detectada
        }
    
    def _verificar_questoes_duplicadas(self, gabarito_df: pd.DataFrame) -> List[str]:
        """Verifica questões duplicadas dentro da mesma disciplina"""
        avisos = []
        
        for disciplina in gabarito_df['Disciplina'].unique():
            disciplina_df = gabarito_df[gabarito_df['Disciplina'] == disciplina]
            questoes_duplicadas = disciplina_df[disciplina_df.duplicated(subset=['Questão'], keep=False)]
            
            if len(questoes_duplicadas) > 0:
                questoes_nums = questoes_duplicadas['Questão'].unique()
                avisos.append(f"Questões duplicadas em {disciplina}: {list(questoes_nums)}")
        
        return avisos
    
    def _detectar_questoes_linguas(self, gabarito_df: pd.DataFrame) -> List[str]:
        """Detecta questões de línguas estrangeiras"""
        linguas = []
        disciplinas_linguas = ['Inglês', 'Espanhol', 'Ingles', 'Espanol']
        
        for lingua in disciplinas_linguas:
            if lingua in gabarito_df['Disciplina'].values:
                linguas.append(lingua)
        
        return linguas
    
    async def processar_async(self, dados: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Processa o simulado de forma assíncrona"""
        
        logger.info("Iniciando processamento do simulado")
        
        # Preparar dados
        alunos = self._preparar_dados_alunos(dados['RESPOSTAS'])
        gabarito = self._preparar_gabarito(dados['GABARITO'])
        
        # Processar correção
        resultados = await self._processar_correcao_async(alunos, gabarito)
        
        # Calcular estatísticas
        estatisticas = self._calcular_estatisticas(resultados, gabarito)
        
        # Gerar ranking
        ranking = self._gerar_ranking(resultados)
        
        logger.info(f"Processamento concluído: {len(alunos)} alunos processados")
        
        return {
            "resultados": resultados,
            "estatisticas": estatisticas,
            "ranking": ranking,
            "metadados": {
                "timestamp": datetime.now(),
                "total_alunos": len(alunos),
                "total_questoes": len(gabarito)
            }
        }
    
    def _preparar_dados_alunos(self, respostas_df: pd.DataFrame) -> List[DadosAluno]:
        """Prepara dados dos alunos"""
        alunos = []
        
        # Identificar colunas de questões
        colunas_questoes = [col for col in respostas_df.columns if col.startswith('Questão')]
        
        for _, row in respostas_df.iterrows():
            # Extrair respostas
            respostas = {}
            for col in colunas_questoes:
                # Extrair número da questão
                try:
                    num_questao = int(col.split()[-1])
                    resposta = str(row[col]).strip().upper() if pd.notna(row[col]) else None
                    if resposta and resposta in ['A', 'B', 'C', 'D', 'E']:
                        respostas[num_questao] = resposta
                except (ValueError, IndexError):
                    continue
            
            aluno = DadosAluno(
                id=str(row['ID']),
                nome=str(row['Nome']),
                sede=str(row.get('Sede', '')) if pd.notna(row.get('Sede')) else None,
                respostas=respostas,
                idioma_escolhido=str(row.get('Idioma escolhido', '')) if pd.notna(row.get('Idioma escolhido')) else None
            )
            alunos.append(aluno)
        
        return alunos
    
    def _preparar_gabarito(self, gabarito_df: pd.DataFrame) -> List[QuestaoGabarito]:
        """Prepara gabarito"""
        gabarito = []
        
        for _, row in gabarito_df.iterrows():
            questao = QuestaoGabarito(
                numero=int(row['Questão']),
                disciplina=str(row['Disciplina']).strip(),
                resposta_correta=str(row['Resposta']).strip().upper()
            )
            gabarito.append(questao)
        
        return gabarito
    
    async def _processar_correcao_async(self, alunos: List[DadosAluno], gabarito: List[QuestaoGabarito]) -> List[ResultadoCorrecao]:
        """Processa correção de forma assíncrona"""
        
        # Criar dicionário de gabarito para acesso rápido
        gabarito_dict = {}
        for q in gabarito:
            if q.numero not in gabarito_dict:
                gabarito_dict[q.numero] = []
            gabarito_dict[q.numero].append(q)
        
        # Processar alunos em lotes
        lote_size = self.config.max_alunos_por_lote
        resultados = []
        
        for i in range(0, len(alunos), lote_size):
            lote = alunos[i:i + lote_size]
            lote_resultados = await asyncio.gather(*[
                self._corrigir_aluno_async(aluno, gabarito_dict) 
                for aluno in lote
            ])
            resultados.extend(lote_resultados)
        
        return resultados
    
    async def _corrigir_aluno_async(self, aluno: DadosAluno, gabarito_dict: Dict[int, List[QuestaoGabarito]]) -> ResultadoCorrecao:
        """Corrige um aluno específico"""
        
        acertos = 0
        erros = 0
        questoes_corretas = []
        questoes_erradas = []
        desempenho_disciplinas = {}
        
        # Questões únicas (para lidar com Inglês/Espanhol)
        questoes_unicas = set(gabarito_dict.keys())
        
        for num_questao in questoes_unicas:
            questoes_gabarito = gabarito_dict[num_questao]
            
            # Se há múltiplas opções (Inglês/Espanhol), escolher baseado no idioma do aluno
            questao_correta = self._escolher_questao_idioma(questoes_gabarito, aluno.idioma_escolhido)
            
            if num_questao in aluno.respostas:
                resposta_aluno = aluno.respostas[num_questao]
                
                if resposta_aluno == questao_correta.resposta_correta:
                    acertos += 1
                    questoes_corretas.append(num_questao)
                else:
                    erros += 1
                    questoes_erradas.append(num_questao)
                
                # Atualizar desempenho por disciplina
                disciplina = questao_correta.disciplina
                if disciplina not in desempenho_disciplinas:
                    desempenho_disciplinas[disciplina] = {
                        "acertos": 0,
                        "total": 0,
                        "questoes_corretas": [],
                        "questoes_erradas": []
                    }
                
                desempenho_disciplinas[disciplina]["total"] += 1
                if resposta_aluno == questao_correta.resposta_correta:
                    desempenho_disciplinas[disciplina]["acertos"] += 1
                    desempenho_disciplinas[disciplina]["questoes_corretas"].append(num_questao)
                else:
                    desempenho_disciplinas[disciplina]["questoes_erradas"].append(num_questao)
            else:
                # Questão não respondida
                erros += 1
                questoes_erradas.append(num_questao)
        
        # Calcular percentuais por disciplina
        for disciplina in desempenho_disciplinas:
            stats = desempenho_disciplinas[disciplina]
            stats["percentual"] = (stats["acertos"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        
        total_questoes = len(questoes_unicas)
        nota_percentual = (acertos / total_questoes) * 100 if total_questoes > 0 else 0
        
        return ResultadoCorrecao(
            aluno=aluno,
            acertos=acertos,
            erros=erros,
            nota_percentual=nota_percentual,
            questoes_corretas=questoes_corretas,
            questoes_erradas=questoes_erradas,
            desempenho_por_disciplina=desempenho_disciplinas
        )
    
    def _escolher_questao_idioma(self, questoes: List[QuestaoGabarito], idioma_escolhido: Optional[str]) -> QuestaoGabarito:
        """Escolhe a questão correta baseada no idioma escolhido pelo aluno"""
        
        if len(questoes) == 1:
            return questoes[0]
        
        # Se há múltiplas questões (Inglês/Espanhol), escolher baseado no idioma
        if idioma_escolhido:
            idioma_lower = idioma_escolhido.lower()
            for questao in questoes:
                disciplina_lower = questao.disciplina.lower()
                if ('inglês' in disciplina_lower or 'ingles' in disciplina_lower) and 'inglês' in idioma_lower:
                    return questao
                elif ('espanhol' in disciplina_lower or 'espanol' in disciplina_lower) and 'espanhol' in idioma_lower:
                    return questao
        
        # Default: retornar a primeira questão
        return questoes[0]
    
    def _calcular_estatisticas(self, resultados: List[ResultadoCorrecao], gabarito: List[QuestaoGabarito]) -> EstatisticasResponse:
        """Calcula estatísticas gerais"""
        
        if not resultados:
            return EstatisticasResponse(
                gerais=EstatisticasGerais(
                    total_alunos=0,
                    total_questoes=0,
                    media_geral=0,
                    nota_maxima=0,
                    nota_minima=0,
                    desvio_padrao=0,
                    disciplinas=[]
                ),
                distribuicao_notas={},
                top_3=[]
            )
        
        # Estatísticas gerais
        notas = [r.nota_percentual for r in resultados]
        media_geral = np.mean(notas)
        nota_maxima = np.max(notas)
        nota_minima = np.min(notas)
        desvio_padrao = np.std(notas)
        
        # Estatísticas por disciplina
        disciplinas_stats = self._calcular_estatisticas_disciplinas(resultados, gabarito)
        
        # Distribuição de notas
        distribuicao = self._calcular_distribuicao_notas(notas)
        
        # Top 3
        top_3 = self._gerar_ranking(resultados)[:3]
        
        gerais = EstatisticasGerais(
            total_alunos=len(resultados),
            total_questoes=len(set(q.numero for q in gabarito)),
            media_geral=media_geral,
            nota_maxima=nota_maxima,
            nota_minima=nota_minima,
            desvio_padrao=desvio_padrao,
            disciplinas=disciplinas_stats
        )
        
        return EstatisticasResponse(
            gerais=gerais,
            distribuicao_notas=distribuicao,
            top_3=top_3
        )
    
    def _calcular_estatisticas_disciplinas(self, resultados: List[ResultadoCorrecao], gabarito: List[QuestaoGabarito]) -> List[DisciplinaEstatistica]:
        """Calcula estatísticas por disciplina"""
        
        disciplinas_stats = []
        disciplinas_unicas = set(q.disciplina for q in gabarito)
        
        for disciplina in disciplinas_unicas:
            # Questões desta disciplina
            questoes_disciplina = [q.numero for q in gabarito if q.disciplina == disciplina]
            
            # Desempenho dos alunos nesta disciplina
            percentuais = []
            acertos_por_questao = {q: 0 for q in questoes_disciplina}
            
            for resultado in resultados:
                if disciplina in resultado.desempenho_por_disciplina:
                    stats = resultado.desempenho_por_disciplina[disciplina]
                    percentuais.append(stats["percentual"])
                    
                    # Contar acertos por questão
                    for questao in stats["questoes_corretas"]:
                        if questao in acertos_por_questao:
                            acertos_por_questao[questao] += 1
            
            if percentuais:
                media_percentual = np.mean(percentuais)
                
                # Questão mais difícil (menos acertos)
                questao_mais_dificil = min(acertos_por_questao.items(), key=lambda x: x[1])[0]
                
                # Questão mais fácil (mais acertos)
                questao_mais_facil = max(acertos_por_questao.items(), key=lambda x: x[1])[0]
                
                # Média de acertos
                acertos_media = np.mean(list(acertos_por_questao.values()))
                
                disciplina_stat = DisciplinaEstatistica(
                    nome=disciplina,
                    media_percentual=media_percentual,
                    questoes_total=len(questoes_disciplina),
                    questao_mais_dificil=questao_mais_dificil,
                    questao_mais_facil=questao_mais_facil,
                    acertos_media=acertos_media
                )
                disciplinas_stats.append(disciplina_stat)
        
        return disciplinas_stats
    
    def _calcular_distribuicao_notas(self, notas: List[float]) -> Dict[str, int]:
        """Calcula distribuição de notas por faixas"""
        
        distribuicao = {
            "0-20": 0,
            "21-40": 0,
            "41-60": 0,
            "61-80": 0,
            "81-100": 0
        }
        
        for nota in notas:
            if nota <= 20:
                distribuicao["0-20"] += 1
            elif nota <= 40:
                distribuicao["21-40"] += 1
            elif nota <= 60:
                distribuicao["41-60"] += 1
            elif nota <= 80:
                distribuicao["61-80"] += 1
            else:
                distribuicao["81-100"] += 1
        
        return distribuicao
    
    def _gerar_ranking(self, resultados: List[ResultadoCorrecao]) -> List[EstudanteResponse]:
        """Gera ranking dos estudantes"""
        
        # Ordenar por nota (decrescente) e depois por nome (crescente)
        resultados_ordenados = sorted(
            resultados, 
            key=lambda x: (-x.nota_percentual, x.aluno.nome)
        )
        
        ranking = []
        for i, resultado in enumerate(resultados_ordenados):
            # Determinar status de performance
            status = self._determinar_status_performance(resultado.nota_percentual)
            
            estudante = EstudanteResponse(
                id=resultado.aluno.id,
                nome=resultado.aluno.nome,
                sede=resultado.aluno.sede,
                posicao=i + 1,
                nota_percentual=resultado.nota_percentual,
                acertos=resultado.acertos,
                total_questoes=resultado.acertos + resultado.erros,
                desempenho_disciplinas=resultado.desempenho_por_disciplina,
                status_performance=status
            )
            ranking.append(estudante)
        
        return ranking
    
    def _determinar_status_performance(self, nota_percentual: float) -> str:
        """Determina o status de performance baseado na nota"""
        
        for status, (min_nota, max_nota) in self.config.faixas_performance.items():
            if min_nota <= nota_percentual <= max_nota:
                return status.value
        
        return StatusPerformance.PRECISA_MELHORAR.value
