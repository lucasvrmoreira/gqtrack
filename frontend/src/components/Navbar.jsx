import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const sair = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
        } catch (err) {
            console.error("Erro ao registrar logout:", err);
        }

        localStorage.removeItem("token");
        navigate("/");
    };



    return (
        <nav className="bg-slate-100 text-gray-800 flex items-center justify-between px-6 py-3 shadow-sm border-b border-gray-200">
            <h1 className="text-xl font-bold tracking-wide">GQTRACK</h1>

            <div className="flex gap-3 items-center">
                <button
                    onClick={() => navigate("/trilha")}
                    className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-md font-medium transition"
                >
                    Trilha de Auditoria
                </button>
                <button
                    onClick={sair}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md font-medium transition"
                >
                    Sair

                </button>
            </div>
        </nav>
    );
}

export default Navbar;
