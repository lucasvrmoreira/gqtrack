import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VantaBackground from "../components/VantaBackground";

// ⬇️ ADIÇÃO 1: imports do Lottie e da animação
import Lottie from "lottie-react";
import cosmos from "../assets/Cosmos.json";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  // ⬇️ ADIÇÃO 2: estado de loading
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return;         // evita clique duplo
    setLoading(true);            // ⬅️ liga o loading
    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await resposta.json();

      if (resposta.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert(data.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);         // ⬅️ desliga o loading, dê o que der
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

          {/* ⬇️ ADIÇÃO 3: botão com loading e Lottie */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-6 h-6">
                  <Lottie animationData={cosmos} loop autoplay />
                </div>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
