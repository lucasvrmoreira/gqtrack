import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VantaBackground from "../components/VantaBackground";
// ou seu background animado


function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const resposta = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await resposta.json(); // 👈 define antes

      console.log("Resposta da API:", data); // 👈 agora funciona
      console.log("Token recebido:", data.token);

      if (resposta.ok && data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token salvo no localStorage!");
        navigate("/dashboard");
      } else {
        alert(data.error || "Erro ao fazer login");
      }

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro na comunicação com o servidor.");
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🌀 Fundo animado */}
      <VantaBackground />

      {/* 🔒 Caixa de login centralizada */}
      <div className="absolute inset-0 flex justify-center items-center z-10">
        <div className="backdrop-blur-md bg-white/30 border border-white/30 p-6 rounded-xl shadow-xl w-full max-w-sm">

          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Login</h2>

          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );

}

export default Login;
