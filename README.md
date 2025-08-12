🎯 GQ Track
Finalidade
Eu desenvolvi o GQ Track visando resolver um problema interno na empresa onde trabalho.
Atualmente, quando um material é aprovado pela Garantia da Qualidade (GQ), a equipe precisa colar manualmente etiquetas de “LIBERADO” em cada item do lote — um processo repetitivo, demorado e sujeito a erros.

Com o GQ Track, substituímos esse processo manual por um QR Code único para cada lote.
Quando o operador bipa o QR Code, o sistema consulta automaticamente o banco de dados do SAP, recuperando todas as informações do material e anexando o Certificado de Análise (CoA).
Assim, eliminamos a necessidade de etiquetas físicas individuais e garantimos mais agilidade, padronização e rastreabilidade.

🚀 Como Funciona
Garantia da Qualidade

Altera o status do material com 1 clique (Em análise → Liberado → Bloqueado).

Produção

Escaneia o QR Code na linha de produção.

O sistema recupera e vincula automaticamente o CoA e os dados do lote.

Rastreabilidade

Tudo é registrado na trilha de auditoria, com informações sobre quem, quando e o que foi alterado.

Integração

Conexão direta com SAP (via API ou ODBC).

Preparado para integração com outros ERPs.

✅ Benefícios
🔹 Eliminação do retrabalho com etiquetas manuais.

🔹 Agilidade e padronização na mudança de status.

🔹 Conformidade regulatória: acesso imediato ao CoA e informaçôes do lote via QR Code.

🛠 Stacks Técnicas
Backend
Python 3.12

FAST API

 DB - PostgreSQL 

SQLAlchemy (ORM)

ODBC (integração com SAP)

JWT (JSON Web Token para autenticação)

Flask-CORS (cross-origin requests)

dotenv (variáveis de ambiente)

Frontend
React + Vite

TailwindCSS 3.3

Framer Motion (animações)

Axios (requisições API)

React Router DOM (rotas)

🔒 Segurança
Autenticação JWT (controle de acesso)

Hash de senha com bcrypt

Proteção contra SQL Injection (via ORM)

.env para variáveis sensíveis

CORS restritivo

Validação de entrada no backend (Flask)

HTTPS (produção)

Trilha de auditoria (alterações e logins)

