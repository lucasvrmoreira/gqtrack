from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from backend.config import SECRET_KEY



ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 2

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario: str = payload.get("usuario")
        role: str = payload.get("role")
        if usuario is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        # 🔸 devolve dict, não string
        return {"usuario": usuario, "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

