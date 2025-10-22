from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db, Base, engine
from backend.models import Usuario, MaterialEstoque, TrilhaAuditoria
from backend.auth import create_access_token, verify_token, get_current_user
from pydantic import BaseModel
from datetime import datetime

# 🔹 Cria as tabelas automaticamente (schema já configurado no database.py)
Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(title="GQTrack Backend", version="1.0.0")

# ------------------ CORS ------------------ #
origins = [
    "http://localhost:5173",
    "https://gqtrack.vercel.app",
    "https://www.gqtrack.vercel.app"
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

    token = create_access_token({"usuario": user.username, "role": user.role})
    log = TrilhaAuditoria(
        usuario=user.username,
        acao="Login",
        detalhes="Usuário acessou o sistema com sucesso"
    )
    db.add(log)
    db.commit()
    return {"token": token, "role": user.role}


@app.put("/api/materiais/{lote}/status")
def atualizar_status(lote: str, body: StatusUpdate, token: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    usuario = token.get("usuario")
    role = token.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar status.")

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
def get_materiais(token: dict = Depends(get_current_user), db: Session = Depends(get_db)):
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
def trilha(token: dict = Depends(get_current_user), db: Session = Depends(get_db)):
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
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000)
