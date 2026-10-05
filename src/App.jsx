import { useEffect, useState } from 'react';
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
import ProcessosLista from "./pages/ProcessosLista.jsx";
import CadastroProcessoPagamento from "./pages/CadastroProcessoPagamento.jsx";
import CadastroParteContrariaFisica from "./pages/CadastroParteContrariaFisica.jsx";
import CadastroParteContrariaJuridica from "./pages/CadastroParteContrariaJuridica.jsx";
import PagamentosLista from "./pages/PagamentosLista.jsx";
import AgendamentosLista from "./pages/AgendamentosLista.jsx";
import Agendar from "./pages/Agendar.jsx";
import Reagendar from "./pages/Reagendar.jsx";
import LogsAuditoria from "./pages/LogsAuditoria.jsx";
import ChatVeritas from './components/ChatVeritas/ChatVeritas.jsx';





const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
    const [chatVeritasAberto, setChatVeritasAberto] = useState(false);

    useEffect(() => {
        const abrirChat = () => setChatVeritasAberto(true);
        window.addEventListener('veritas:abrir', abrirChat);

        return () => window.removeEventListener('veritas:abrir', abrirChat);
    }, []);

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
                <Route path="/processos" element={<ProcessosLista api={API_URL} />} />
                <Route path="/cadastro_processo_pagamento" element={<CadastroProcessoPagamento api={API_URL} />} />
                <Route path="/cadastro_parte_contraria_fisica" element={<CadastroParteContrariaFisica api={API_URL} />} />
                <Route path="/cadastro_parte_contraria_juridica" element={<CadastroParteContrariaJuridica api={API_URL} />} />
                <Route path="/pagamentos_lista" element={<PagamentosLista api={API_URL} />} />
                <Route path="/agendamentos" element={<AgendamentosLista api={API_URL} />} />
                <Route path="/agendar" element={<Agendar api={API_URL} />} />
                <Route path="/reagendar" element={<Reagendar api={API_URL} />} />
                <Route path="/auditoria" element={<LogsAuditoria api={API_URL} />} />
            </Routes>
            <ChatVeritas
                aberto={chatVeritasAberto}
                onFechar={() => setChatVeritasAberto(false)}
                api={API_URL}
            />
        </Router>
    )
}

export default App;
