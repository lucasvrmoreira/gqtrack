import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrilhaAuditoria from "./pages/TrilhaAuditoria";
import RotaProtegida from "./components/RotaProtegida";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/trilha"
          element={
            <RotaProtegida>
              <TrilhaAuditoria />
            </RotaProtegida>
          }
        />
      </Routes>

      {/* container das notificações */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App;
