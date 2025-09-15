from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import numpy as np
import io
import os
import uuid
from typing import List, Dict, Any
import asyncio
from datetime import datetime

from .services import ProcessadorSimulado
from .models import EstudanteResponse, EstatisticasResponse
from .utils import GeradorPDF

app = FastAPI(
    title="Corretor ACAFE Fleming",
    description="Sistema Inteligente de Correção de Simulados",
    version="2.0.0"
)

# CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Armazenamento temporário em memória
processamentos = {}

@app.get("/")
async def root():
    return {
        "message": "Corretor ACAFE Fleming API",
        "version": "2.0.0",
        "status": "online"
    }

@app.post("/api/upload")
async def upload_arquivo(file: UploadFile = File(...)):
    """Upload e validação inicial do arquivo Excel"""
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Arquivo deve ser Excel (.xlsx ou .xls)")
    
    try:
        # Ler arquivo Excel
        contents = await file.read()
        dados = pd.read_excel(io.BytesIO(contents), sheet_name=None)
        
        # Validar estrutura
        processador = ProcessadorSimulado()
        validacao = processador.validar_estrutura(dados)
        
        if not validacao["valido"]:
            return JSONResponse(
                status_code=400,
                content={"erro": validacao["erros"]}
            )
        
        # Gerar ID único para este processamento
        processo_id = str(uuid.uuid4())
        
        # Armazenar dados temporariamente
        processamentos[processo_id] = {
            "dados": dados,
            "timestamp": datetime.now(),
            "status": "validado"
        }
        
        return {
            "processo_id": processo_id,
            "validacao": validacao,
            "preview": {
                "total_alunos": len(dados["RESPOSTAS"]),
                "total_questoes": len(dados["GABARITO"]),
                "disciplinas": dados["GABARITO"]["Disciplina"].unique().tolist()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

@app.post("/api/processar/{processo_id}")
async def processar_simulado(processo_id: str):
    """Processar correção do simulado"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    try:
        dados = processamentos[processo_id]["dados"]
        processador = ProcessadorSimulado()
        
        # Processar correção
        resultado = await processador.processar_async(dados)
        
        # Atualizar status
        processamentos[processo_id].update({
            "status": "processado",
            "resultado": resultado
        })
        
        return {
            "processo_id": processo_id,
            "status": "concluido",
            "estatisticas": resultado["estatisticas"],
            "ranking": resultado["ranking"][:10]  # Top 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar: {str(e)}")

@app.get("/api/estatisticas/{processo_id}")
async def obter_estatisticas(processo_id: str):
    """Obter estatísticas detalhadas"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    if processamentos[processo_id]["status"] != "processado":
        raise HTTPException(status_code=400, detail="Processo ainda não foi processado")
    
    resultado = processamentos[processo_id]["resultado"]
    return resultado["estatisticas"]

@app.get("/api/ranking/{processo_id}")
async def obter_ranking(processo_id: str):
    """Obter ranking completo"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    if processamentos[processo_id]["status"] != "processado":
        raise HTTPException(status_code=400, detail="Processo ainda não foi processado")
    
    resultado = processamentos[processo_id]["resultado"]
    return {"ranking": resultado["ranking"]}

@app.post("/api/gerar-pdfs/{processo_id}")
async def gerar_pdfs(processo_id: str):
    """Gerar PDFs individuais para todos os alunos"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    if processamentos[processo_id]["status"] != "processado":
        raise HTTPException(status_code=400, detail="Processo ainda não foi processado")
    
    try:
        resultado = processamentos[processo_id]["resultado"]
        gerador = GeradorPDF()
        
        # Gerar PDFs
        pdfs_info = await gerador.gerar_todos_pdfs_async(resultado)
        
        # Atualizar com informações dos PDFs
        processamentos[processo_id]["pdfs"] = pdfs_info
        
        return {
            "total_pdfs": len(pdfs_info),
            "pdfs": pdfs_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDFs: {str(e)}")

@app.get("/api/download-pdf/{processo_id}/{aluno_id}")
async def download_pdf(processo_id: str, aluno_id: str):
    """Download de PDF individual"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    if "pdfs" not in processamentos[processo_id]:
        raise HTTPException(status_code=400, detail="PDFs ainda não foram gerados")
    
    pdfs_info = processamentos[processo_id]["pdfs"]
    pdf_info = next((p for p in pdfs_info if p["aluno_id"] == aluno_id), None)
    
    if not pdf_info:
        raise HTTPException(status_code=404, detail="PDF não encontrado")
    
    if not os.path.exists(pdf_info["caminho"]):
        raise HTTPException(status_code=404, detail="Arquivo PDF não encontrado")
    
    return FileResponse(
        pdf_info["caminho"],
        media_type="application/pdf",
        filename=pdf_info["nome_arquivo"]
    )

@app.get("/api/download-todos-pdfs/{processo_id}")
async def download_todos_pdfs(processo_id: str):
    """Download de todos os PDFs em ZIP"""
    
    if processo_id not in processamentos:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    if "pdfs" not in processamentos[processo_id]:
        raise HTTPException(status_code=400, detail="PDFs ainda não foram gerados")
    
    try:
        gerador = GeradorPDF()
        zip_path = await gerador.criar_zip_pdfs(processamentos[processo_id]["pdfs"])
        
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=f"boletins_simulado_{processo_id[:8]}.zip"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar ZIP: {str(e)}")

@app.get("/api/template-excel")
async def download_template():
    """Download do template Excel"""
    
    try:
        gerador = GeradorPDF()
        template_path = gerador.criar_template_excel()
        
        return FileResponse(
            template_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="template_simulado_acafe.xlsx"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar template: {str(e)}")

@app.delete("/api/limpar/{processo_id}")
async def limpar_processo(processo_id: str):
    """Limpar dados do processo da memória"""
    
    if processo_id in processamentos:
        # Limpar arquivos temporários se existirem
        if "pdfs" in processamentos[processo_id]:
            gerador = GeradorPDF()
            await gerador.limpar_arquivos_temporarios(processamentos[processo_id]["pdfs"])
        
        del processamentos[processo_id]
        return {"message": "Processo limpo com sucesso"}
    
    raise HTTPException(status_code=404, detail="Processo não encontrado")

@app.get("/health")
async def health_check():
    """Health check para monitoramento"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "processos_ativos": len(processamentos)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
