from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import date
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
import jwt



app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https://gqtrack.vercel.app",
    "https://gqtrack-lnxjui2j1-lucas-projects-e243ea2c.vercel.app"  # <--- esse também
], supports_credentials=True)




app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config["SECRET_KEY"] = SECRET_KEY
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

db = SQLAlchemy(app)

# Modelo da tabela usuarios
class Usuario(db.Model):
    __tablename__ = 'usuarios'  # Está no schema public

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Novo modelo da tabela materiais_estoque
class MaterialEstoque(db.Model):
    __tablename__ = 'materiais_estoque'  # Schema: public (default)

    codigo = db.Column(db.String(50))
    descricao = db.Column(db.String(255), nullable=False)
    lote = db.Column(db.String(50), primary_key=True)  # CHAVE PRIMÁRIA
    status = db.Column(db.String(20), nullable=False)
    validade = db.Column(db.Date, nullable=False)



class TrilhaAuditoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(50))
    acao = db.Column(db.String(120))
    detalhes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

def get_usuario_logado():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["usuario"]
    except jwt.ExpiredSignatureError:
        return "expirado"
    except jwt.InvalidTokenError:
        return "inválido"



# Rota de login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    usuario = data.get("usuario")
    senha = data.get("senha")

    user = Usuario.query.filter_by(username=usuario).first()

    if not user or not check_password_hash(user.password, senha):


        return jsonify({"error": "Credenciais inválidas"}), 401

    # 👉 Gerar token JWT
    payload = {
    "usuario": user.username,
    "exp": datetime.utcnow() + timedelta(hours=2)
    }
    
    
    token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    

    # Registrar login na trilha
    log = TrilhaAuditoria(
    usuario=user.username,
    acao="Login",
    detalhes="Usuário acessou o sistema com sucesso"
)
    db.session.add(log)
    db.session.commit()

    return jsonify({"token": token})



@app.route("/api/logout", methods=["POST"])
def logout():
    usuario = get_usuario_logado()

    if usuario in ["inválido", "expirado"]:
        return jsonify({"error": "Token inválido"}), 401

    # registrar logout na trilha
    log = TrilhaAuditoria(
        usuario=usuario,
        acao="Logout",
        detalhes="Usuário encerrou a sessão"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Logout registrado com sucesso"})


# Rota para retornar materiais
@app.route('/api/materiais')
def get_materiais():
    try:
        registros = MaterialEstoque.query.all()
        return jsonify([
            {
                "codigo": r.codigo,
                "descricao": r.descricao,
                "lote": r.lote,
                "status": r.status,
                "validade": r.validade.strftime('%Y-%m-%d')
            } for r in registros
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/materiais/<lote>/status', methods=['PUT'])
def atualizar_status(lote):
    data = request.get_json()
    novo_status = data.get("status")

    material = MaterialEstoque.query.filter_by(lote=lote).first()
    if not material:
        return jsonify({"error": "Material não encontrado"}), 404

    material.status = novo_status

    # 👉 Registrar na trilha de auditoria
    log = TrilhaAuditoria(
        usuario=get_usuario_logado(),  # futuramente pode ser dinâmico (via sessão/login)
        acao=f"Alterou status para {novo_status}",
        detalhes=f"Lote {material.lote} - {material.descricao}"
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({"success": True, "message": "Status atualizado com sucesso"})


@app.route("/api/trilha")
def trilha():
    usuario = get_usuario_logado()
    if usuario in ["expirado", "inválido"]:
        return jsonify({"error": "Não autorizado"}), 401

    registros = TrilhaAuditoria.query.order_by(TrilhaAuditoria.timestamp.desc()).all()
    return jsonify([
        {
            "usuario": r.usuario,
            "acao": r.acao,
            "detalhes": r.detalhes,
            "timestamp": r.timestamp.isoformat()
        }
        for r in registros
    ])


@app.route("/api/materiais")
def listar_materiais():
    usuario = get_usuario_logado()
    if usuario in ["expirado", "inválido"]:
        return jsonify({"error": "Não autorizado"}), 401

    materiais = MaterialEstoque.query.all()
    ...




if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
