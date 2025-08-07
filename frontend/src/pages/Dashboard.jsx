import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/button";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";


function Dashboard() {
  const [materiais, setMateriais] = useState([]);
  const [alterandoLote, setAlterandoLote] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/api/materiais`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setMateriais(data))
      .catch((err) => console.error("Erro ao carregar materiais:", err));
  }, []);

  const alterarStatus = async (lote, statusAtual) => {
    const novoStatus = statusAtual === "Liberado" ? "Bloqueado" : "Liberado";
    setAlterandoLote(lote);

    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/api/materiais/${lote}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status: novoStatus }),
    });


    if (resposta.ok) {
      setMateriais((prev) =>
        prev.map((m) =>
          m.lote === lote ? { ...m, status: novoStatus } : m
        )
      );
    } else {
      alert("Erro ao atualizar status.");
    }

    setTimeout(() => setAlterandoLote(null), 600);
  };

  const materiaisFiltrados = materiais.filter((mat) =>
    (mat.codigo + mat.descricao + mat.lote)
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <span className="text-5xl">📦</span> Materiais em Estoque
      </main>

      <input
        type="text"
        placeholder="Buscar por código, descrição ou lote..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full max-w-md px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
      />

      {materiais.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-purple-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-200 text-gray-700 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-2 font-semibold">Código</th>
                <th className="px-4 py-2 font-semibold">Descrição</th>
                <th className="px-4 py-2 font-semibold">Lote</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Validade</th>
                <th className="px-4 py-2 font-semibold text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {materiaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400 italic">
                    Nenhum material encontrado.
                  </td>
                </tr>
              ) : (
                materiaisFiltrados.map((mat) => (
                  <motion.tr
                    key={mat.lote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-gray-200 hover:bg-slate-100 transition"
                  >
                    <td className="px-4 py-3 text-sm">{mat.codigo}</td>
                    <td className="px-4 py-3 text-sm">{mat.descricao}</td>
                    <td className="px-4 py-3 text-sm">{mat.lote}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${mat.status === "Liberado"
                            ? "bg-green-100 text-green-700"
                            : mat.status === "Bloqueado"
                              ? "bg-red-100 text-red-700"
                              : mat.status === "Quarentena"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {mat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(mat.validade).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => alterarStatus(mat.lote, mat.status)}
                        disabled={alterandoLote === mat.lote}
                        className="flex items-center gap-2"
                      >
                        <Settings
                          className={`w-4 h-4 ${alterandoLote === mat.lote ? "animate-spin" : ""}`}
                        />
                        {alterandoLote === mat.lote ? "Alterando..." : "Alterar"}
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
