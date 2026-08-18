import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import DashboardAdvogado from "./pages/DashboardAdvogado.jsx";
import EditarPerfilAdvogado from "./pages/EditarPerfilAdvogado.jsx";
import CadastroEscritorio from "./pages/CadastroEscritorio.jsx";
import DashboardEscritorio from "./pages/DashboardEscritorio.jsx";


const API_URL = 'http://10.92.11.35:5000';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home api={API_URL} />} />
                <Route path="/cadastro" element={<Cadastro api={API_URL} />} />
                <Route path="/login" element={<Login api={API_URL} />} />
                <Route path="/dashboard_advogado" element={<DashboardAdvogado api={API_URL} />} />
                <Route path="/editar_perfil_advogado" element={<EditarPerfilAdvogado api={API_URL} />} />
                <Route path="/cadastro_escritorio" element={<CadastroEscritorio api={API_URL} />} />
                <Route path="/dashboard_escritorio" element={<DashboardEscritorio api={API_URL} />} />
            </Routes>
        </Router>
    );
}

export default App;