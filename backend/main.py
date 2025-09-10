from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from models import Usuario, MaterialEstoque, TrilhaAuditoria
from auth import create_access_token, verify_token, get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import List
import uvicorn

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "https://gqtrack.vercel.app",
    "https://gqtrack-lnxjui2j1-lucas-projects-e243ea2c.vercel.app",
    "https://gqtrack-vk8rvkazn-lucas-projects-e243ea2c.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ MODELOS Pydantic ------------------ #

class LoginRequest(BaseModel):
    usuario: str
    senha: str

class StatusUpdate(BaseModel):
    status: str

# ------------------ ROTAS ------------------ #

@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == data.usuario).first()
    if not user or not user.check_password(data.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token({"usuario": user.username})
    log = TrilhaAuditoria(
        usuario=user.username,
        acao="Login",
        detalhes="Usuário acessou o sistema com sucesso"
    )
    db.add(log)
    db.commit()
    return {"token": token}

@app.post("/api/logout")
def logout(usuario: str = Depends(get_current_user), db: Session = Depends(get_db)):
    log = TrilhaAuditoria(
        usuario=usuario,
        acao="Logout",
        detalhes="Usuário encerrou a sessão"
    )
    db.add(log)
    db.commit()
    return {"message": "Logout registrado com sucesso"}

@app.put("/api/materiais/{lote}/status")
def atualizar_status(lote: str, body: StatusUpdate, usuario: str = Depends(get_current_user), db: Session = Depends(get_db)):
    material = db.query(MaterialEstoque).filter(MaterialEstoque.lote == lote).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")

    material.status = body.status
    log = TrilhaAuditoria(
        usuario=usuario,
        acao=f"Alterou status para {body.status}",
        detalhes=f"Lote {material.lote} - {material.descricao}"
    )
    db.add(log)
    db.commit()
    return {"success": True, "message": "Status atualizado com sucesso"}

@app.get("/api/materiais")
def get_materiais(usuario: str = Depends(get_current_user), db: Session = Depends(get_db)):
    registros = db.query(MaterialEstoque).order_by(MaterialEstoque.codigo.asc()).all()
    return [
        {
            "codigo": r.codigo,
            "descricao": r.descricao,
            "lote": r.lote,
            "status": r.status,
            "validade": r.validade.strftime('%Y-%m-%d')
        } for r in registros
    ]

@app.get("/api/trilha")
def trilha(usuario: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(TrilhaAuditoria).order_by(TrilhaAuditoria.timestamp.desc()).all()
    return [
        {
            "usuario": r.usuario,
            "acao": r.acao,
            "detalhes": r.detalhes,
            "timestamp": r.timestamp.isoformat()
        } for r in logs
    ]


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
