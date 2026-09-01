import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './ProcessosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function ProcessosLista1({ api }) {
    const navigate = useNavigate();

    const API_URL =
        api || 'http://10.92.11.4:5000';

    const [processos, setProcessos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [filtroNumero, setFiltroNumero] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [modalAberto, setModalAberto] = useState(false);
    const [processoSelecionado, setProcessoSelecionado] = useState(null);

    const [editando, setEditando] = useState(false);
    const [dadosEditados, setDadosEditados] = useState({});

    const [modalInativarAberto, setModalInativarAberto] = useState(false);
    const [processoInativar, setProcessoInativar] = useState(null);

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');

        navigate('/login');
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);

        setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 5000);
    }

    async function buscarProcessos() {
        const token =
            localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(
                `${API_URL}/processos`,
                {
                    method: 'GET',
                    credentials: 'include',

                    headers: {
                        'X-Access-Token':
                        token
                    }
                }
            );

            let dados = {};

            try {
                dados =
                    await resposta.json();
            } catch {
                dados = {};
            }

            if (
                resposta.status === 401
            ) {
                deslogar();
                return;
            }

            if (!resposta.ok) {
                mostrarMensagem(
                    dados.error ||
                    'Erro ao carregar processos.'
                );

                return;
            }

            setProcessos(
                dados.processos || []
            );

        } catch (erro) {
            console.error(
                'Erro ao buscar processos:',
                erro
            );

            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );

        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarProcessos();
    }, []);

    function formatarStatus(status) {
        switch (status) {
            case 'em_andamento':
                return 'Em Andamento';

            case 'concluido':
                return 'Concluído';

            case 'suspenso':
                return 'Suspenso';

            case 'inativo':
                return 'Inativo';

            default:
                return status || '--';
        }
    }

    function nomesClientes(processo) {
        if (
            Array.isArray(
                processo.clientes
            )
        ) {
            return processo.clientes
                .map(
                    cliente =>
                        cliente.nome ||
                        cliente
                )
                .join(', ');
        }

        return (
            processo.clientes ||
            '--'
        );
    }

    function normalizarTexto(texto) {
        return (texto || '')
            .normalize('NFD')
            .replace(
                /[\u0300-\u036f]/g,
                ''
            )
            .toLowerCase()
            .trim();
    }

    function abrirModal(processo) {
        setProcessoSelecionado(
            processo
        );

        setDadosEditados({
            ...processo
        });

        setEditando(false);
        setModalAberto(true);

        setMensagem('');
        setTipoMensagem('');
    }

    function fecharModal() {
        setModalAberto(false);
        setProcessoSelecionado(null);

        setEditando(false);
        setDadosEditados({});

        setMensagem('');
        setTipoMensagem('');
    }

    function handleEditChange(e) {
        const {
            name,
            value
        } = e.target;

        setDadosEditados(
            anterior => ({
                ...anterior,
                [name]: value
            })
        );
    }

    /*
        Por enquanto essa função continua
        alterando somente o React.

        Quando criarmos a rota PUT de
        edição do processo, colocaremos
        o fetch aqui.
    */
    function handleSalvarEdicao() {
        setProcessos(
            anterior =>
                anterior.map(
                    processo =>
                        processo.id ===
                        processoSelecionado.id
                            ? {
                                ...processo,
                                ...dadosEditados
                            }
                            : processo
                )
        );

        setProcessoSelecionado(
            anterior => ({
                ...anterior,
                ...dadosEditados
            })
        );

        setEditando(false);

        mostrarMensagem(
            'Informações atualizadas com sucesso!',
            'sucesso'
        );
    }

    function cancelarEdicao() {
        setEditando(false);

        setDadosEditados(
            processoSelecionado
        );

        setMensagem('');
        setTipoMensagem('');
    }

    function abrirModalInativar(
        processo
    ) {
        setProcessoInativar(
            processo
        );

        setModalInativarAberto(
            true
        );
    }

    function fecharModalInativar() {
        setModalInativarAberto(
            false
        );

        setProcessoInativar(
            null
        );
    }

    /*
        Temporariamente altera somente
        no frontend, pois ainda não
        definimos STATUS na tabela
        PROCESSOS.
    */
    function handleInativar() {
        if (!processoInativar) {
            return;
        }

        setProcessos(
            anterior =>
                anterior.map(
                    processo =>
                        processo.id ===
                        processoInativar.id
                            ? {
                                ...processo,
                                status:
                                    'inativo'
                            }
                            : processo
                )
        );

        if (
            processoSelecionado?.id ===
            processoInativar.id
        ) {
            setProcessoSelecionado(
                anterior => ({
                    ...anterior,
                    status:
                        'inativo'
                })
            );
        }

        fecharModalInativar();

        mostrarMensagem(
            'Processo inativado com sucesso!',
            'sucesso'
        );
    }

    function handleAtivar(
        processoSelecionadoAtivar
    ) {
        setProcessos(
            anterior =>
                anterior.map(
                    processo =>
                        processo.id ===
                        processoSelecionadoAtivar.id
                            ? {
                                ...processo,
                                status:
                                    'em_andamento'
                            }
                            : processo
                )
        );

        mostrarMensagem(
            'Processo ativado com sucesso!',
            'sucesso'
        );
    }

    function irParaCadastroProcesso() {
        navigate(
            '/cadastro_processo'
        );
    }

    const processosFiltrados =
        processos.filter(
            processo => {
                const numeroMatch =
                    (
                        processo.numero ||
                        ''
                    )
                        .toLowerCase()
                        .includes(
                            filtroNumero
                                .toLowerCase()
                        );

                const statusMatch =
                    filtroStatus ===
                    'todos' ||
                    processo.status ===
                    filtroStatus;

                let tipoMatch = true;

                if (
                    filtroTipo !==
                    'todos'
                ) {
                    const areaProcesso =
                        normalizarTexto(
                            processo.tipo ||
                            processo.area
                        );

                    const filtro =
                        normalizarTexto(
                            filtroTipo
                        );

                    if (
                        filtro ===
                        'civil'
                    ) {
                        tipoMatch =
                            areaProcesso ===
                            'civil' ||
                            areaProcesso ===
                            'civel';

                    } else {
                        tipoMatch =
                            areaProcesso ===
                            filtro;
                    }
                }

                return (
                    numeroMatch &&
                    statusMatch &&
                    tipoMatch
                );
            }
        );

    return (
        <div
            className={
                css.paginaCompleta
            }
        >
            <Header
                api={API_URL}
            />

            <div
                className={
                    css.layoutDashboard
                }
            >
                <div
                    className={
                        css.menuLateralContainer
                    }
                >
                    <MenuLateralAdvogado
                        api={API_URL}
                    />
                </div>

                <div
                    className={
                        css.conteudoPrincipal
                    }
                >
                    <div
                        className={
                            css.topoSaudacao
                        }
                    >
                        <h1
                            className={
                                css.tituloPagina
                            }
                        >
                            Meus processos
                        </h1>

                        <button
                            className={
                                css.botaoAdicionar
                            }
                            onClick={
                                irParaCadastroProcesso
                            }
                            name="btn-adicionar-processo"
                            type="button"
                            title="Cadastrar processo"
                        >
                            +
                        </button>
                    </div>

                    {mensagem && (
                        <div
                            style={{
                                padding:
                                    '12px',

                                borderRadius:
                                    '8px',

                                backgroundColor:
                                    tipoMensagem ===
                                    'erro'
                                        ? '#f8d7da'
                                        : '#d4edda',

                                color:
                                    tipoMensagem ===
                                    'erro'
                                        ? '#721c24'
                                        : '#155724',

                                marginBottom:
                                    '20px',

                                textAlign:
                                    'center',

                                fontFamily:
                                    'Clear Sans, sans-serif'
                            }}
                        >
                            {mensagem}
                        </div>
                    )}

                    <div
                        className={
                            css.areaFiltros
                        }
                    >
                        <div
                            className={
                                css.buscaContainer
                            }
                        >
                            <input
                                type="text"
                                className={
                                    css.inputBusca
                                }
                                placeholder="Pesquisar por nº do processo..."
                                value={
                                    filtroNumero
                                }
                                onChange={(e) =>
                                    setFiltroNumero(
                                        e.target.value
                                    )
                                }
                                name="filtro_numero"
                            />

                            <svg
                                className={
                                    css.iconeBusca
                                }
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#ffbf00"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="8"
                                />

                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                />
                            </svg>
                        </div>

                        <div
                            className={
                                css.filtrosOpcoes
                            }
                        >
                            <select
                                className={
                                    css.selectFiltro
                                }
                                value={
                                    filtroTipo
                                }
                                onChange={(e) =>
                                    setFiltroTipo(
                                        e.target.value
                                    )
                                }
                                name="filtro_tipo"
                            >
                                <option value="todos">
                                    Filtrar por: Todos os Tipos
                                </option>

                                <option value="trabalhista">
                                    Trabalhista
                                </option>

                                <option value="civil">
                                    Civil
                                </option>

                                <option value="tributario">
                                    Tributário
                                </option>

                                <option value="familia">
                                    Família
                                </option>

                                <option value="criminal">
                                    Criminal
                                </option>
                            </select>

                            <select
                                className={
                                    css.selectFiltro
                                }
                                value={
                                    filtroStatus
                                }
                                onChange={(e) =>
                                    setFiltroStatus(
                                        e.target.value
                                    )
                                }
                                name="filtro_status"
                            >
                                <option value="todos">
                                    Filtrar por: Status
                                </option>

                                <option value="em_andamento">
                                    Em Andamento
                                </option>

                                <option value="concluido">
                                    Concluído
                                </option>

                                <option value="suspenso">
                                    Suspenso
                                </option>

                                <option value="inativo">
                                    Inativo
                                </option>
                            </select>
                        </div>
                    </div>

                    <div
                        className={
                            css.tabelaContainer
                        }
                    >
                        {carregando ? (
                            <p>
                                Carregando processos...
                            </p>

                        ) : processos.length ===
                        0 ? (
                            <p>
                                Nenhum processo encontrado.
                            </p>

                        ) : processosFiltrados.length ===
                        0 ? (
                            <p>
                                Nenhum processo encontrado com os filtros selecionados.
                            </p>

                        ) : (
                            <table
                                className={
                                    css.tabela
                                }
                            >
                                <thead>
                                <tr>
                                    <th>
                                        Nº do Processo
                                    </th>

                                    <th>
                                        Clientes
                                    </th>

                                    <th>
                                        Assunto
                                    </th>

                                    <th>
                                        Início
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th
                                        className={
                                            css.colunaAcoes
                                        }
                                    >
                                        Ações
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {processosFiltrados.map(
                                    processo => (
                                        <tr
                                            key={
                                                processo.id
                                            }
                                        >
                                            <td>
                                                <div
                                                    className={
                                                        css.colunaProcesso
                                                    }
                                                >
                                                    <svg
                                                        className={
                                                            css.iconeProcesso
                                                        }
                                                        width="22"
                                                        height="18"
                                                        viewBox="0 0 24 20"
                                                        fill="none"
                                                        stroke="#0047ab"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <rect
                                                            x="2"
                                                            y="1"
                                                            width="20"
                                                            height="13"
                                                            rx="1.5"
                                                        />

                                                        <line
                                                            x1="8"
                                                            y1="18"
                                                            x2="16"
                                                            y2="18"
                                                        />

                                                        <line
                                                            x1="12"
                                                            y1="14"
                                                            x2="12"
                                                            y2="18"
                                                        />
                                                    </svg>

                                                    <span>
                                                            {
                                                                processo.numero
                                                            }
                                                        </span>
                                                </div>
                                            </td>

                                            <td>
                                                {nomesClientes(
                                                    processo
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    processo.assunto ||
                                                    '--'
                                                }
                                            </td>

                                            <td>
                                                {
                                                    processo.data_inicio ||
                                                    '--'
                                                }
                                            </td>

                                            <td>
                                                    <span
                                                        className={
                                                            `${css.statusBadge} ${
                                                                css[
                                                                    processo.status
                                                                    ] ||
                                                                ''
                                                            }`
                                                        }
                                                    >
                                                        {formatarStatus(
                                                            processo.status
                                                        )}
                                                    </span>
                                            </td>

                                            <td
                                                className={
                                                    css.colunaAcoes
                                                }
                                            >
                                                <button
                                                    className={
                                                        css.botaoVer
                                                    }
                                                    onClick={() =>
                                                        abrirModal(
                                                            processo
                                                        )
                                                    }
                                                    name={
                                                        `btn-ver-${processo.id}`
                                                    }
                                                    type="button"
                                                >
                                                    Ver
                                                </button>

                                                {processo.status ===
                                                'inativo' ? (
                                                    <button
                                                        className={
                                                            css.botaoAtivar
                                                        }
                                                        onClick={() =>
                                                            handleAtivar(
                                                                processo
                                                            )
                                                        }
                                                        name={
                                                            `btn-ativar-${processo.id}`
                                                        }
                                                        type="button"
                                                    >
                                                        Ativar
                                                    </button>

                                                ) : (
                                                    <button
                                                        className={
                                                            css.botaoInativar
                                                        }
                                                        onClick={() =>
                                                            abrirModalInativar(
                                                                processo
                                                            )
                                                        }
                                                        name={
                                                            `btn-inativar-${processo.id}`
                                                        }
                                                        type="button"
                                                    >
                                                        Inativar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {modalAberto &&
                processoSelecionado && (
                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={(e) => {
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                fecharModal();
                            }
                        }}
                    >
                        <div
                            className={
                                css.modalContainer
                            }
                        >
                            <div
                                className={
                                    css.modalHeader
                                }
                            >
                                <h2
                                    className={
                                        css.modalTitulo
                                    }
                                >
                                    Processo{' '}
                                    {
                                        processoSelecionado.numero
                                    }
                                </h2>

                                <button
                                    className={
                                        css.modalFechar
                                    }
                                    onClick={
                                        fecharModal
                                    }
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>

                            <div
                                className={
                                    css.modalBody
                                }
                            >
                                {mensagem && (
                                    <div
                                        className={
                                            `${css.mensagemContainer} ${
                                                tipoMensagem ===
                                                'sucesso'
                                                    ? css.sucesso
                                                    : css.erro
                                            }`
                                        }
                                    >
                                        {mensagem}
                                    </div>
                                )}

                                <form
                                    className={
                                        css.formulario
                                    }
                                    onSubmit={(e) =>
                                        e.preventDefault()
                                    }
                                >
                                    <div
                                        className={
                                            css.secaoTitulo
                                        }
                                    >
                                        <h3
                                            className={
                                                css.secaoSubtitulo
                                            }
                                        >
                                            Dados do Processo
                                        </h3>
                                    </div>

                                    <div
                                        className={
                                            css.linha
                                        }
                                    >
                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Nº do processo
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.numero ||
                                                    '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Cliente(s)
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    nomesClientes(
                                                        processoSelecionado
                                                    )
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Tipo do processo
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.tipo_processo ||
                                                    '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Assunto
                                            </label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="assunto"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        dadosEditados.assunto ||
                                                        ''
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    maxLength={
                                                        254
                                                    }
                                                />

                                            ) : (
                                                <input
                                                    type="text"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        processoSelecionado.assunto ||
                                                        '--'
                                                    }
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Área
                                            </label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="area"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        dadosEditados.area ||
                                                        dadosEditados.tipo ||
                                                        ''
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    maxLength={
                                                        50
                                                    }
                                                />

                                            ) : (
                                                <input
                                                    type="text"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        processoSelecionado.area ||
                                                        processoSelecionado.tipo ||
                                                        '--'
                                                    }
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Comarca
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.comarca ||
                                                    '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Vara
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.vara ||
                                                    '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Instância
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.instancia
                                                        ? `${processoSelecionado.instancia}ª instância`
                                                        : '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Advogado responsável
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    processoSelecionado.advogado_responsavel ||
                                                    '--'
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Data de início
                                            </label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="data_inicio"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        dadosEditados.data_inicio ||
                                                        ''
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    maxLength={
                                                        10
                                                    }
                                                />

                                            ) : (
                                                <input
                                                    type="text"
                                                    className={
                                                        css.input
                                                    }
                                                    value={
                                                        processoSelecionado.data_inicio ||
                                                        '--'
                                                    }
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div
                                            className={
                                                css.campoMetade
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Status
                                            </label>

                                            <input
                                                type="text"
                                                className={
                                                    css.input
                                                }
                                                value={
                                                    formatarStatus(
                                                        processoSelecionado.status
                                                    )
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div
                                            className={
                                                css.campoInteiro
                                            }
                                        >
                                            <label
                                                className={
                                                    css.label
                                                }
                                            >
                                                Descrição
                                            </label>

                                            {editando ? (
                                                <textarea
                                                    name="descricao"
                                                    className={
                                                        css.textarea
                                                    }
                                                    value={
                                                        dadosEditados.descricao ||
                                                        ''
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    maxLength={
                                                        1000
                                                    }
                                                />

                                            ) : (
                                                <textarea
                                                    className={
                                                        css.textarea
                                                    }
                                                    value={
                                                        processoSelecionado.descricao ||
                                                        '--'
                                                    }
                                                    readOnly
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            css.campoInteiro
                                        }
                                        style={{
                                            marginTop:
                                                '0.5rem'
                                        }}
                                    >
                                        <p
                                            className={
                                                css.obsCampos
                                            }
                                        >
                                            * Campos editáveis
                                        </p>
                                    </div>

                                    <div
                                        className={
                                            css.botaoContainer
                                        }
                                    >
                                        {editando ? (
                                            <>
                                                <button
                                                    className={
                                                        css.botaoCadastro
                                                    }
                                                    type="button"
                                                    onClick={
                                                        handleSalvarEdicao
                                                    }
                                                >
                                                    Atualizar Informações
                                                </button>

                                                <button
                                                    className={
                                                        css.botaoCancelar
                                                    }
                                                    type="button"
                                                    onClick={
                                                        cancelarEdicao
                                                    }
                                                >
                                                    Cancelar
                                                </button>
                                            </>

                                        ) : (
                                            <button
                                                className={
                                                    css.botaoEditar
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setEditando(
                                                        true
                                                    )
                                                }
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            {modalInativarAberto &&
                processoInativar && (
                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={(e) => {
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                fecharModalInativar();
                            }
                        }}
                    >
                        <div
                            className={
                                css.modalInativacao
                            }
                        >
                            <button
                                className={
                                    css.modalFecharIconeLeft
                                }
                                onClick={
                                    fecharModalInativar
                                }
                                type="button"
                            >
                                X
                            </button>

                            <h2
                                className={
                                    css.tituloInativacao
                                }
                            >
                                Certeza que gostaria de
                                <br />
                                inativar?
                            </h2>

                            <p
                                className={
                                    css.subtituloInativacao
                                }
                            >
                                Confirme para inativar o processo.
                            </p>

                            <div
                                className={
                                    css.botoesInativacao
                                }
                            >
                                <button
                                    className={
                                        css.btnCancelarInativacao
                                    }
                                    onClick={
                                        fecharModalInativar
                                    }
                                    type="button"
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={
                                        css.btnConfirmarInativacao
                                    }
                                    onClick={
                                        handleInativar
                                    }
                                    type="button"
                                >
                                    Inativar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            <Footer />
        </div>
    );
}