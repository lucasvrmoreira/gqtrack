// src/pages/TrilhaAuditoria.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function TrilhaAuditoria() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/trilha", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegistros(data);
        } else {
          console.error("Resposta inválida:", data);
          setRegistros([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar trilha:", err);
        setRegistros([]);
      });
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">📑 Trilha de Auditoria</h1>

        {registros.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum registro encontrado.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-200 text-gray-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-2">Usuário</th>
                  <th className="px-4 py-2">Ação</th>
                  <th className="px-4 py-2">Data/Hora</th>
                  <th className="px-4 py-2">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-slate-100 transition"
                  >
                    <td className="px-4 py-2">{log.usuario}</td>
                    <td className="px-4 py-2">{log.acao}</td>
                    <td className="px-4 py-2">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {log.detalhes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default TrilhaAuditoria;
