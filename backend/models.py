from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from backend.database import Base
from werkzeug.security import check_password_hash
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="producao")

    def check_password(self, senha: str) -> bool:
        return check_password_hash(self.password, senha)


class MaterialEstoque(Base):
    __tablename__ = "materiais_estoque"

    codigo = Column(String(50))
    descricao = Column(String(255), nullable=False)
    lote = Column(String(50), primary_key=True, index=True)
    status = Column(String(20), nullable=False)
    validade = Column(Date, nullable=False)


class TrilhaAuditoria(Base):
    __tablename__ = "trilha_auditoria"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(50))
    acao = Column(String(120))
    detalhes = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
