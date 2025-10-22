from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import SQLALCHEMY_DATABASE_URI, DB_SCHEMA


# Metadata com schema padrão
metadata = MetaData(schema=DB_SCHEMA)
Base = declarative_base(metadata=metadata)

# Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
)

# Força o schema antes de qualquer operação
def set_search_path():
    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {DB_SCHEMA}, public"))
        conn.commit()
set_search_path()

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
