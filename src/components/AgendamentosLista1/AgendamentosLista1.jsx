import React, { useState } from 'react';
import css from './AgendamentosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import {useNavigate} from "react-router-dom";

export default function AgendamentosLista1({ api }) {

    const API_URL = api || 'http://localhost:5000';

    const navigate = useNavigate()

    const [dataInicio, setDataInicio] = useState('2026-07-27');
    const [dataFim, setDataFim] = useState('2026-08-02');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const [modalTipo, setModalTipo] = useState('');
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
    const [motivo, setMotivo] = useState('');

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

    function enviarMotivo(e) {
        e.preventDefault();
    }

    const [agendamentos] = useState([
        {
            id: 1,
            dia: '12',
            mes: 'SET',
            cliente: 'Maria da Silva',
            tipo: 'Consulta Inicial',
            horario: '09:00',
            duracao: '1h',
            status: 'a_confirmar'
        },
        {
            id: 2,
            dia: '12',
            mes: 'SET',
            cliente: 'Júlia da Silva',
            tipo: 'Consulta Inicial',
            horario: '09:00',
            duracao: '1h',
            status: 'confirmado'
        }
    ]);

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
                                <span>De</span>

                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) =>
                                        setDataInicio(e.target.value)
                                    }
                                />
                            </div>

                            <span className={css.ate}>
                                até
                            </span>

                            <div className={css.campoData}>
                                <span>Até</span>

                                <input
                                    type="date"
                                    value={dataFim}
                                    min={dataInicio}
                                    onChange={(e) =>
                                        setDataFim(e.target.value)
                                    }
                                />
                            </div>

                        </div>

                        <select
                            className={css.selectFiltro}
                            value={filtroStatus}
                            onChange={(e) =>
                                setFiltroStatus(e.target.value)
                            }
                        >
                            <option value="todos">
                                Filtrar por: Status
                            </option>

                            <option value="a_confirmar">
                                A confirmar
                            </option>

                            <option value="confirmado">
                                Confirmado
                            </option>
                        </select>

                    </div>


                    <div className={css.listaAgendamentos}>

                        {agendamentos.map((agendamento) => (

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
                                            {agendamento.tipo}
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

                                        <span
                                            className={
                                                agendamento.status === 'confirmado'
                                                    ? css.statusConfirmado
                                                    : css.statusConfirmar
                                            }
                                        >
                                            {agendamento.status === 'confirmado'
                                                ? 'Confirmado'
                                                : 'A confirmar'}
                                        </span>

                                    </div>


                                    <div className={css.acoes}>

                                        {agendamento.status === 'a_confirmar' ? (
                                            <>
                                                <button
                                                    className={css.botaoAzul}
                                                    type="button"
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
                                        ) : (
                                            <>
                                                <button
                                                    className={css.botaoAzul}
                                                    type="button"
                                                    onClick={() => navigate('/reagendar')}
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
                        ))}

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
                                    />
                                </div>

                            </div>

                            <div className={css.helpText}>
                                <p>* Campos obrigatórios</p>
                            </div>

                            <button
                                type="submit"
                                className={css.addButton}
                            >
                                {modalTipo === 'recusar'
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