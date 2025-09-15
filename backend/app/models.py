from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class EstudanteBase(BaseModel):
    id: str
    nome: str
    sede: Optional[str] = None

class EstudanteResponse(EstudanteBase):
    posicao: int
    nota_percentual: float
    acertos: int
    total_questoes: int
    desempenho_disciplinas: Dict[str, Dict[str, Any]]
    status_performance: str  # "Excelente", "Bom", "Regular", "Precisa Melhorar"

class DisciplinaEstatistica(BaseModel):
    nome: str
    media_percentual: float
    questoes_total: int
    questao_mais_dificil: int
    questao_mais_facil: int
    acertos_media: float

class EstatisticasGerais(BaseModel):
    total_alunos: int
    total_questoes: int
    media_geral: float
    nota_maxima: float
    nota_minima: float
    desvio_padrao: float
    disciplinas: List[DisciplinaEstatistica]

class EstatisticasResponse(BaseModel):
    gerais: EstatisticasGerais
    distribuicao_notas: Dict[str, int]  # Faixas de notas
    top_3: List[EstudanteResponse]

class ProcessoStatus(BaseModel):
    processo_id: str
    status: str  # "validado", "processando", "processado", "erro"
    timestamp: datetime
    progresso: Optional[int] = None  # 0-100

class ValidacaoResponse(BaseModel):
    valido: bool
    erros: List[str]
    avisos: List[str]
    estrutura_detectada: Dict[str, Any]

class UploadResponse(BaseModel):
    processo_id: str
    validacao: ValidacaoResponse
    preview: Dict[str, Any]

class ProcessamentoResponse(BaseModel):
    processo_id: str
    status: str
    estatisticas: EstatisticasResponse
    ranking: List[EstudanteResponse]

class PDFInfo(BaseModel):
    aluno_id: str
    nome_aluno: str
    nome_arquivo: str
    caminho: str
    tamanho_bytes: int

class PDFsResponse(BaseModel):
    total_pdfs: int
    pdfs: List[PDFInfo]
    zip_disponivel: bool = False

class TemplateExcelResponse(BaseModel):
    nome_arquivo: str
    descricao: str
    instrucoes: List[str]

# Modelos para dados internos (não expostos na API)
class DadosAluno(BaseModel):
    id: str
    nome: str
    sede: Optional[str]
    respostas: Dict[int, str]  # questao_numero -> resposta
    idioma_escolhido: Optional[str] = None

class QuestaoGabarito(BaseModel):
    numero: int
    disciplina: str
    resposta_correta: str
    dificuldade: Optional[str] = None

class ResultadoCorrecao(BaseModel):
    aluno: DadosAluno
    acertos: int
    erros: int
    nota_percentual: float
    questoes_corretas: List[int]
    questoes_erradas: List[int]
    desempenho_por_disciplina: Dict[str, Dict[str, Any]]

class DadosProcessamento(BaseModel):
    alunos: List[DadosAluno]
    gabarito: List[QuestaoGabarito]
    metadados: Dict[str, Any]

# Enums para status e categorias
from enum import Enum

class StatusProcesso(str, Enum):
    VALIDADO = "validado"
    PROCESSANDO = "processando"
    PROCESSADO = "processado"
    GERANDO_PDFS = "gerando_pdfs"
    CONCLUIDO = "concluido"
    ERRO = "erro"

class StatusPerformance(str, Enum):
    EXCELENTE = "Excelente"  # >= 85%
    BOM = "Bom"              # >= 70%
    REGULAR = "Regular"      # >= 50%
    PRECISA_MELHORAR = "Precisa Melhorar"  # < 50%

class TipoValidacao(str, Enum):
    ERRO = "erro"
    AVISO = "aviso"
    INFO = "info"

# Configurações e constantes
class ConfiguracaoSistema(BaseModel):
    max_file_size_mb: int = 200
    formatos_aceitos: List[str] = ['.xlsx', '.xls']
    timeout_processamento: int = 900  # 15 minutos
    max_alunos_por_lote: int = 100
    
    # Configurações de performance
    faixas_performance: Dict[str, tuple] = {
        StatusPerformance.EXCELENTE: (85, 100),
        StatusPerformance.BOM: (70, 84),
        StatusPerformance.REGULAR: (50, 69),
        StatusPerformance.PRECISA_MELHORAR: (0, 49)
    }
    
    # Configurações de cores para gráficos (tema ACAFE)
    cores_tema: Dict[str, str] = {
        "primary": "#2E7D32",      # Verde ACAFE
        "secondary": "#4CAF50",    # Verde claro
        "accent": "#81C784",       # Verde muito claro
        "warning": "#FF9800",      # Laranja
        "error": "#F44336",        # Vermelho
        "success": "#4CAF50",      # Verde
        "info": "#2196F3"          # Azul
    }

# Response models para diferentes endpoints
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    processos_ativos: int
    memoria_utilizada: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = datetime.now()

# Modelos para configuração de relatórios
class ConfiguracaoRelatorio(BaseModel):
    incluir_graficos: bool = True
    incluir_estatisticas_detalhadas: bool = True
    incluir_comparacao_disciplinas: bool = True
    formato_data: str = "%d/%m/%Y"
    logo_acafe_url: Optional[str] = None
    logo_fleming_url: Optional[str] = None
    
class MetadadosRelatorio(BaseModel):
    titulo: str = "Boletim Individual - Simulado ACAFE"
    subtitulo: str = "Colégio Fleming"
    rodape: str = "Sistema Inteligente de Correção"
    versao: str = "2.0"
