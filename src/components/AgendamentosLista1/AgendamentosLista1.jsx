import React, { useState, useEffect } from 'react';
import css from './AgendamentosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import { useNavigate } from "react-router-dom";

export default function AgendamentosLista1({ api }) {

    const API_URL = api || ' http://192.168.0.131:5000';
    const navigate = useNavigate();

    const [agendamentos, setAgendamentos] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const [modalTipo, setModalTipo] = useState('');
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');
        navigate('/login');
    }

    function abrirModal(tipo, agendamento) {
        setModalTipo(tipo);
        setAgendamentoSelecionado(agendamento);
        setMotivo('');
    }

    function fecharModal() {
        setModalTipo('');
        setAgendamentoSelecionado(null);
        setMotivo('');
    }

    async function buscarAgendamentos() {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setCarregando(true);

        try {
            const params = new URLSearchParams();

            if (dataInicio) params.append('data_inicio', dataInicio);
            if (dataFim) params.append('data_fim', dataFim);
            if (filtroStatus && filtroStatus !== 'todos') params.append('status', filtroStatus);

            const url = `${API_URL}/agendamentos${params.toString() ? '?' + params.toString() : ''}`;

            const resposta = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let dados = {};
            try {
                dados = await resposta.json();
            } catch {
                dados = {};
            }

            if (resposta.status === 401) {
                deslogar();
                return;
            }

            if (!resposta.ok) {
                return;
            }

            setAgendamentos(dados.agendamentos || []);

        } catch (erro) {
            console.error('Erro ao buscar agendamentos:', erro);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        buscarAgendamentos();
    }, [dataInicio, dataFim, filtroStatus]);

    async function confirmarAgendamento(agendamento) {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/agendamento/${agendamento.id}/confirmar`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (resposta.status === 401) {
                deslogar();
                return;
            }

            await buscarAgendamentos();

        } catch (erro) {
            console.error('Erro ao confirmar agendamento:', erro);
        }
    }

    async function enviarMotivo(e) {
        e.preventDefault();

        if (!motivo.trim() || !agendamentoSelecionado) return;

        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setEnviando(true);

        const url = modalTipo === 'recusar'
            ? `${API_URL}/agendamento/${agendamentoSelecionado.id}/recusar`
            : `${API_URL}/agendamento/${agendamentoSelecionado.id}/cancelar`;

        try {
            const resposta = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({ motivo: motivo.trim() })
            });

            let dados = {};
            try {
                dados = await resposta.json();
            } catch {
                dados = {};
            }

            if (resposta.status === 401) {
                deslogar();
                return;
            }

            if (!resposta.ok) {
                console.error(dados.error || 'Erro ao processar ação.');
                return;
            }

            fecharModal();
            await buscarAgendamentos();

        } catch (erro) {
            console.error('Erro ao enviar motivo:', erro);
        } finally {
            setEnviando(false);
        }
    }

    function formatarStatus(status) {
        const mapa = {
            'a_confirmar': 'A confirmar',
            'confirmado': 'Confirmado',
            'cancelado': 'Desmarcado',
            'recusado': 'Recusado'
        };

        return mapa[status] || status;
    }

    function classeStatus(status) {
        if (status === 'confirmado') return css.statusConfirmado;
        if (status === 'a_confirmar') return css.statusConfirmar;
        if (status === 'recusado') return css.statusRecusado;
        if (status === 'cancelado') return css.statusDesmarcado;
        return '';
    }

    return (
        <div className={css.paginaCompleta}>

            <Header api={API_URL} />

            <div className={css.layoutDashboard}>

                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>

                    <div className={css.topoPagina}>

                        <h1 className={css.tituloPagina}>
                            Meus agendamentos
                        </h1>

                        <button
                            className={css.botaoAdicionar}
                            type="button"
                            onClick={() => navigate('/agendar')}
                        >
                            +
                        </button>

                    </div>

                    <div className={css.areaFiltros}>

                        <div className={css.filtroDatas}>

                            <div className={css.campoData}>

                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                            </div>

                            <span className={css.ate}>
                                até
                            </span>

                            <div className={css.campoData}>


                                <input
                                    type="date"
                                    value={dataFim}
                                    min={dataInicio}
                                    onChange={(e) => setDataFim(e.target.value)}
                                />
                            </div>

                        </div>

                        <select
                            className={css.selectFiltro}
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="todos">Filtrar por: Status</option>
                            <option value="a_confirmar">A confirmar</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Desmarcado</option>
                            <option value="recusado">Recusado</option>
                        </select>

                    </div>

                    <div className={css.listaAgendamentos}>

                        {carregando ? (
                            <p>Carregando agendamentos...</p>
                        ) : agendamentos.length === 0 ? (
                            <p>Nenhum agendamento encontrado.</p>
                        ) : (
                            agendamentos.map((agendamento) => (

                                <div
                                    key={agendamento.id}
                                    className={css.cardAgendamento}
                                >

                                    <div className={css.dataAgendamento}>
                                        <span className={css.dia}>
                                            {agendamento.dia}
                                        </span>

                                        <span className={css.mes}>
                                            {agendamento.mes}
                                        </span>
                                    </div>

                                    <div className={css.dadosAgendamento}>

                                        <div className={css.infoCliente}>
                                            <strong>
                                                {agendamento.cliente}
                                            </strong>

                                            <span>
                                                {agendamento.assunto}
                                            </span>
                                        </div>

                                        <div className={css.infoHorario}>
                                            <strong>
                                                Horário: {agendamento.horario}
                                            </strong>

                                            <span>
                                                Duração: {agendamento.duracao}
                                            </span>
                                        </div>

                                        <div className={css.statusContainer}>
                                            <span className={classeStatus(agendamento.status)}>
                                                {formatarStatus(agendamento.status)}
                                            </span>
                                        </div>

                                        <div className={css.acoes}>

                                            {agendamento.status === 'a_confirmar' && (
                                                <>
                                                    <button
                                                        className={css.botaoAzul}
                                                        type="button"
                                                        onClick={() => confirmarAgendamento(agendamento)}
                                                    >
                                                        Confirmar
                                                    </button>

                                                    <button
                                                        className={css.botaoVermelho}
                                                        type="button"
                                                        onClick={() => abrirModal('recusar', agendamento)}
                                                    >
                                                        Recusar
                                                    </button>
                                                </>
                                            )}

                                            {agendamento.status === 'confirmado' && (
                                                <>
                                                    <button
                                                        className={css.botaoAzul}
                                                        type="button"
                                                        onClick={() => navigate('/reagendar', { state: { agendamento } })}
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        className={css.botaoVermelho}
                                                        type="button"
                                                        onClick={() => abrirModal('desmarcar', agendamento)}
                                                    >
                                                        Desmarcar
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            ))
                        )}

                    </div>

                </div>

            </div>

            {modalTipo && (
                <div
                    className={css.overlay}
                    onClick={fecharModal}
                >
                    <div
                        className={css.modal}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            type="button"
                            className={css.closeButton}
                            onClick={fecharModal}
                            aria-label="Fechar"
                        >
                            ×
                        </button>

                        <h1 className={css.titulo}>
                            {modalTipo === 'recusar'
                                ? 'Recusar agendamento'
                                : 'Desmarcar agendamento'}
                        </h1>

                        <form onSubmit={enviarMotivo}>

                            <div className={css.formFieldsModal}>

                                <div className={css.formGroup}>
                                    <label htmlFor="motivo">
                                        Motivo *
                                    </label>

                                    <textarea
                                        id="motivo"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        placeholder="Digite o motivo"
                                        required
                                        disabled={enviando}
                                    />
                                </div>

                            </div>

                            <div className={css.helpText}>
                                <p>* Campos obrigatórios</p>
                            </div>

                            <button
                                type="submit"
                                className={css.addButton}
                                disabled={enviando}
                            >
                                {enviando
                                    ? 'Enviando...'
                                    : modalTipo === 'recusar'
                                        ? 'Recusar'
                                        : 'Desmarcar'}
                            </button>

                        </form>

                    </div>
                </div>
            )}

            <Footer />

        </div>
    );
}