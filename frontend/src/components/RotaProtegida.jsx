import * as jwtDecode from "jwt-decode";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  const [autorizado, setAutorizado] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.warning("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      setAutorizado(false);
      return;
    }

    try {
      const decoded = jwtDecode.jwtDecode(token); // 👈 aqui está a chave
      const agora = Math.floor(Date.now() / 1000);

      if (decoded.exp < agora) {
        toast.warning("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token");
        setAutorizado(false);
      } else {
        setAutorizado(true);
      }
    } catch (err) {
      toast.error("Token inválido. Faça login novamente.");
      localStorage.removeItem("token");
      setAutorizado(false);
    }
  }, [token]);

  if (autorizado === null) return null;
  if (autorizado === false) return <Navigate to="/" replace />;
  return children;
}

export default RotaProtegida;
