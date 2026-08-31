import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import DashboardAdvogado from "./pages/DashboardAdvogado.jsx";
import EditarPerfilAdvogado from "./pages/EditarPerfilAdvogado.jsx";
import CadastroEscritorio from "./pages/CadastroEscritorio.jsx";
import DashboardEscritorio from "./pages/DashboardEscritorio.jsx";
import ClientesLista from "./pages/ClientesLista.jsx";
import CadastroClienteFisico from "./pages/CadastroClienteFisico.jsx";
import CadastroClienteJuridico from "./pages/CadastroClienteJuridico.jsx";
import CadastroRepresentante from "./pages/CadastroRepresentante.jsx";
import EditarPerfilEscritorio from "./pages/EditarPerfilEscritorio.jsx";
import AdvogadosLista from "./pages/AdvogadosLista";
import CadastroProcesso from "./pages/CadastroProcesso.jsx";



const API_URL = 'http://10.92.11.4:5000';

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
                <Route path="/escritorio/:id" element={<DashboardEscritorio api={API_URL} />} />
                <Route path="/clientes" element={<ClientesLista api={API_URL} />} />
                <Route path="/cadastro_cliente_fisico" element={<CadastroClienteFisico api={API_URL} />} />
                <Route path="/cadastro_cliente_juridico" element={<CadastroClienteJuridico api={API_URL} />} />
                <Route path="/cadastro-representante/:idCliente?" element={<CadastroRepresentante api={API_URL} />} />
                <Route path="/editar_perfil_escritorio" element={<EditarPerfilEscritorio api={API_URL} />} />
                <Route path="/advogados" element={<AdvogadosLista api={API_URL} />} />
                <Route path="/cadastro_processo" element={<CadastroProcesso api={API_URL} />} />
            </Routes>
        </Router>
    )
}

export default App;