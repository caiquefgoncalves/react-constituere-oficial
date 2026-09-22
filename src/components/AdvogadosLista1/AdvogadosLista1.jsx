import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './AdvogadosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function AdvogadosLista1({ api }) {
    const navigate = useNavigate();

    const API_URL = api || 'http://10.92.11.30:5000';

    const [advogados, setAdvogados] = useState([]);
    const [escritorios, setEscritorios] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [quantidade, setQuantidade] = useState(0);

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroEscritorio, setFiltroEscritorio] = useState('todos');
    const [filtroCargo, setFiltroCargo] = useState('todos');

    const [carregando, setCarregando] = useState(true);
    const [carregandoAcao, setCarregandoAcao] = useState(false);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const estatisticasRef = useRef(null);
    const [paginaEstatisticas, setPaginaEstatisticas] = useState(0);

    const [modalRetirarAberto, setModalRetirarAberto] = useState(false);
    const [dadosRetirar, setDadosRetirar] = useState(null);

    const [modalInativarAberto, setModalInativarAberto] = useState(false);
    const [dadosInativar, setDadosInativar] = useState(null);

    const [modalAtivarAberto, setModalAtivarAberto] = useState(false);
    const [dadosAtivar, setDadosAtivar] = useState(null);

    const [modalAlterarCargoAberto, setModalAlterarCargoAberto] = useState(false);
    const [dadosAlterarCargo, setDadosAlterarCargo] = useState(null);
    const [menuColapsado, setMenuColapsado] = useState(false);


    function mostrarMensagem(texto, tipo = 'sucesso') {
        setMensagem(texto);
        setTipoMensagem(tipo);

        setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 3000);
    }



    useEffect(() => {
        function aplicarEstadoMenu(e) {
            const colapsado = e?.detail?.colapsado ?? false;
            setMenuColapsado(colapsado);
        }

        aplicarEstadoMenu({
            detail: {
                colapsado: localStorage.getItem('menu_colapsado') === 'true'
            }
        });

        window.addEventListener('menu-lateral-toggle', aplicarEstadoMenu);

        return () => {
            window.removeEventListener('menu-lateral-toggle', aplicarEstadoMenu);
        };
    }, []);


    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');

        navigate('/login');
    }

    function vinculoAtivo(valor) {
        return (
            valor === true ||
            valor === 1 ||
            valor === '1'
        );
    }

    async function lerResposta(response) {
        const contentType =
            response.headers.get('content-type');

        if (
            contentType &&
            contentType.includes('application/json')
        ) {
            return await response.json();
        }

        const texto = await response.text();

        console.error(
            'Resposta não JSON:',
            texto
        );

        return {
            error: 'O servidor retornou uma resposta inválida.'
        };
    }

    async function buscarEscritorios() {
        try {
            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/filtro_escritorios_advogados`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            const data =
                await lerResposta(response);

            if (response.ok) {
                setEscritorios(
                    data.escritorios || []
                );

                return;
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao carregar escritórios.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão ao carregar escritórios.',
                'erro'
            );
        }
    }

    async function buscarCargos() {
        try {
            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/filtro_cargos_advogados`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            const data =
                await lerResposta(response);

            if (response.ok) {
                setCargos(
                    data.cargos || []
                );

                return;
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao carregar cargos.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão ao carregar cargos.',
                'erro'
            );
        }
    }

    async function buscarAdvogados() {
        try {
            setCarregando(true);

            const token =
                localStorage.getItem('token');

            const parametros =
                new URLSearchParams();

            if (
                filtroEscritorio !== 'todos'
            ) {
                parametros.append(
                    'id_escritorio',
                    filtroEscritorio
                );
            }

            if (
                filtroCargo !== 'todos'
            ) {
                parametros.append(
                    'status',
                    filtroCargo
                );
            }

            let url =
                `${API_URL}/listar_advogados`;

            if (
                parametros.toString()
            ) {
                url +=
                    `?${parametros.toString()}`;
            }

            const response = await fetch(
                url,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            const data =
                await lerResposta(response);

            if (response.ok) {
                setAdvogados(
                    data.advogados || []
                );

                setQuantidade(
                    data.quantidade || 0
                );

                return;
            }

            if (
                response.status === 401
            ) {
                deslogar();
                return;
            }

            setAdvogados([]);
            setQuantidade(0);

            mostrarMensagem(
                data.error ||
                'Erro ao carregar advogados.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            setAdvogados([]);
            setQuantidade(0);

            mostrarMensagem(
                'Erro de conexão com o servidor.',
                'erro'
            );

        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const token =
            localStorage.getItem('token');

        const tipo =
            localStorage.getItem('tipo');

        if (
            !token ||
            tipo === null
        ) {
            navigate('/login');
            return;
        }

        buscarEscritorios();
        buscarCargos();

    }, [API_URL, navigate]);

    useEffect(() => {
        const token =
            localStorage.getItem('token');

        if (!token) {
            return;
        }

        buscarAdvogados();

    }, [
        API_URL,
        filtroEscritorio,
        filtroCargo
    ]);

    useEffect(() => {
        function ajustarCarrossel() {
            if (
                window.innerWidth > 426
            ) {
                setPaginaEstatisticas(0);

                if (
                    estatisticasRef.current
                ) {
                    estatisticasRef.current.scrollTo({
                        left: 0,
                        behavior: 'auto'
                    });
                }
            }
        }

        window.addEventListener(
            'resize',
            ajustarCarrossel
        );

        return () => {
            window.removeEventListener(
                'resize',
                ajustarCarrossel
            );
        };
    }, []);

    function abrirModalAlterarCargo(
        idAdvogado,
        idEscritorio,
        nomeAdvogado,
        nomeEscritorio,
        novoStatus
    ) {
        setDadosAlterarCargo({
            idAdvogado,
            idEscritorio,
            nomeAdvogado,
            nomeEscritorio,
            novoStatus
        });

        setModalAlterarCargoAberto(true);
    }

    function fecharModalAlterarCargo() {
        setModalAlterarCargoAberto(false);
        setDadosAlterarCargo(null);
    }

    async function confirmarAlterarCargo() {
        if (!dadosAlterarCargo) {
            return;
        }

        try {
            setCarregandoAcao(true);

            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/alterar_cargo_advogado/${dadosAlterarCargo.idAdvogado}/${dadosAlterarCargo.idEscritorio}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type':
                            'application/json',

                        'X-Access-Token':
                        token
                    },

                    body: JSON.stringify({
                        status:
                        dadosAlterarCargo.novoStatus
                    })
                }
            );

            const data =
                await lerResposta(response);

            console.log(
                'ALTERAR CARGO:',
                response.status,
                data
            );

            if (response.ok) {
                mostrarMensagem(
                    data.mensagem ||
                    'Cargo alterado com sucesso!',
                    'sucesso'
                );

                fecharModalAlterarCargo();

                await buscarAdvogados();

                return;
            }

            if (
                response.status === 401
            ) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao alterar cargo.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão com o servidor.',
                'erro'
            );

        } finally {
            setCarregandoAcao(false);
        }
    }

    function abrirModalRetirar(
        idAdvogado,
        idEscritorio,
        nomeAdvogado,
        nomeEscritorio
    ) {
        setDadosRetirar({
            idAdvogado,
            idEscritorio,
            nomeAdvogado,
            nomeEscritorio
        });

        setModalRetirarAberto(true);
    }

    function fecharModalRetirar() {
        setModalRetirarAberto(false);
        setDadosRetirar(null);
    }

    async function confirmarRetirar() {
        if (!dadosRetirar) {
            return;
        }

        try {
            setCarregandoAcao(true);

            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/advogado_escritorio/${dadosRetirar.idAdvogado}/${dadosRetirar.idEscritorio}`,
                {
                    method: 'DELETE',
                    credentials: 'include',

                    headers: {
                        'X-Access-Token':
                        token
                    }
                }
            );

            const data =
                await lerResposta(response);

            console.log(
                'RETIRAR:',
                response.status,
                data
            );

            if (response.ok) {
                mostrarMensagem(
                    data.mensagem ||
                    'Advogado retirado do escritório com sucesso!',
                    'sucesso'
                );

                fecharModalRetirar();

                await buscarAdvogados();

                return;
            }

            if (
                response.status === 401
            ) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao retirar advogado do escritório.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão com o servidor.',
                'erro'
            );

        } finally {
            setCarregandoAcao(false);
        }
    }

    function abrirModalInativar(
        idAdvogado,
        idEscritorio,
        nomeAdvogado,
        nomeEscritorio
    ) {
        setDadosInativar({
            idAdvogado,
            idEscritorio,
            nomeAdvogado,
            nomeEscritorio
        });

        setModalInativarAberto(true);
    }

    function fecharModalInativar() {
        setModalInativarAberto(false);
        setDadosInativar(null);
    }

    async function confirmarInativar() {
        if (!dadosInativar) {
            return;
        }

        try {
            setCarregandoAcao(true);

            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/advogado/${dadosInativar.idAdvogado}/escritorio/${dadosInativar.idEscritorio}/inativar`,
                {
                    method: 'PUT',
                    credentials: 'include',

                    headers: {
                        'X-Access-Token':
                        token
                    }
                }
            );

            const data =
                await lerResposta(response);

            console.log(
                'INATIVAR:',
                response.status,
                data
            );

            if (response.ok) {
                mostrarMensagem(
                    data.mensagem ||
                    'Advogado inativado neste escritório com sucesso!',
                    'sucesso'
                );

                fecharModalInativar();

                await buscarAdvogados();

                return;
            }

            if (
                response.status === 401
            ) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao inativar advogado.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão com o servidor.',
                'erro'
            );

        } finally {
            setCarregandoAcao(false);
        }
    }

    function abrirModalAtivar(
        idAdvogado,
        idEscritorio,
        nomeAdvogado,
        nomeEscritorio
    ) {
        setDadosAtivar({
            idAdvogado,
            idEscritorio,
            nomeAdvogado,
            nomeEscritorio
        });

        setModalAtivarAberto(true);
    }

    function fecharModalAtivar() {
        setModalAtivarAberto(false);
        setDadosAtivar(null);
    }

    async function confirmarAtivar() {
        if (!dadosAtivar) {
            return;
        }

        try {
            setCarregandoAcao(true);

            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/advogado/${dadosAtivar.idAdvogado}/escritorio/${dadosAtivar.idEscritorio}/ativar`,
                {
                    method: 'PUT',
                    credentials: 'include',

                    headers: {
                        'X-Access-Token':
                        token
                    }
                }
            );

            const data =
                await lerResposta(response);

            console.log(
                'ATIVAR:',
                response.status,
                data
            );

            if (response.ok) {
                mostrarMensagem(
                    data.mensagem ||
                    'Advogado reativado neste escritório com sucesso!',
                    'sucesso'
                );

                fecharModalAtivar();

                await buscarAdvogados();

                return;
            }

            if (
                response.status === 401
            ) {
                deslogar();
                return;
            }

            mostrarMensagem(
                data.error ||
                'Erro ao reativar advogado.',
                'erro'
            );

        } catch (error) {
            console.error(error);

            mostrarMensagem(
                'Erro de conexão com o servidor.',
                'erro'
            );

        } finally {
            setCarregandoAcao(false);
        }
    }

    const advogadosFiltrados =
        advogados.filter(advogado => {
            if (!filtroNome.trim()) {
                return true;
            }

            return advogado.nome
                ?.toLowerCase()
                .includes(
                    filtroNome.toLowerCase()
                );
        });

    const totalEstatisticas = 2;

    function irParaEstatistica(pagina) {
        if (!estatisticasRef.current) {
            return;
        }

        estatisticasRef.current.scrollTo({
            left:
                estatisticasRef.current.clientWidth *
                pagina,

            behavior: 'smooth'
        });

        setPaginaEstatisticas(pagina);
    }

    function rolarEstatisticasEsquerda() {
        if (
            paginaEstatisticas > 0
        ) {
            irParaEstatistica(
                paginaEstatisticas - 1
            );
        }
    }

    function rolarEstatisticasDireita() {
        if (
            paginaEstatisticas <
            totalEstatisticas - 1
        ) {
            irParaEstatistica(
                paginaEstatisticas + 1
            );
        }
    }

    const podeRolarEstatisticasEsquerda =
        paginaEstatisticas > 0;

    const podeRolarEstatisticasDireita =
        paginaEstatisticas <
        totalEstatisticas - 1;

    const cargoEhPromocao =
        dadosAlterarCargo?.novoStatus ===
        'PROPRIETARIO';

    return (
        <div className={css.paginaCompleta}>

            <Header api={API_URL} />

            <div
                className={
                    css.layoutDashboard
                }
            >

                <div className={`${css.menuLateralContainer} ${menuColapsado ? css.menuLateralColapsado : ''}`}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <main
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
                            Advogados
                        </h1>
                    </div>

                    {mensagem && (
                        <div
                            className={`
                                ${css.mensagemContainer}
                                ${
                                tipoMensagem ===
                                'erro'
                                    ? css.erro
                                    : css.sucesso
                            }
                            `}
                        >
                            {mensagem}
                        </div>
                    )}

                    <section
                        className={
                            css.carrosselEstatisticas
                        }
                    >

                        {podeRolarEstatisticasEsquerda && (
                            <button
                                className={
                                    css.botaoSetaEstatisticas
                                }
                                onClick={
                                    rolarEstatisticasEsquerda
                                }
                                type="button"
                                aria-label="Estatística anterior"
                            >
                                &#10094;
                            </button>
                        )}

                        <div
                            className={
                                css.gradeEstatisticas
                            }
                            ref={
                                estatisticasRef
                            }
                        >

                            <div
                                className={
                                    css.cardEstatistica
                                }
                            >
                                <span
                                    className={
                                        css.labelEstatistica
                                    }
                                >
                                    Advogados encontrados
                                </span>

                                <span
                                    className={
                                        css.numeroEstatistica
                                    }
                                >
                                    {quantidade}
                                </span>
                            </div>

                            <div
                                className={
                                    css.cardEstatistica
                                }
                            >
                                <span
                                    className={
                                        css.labelEstatistica
                                    }
                                >
                                    Escritórios
                                </span>

                                <span
                                    className={
                                        css.numeroEstatistica
                                    }
                                >
                                    {
                                        escritorios.length
                                    }
                                </span>
                            </div>

                        </div>

                        {podeRolarEstatisticasDireita && (
                            <button
                                className={
                                    css.botaoSetaEstatisticas
                                }
                                onClick={
                                    rolarEstatisticasDireita
                                }
                                type="button"
                                aria-label="Próxima estatística"
                            >
                                &#10095;
                            </button>
                        )}

                    </section>

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
                                placeholder="Pesquisar pelo nome..."
                                value={
                                    filtroNome
                                }
                                onChange={e =>
                                    setFiltroNome(
                                        e.target.value
                                    )
                                }
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
                                    filtroCargo
                                }
                                onChange={e =>
                                    setFiltroCargo(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="todos">
                                    Filtrar por: Posição
                                </option>

                                {cargos.map(
                                    cargo => (
                                        <option
                                            key={
                                                cargo.valor
                                            }
                                            value={
                                                cargo.valor
                                            }
                                        >
                                            {
                                                cargo.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                className={
                                    css.selectFiltro
                                }
                                value={
                                    filtroEscritorio
                                }
                                onChange={e =>
                                    setFiltroEscritorio(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="todos">
                                    Filtrar por: Escritório
                                </option>

                                {escritorios.map(
                                    escritorio => (
                                        <option
                                            key={
                                                escritorio.id
                                            }
                                            value={
                                                escritorio.id
                                            }
                                        >
                                            {
                                                escritorio.nome
                                            }
                                        </option>
                                    )
                                )}
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
                                Carregando advogados...
                            </p>

                        ) : advogadosFiltrados.length === 0 ? (

                            <p>
                                Nenhum advogado encontrado.
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
                                        Nome
                                    </th>

                                    <th>
                                        Nº da OAB
                                    </th>

                                    <th>
                                        E-mail
                                    </th>

                                    <th
                                        className={
                                            css.colunaEscritorios
                                        }
                                    >
                                        Escritório / Posição
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

                                {advogadosFiltrados.map(
                                    advogado => (
                                        <tr
                                            key={
                                                advogado.id
                                            }
                                        >

                                            <td data-label="Nome">
                                                <div
                                                    className={
                                                        css.nomeComBadge
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            advogado.nome
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td data-label="Nº da OAB">
                                                {
                                                    advogado.oab ||
                                                    '--'
                                                }
                                            </td>

                                            <td data-label="E-mail">
                                                {
                                                    advogado.email ||
                                                    '--'
                                                }
                                            </td>

                                            <td
                                                data-label="Escritório / Posição"
                                                className={
                                                    css.colunaEscritorios
                                                }
                                            >
                                                <div
                                                    className={
                                                        css.gridVinculos
                                                    }
                                                >

                                                    {advogado.escritorios?.map(
                                                        esc => (
                                                            <div
                                                                key={
                                                                    esc.id
                                                                }
                                                                className={
                                                                    css.itemGrid
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        css.nomeEscritorio
                                                                    }
                                                                >
                                                                    {
                                                                        esc.nome
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={`
                                                                        ${css.statusBadge}
                                                                        ${
                                                                        esc.status ===
                                                                        'PROPRIETARIO'
                                                                            ? css.proprietario
                                                                            : css.parceiro
                                                                    }
                                                                    `}
                                                                >
                                                                    {esc.status ===
                                                                    'PROPRIETARIO'
                                                                        ? 'Proprietário'
                                                                        : 'Parceiro'}
                                                                </span>

                                                                {!vinculoAtivo(esc.ativo) && (
                                                                    <span
                                                                        className={`
                                                                            ${css.statusBadge}
                                                                            ${css.inativo}
                                                                        `}
                                                                    >
                                                                        Inativo
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            </td>

                                            <td
                                                data-label="Ações"
                                                className={
                                                    css.colunaAcoes
                                                }
                                            >
                                                <div
                                                    className={
                                                        css.gridAcoes
                                                    }
                                                >

                                                    {advogado.escritorios?.map(
                                                        esc => (
                                                            <div
                                                                key={
                                                                    esc.id
                                                                }
                                                                className={
                                                                    css.itemAcaoGrid
                                                                }
                                                            >

                                                                <span
                                                                    className={
                                                                        css.nomeEscritorioAcao
                                                                    }
                                                                >
                                                                    {
                                                                        esc.nome
                                                                    }
                                                                </span>

                                                                <div
                                                                    className={
                                                                        css.botoesLinhaAcao
                                                                    }
                                                                >

                                                                    {esc.pode_gerenciar ? (

                                                                        <>
                                                                            {!vinculoAtivo(esc.ativo) ? (

                                                                                <button
                                                                                    className={
                                                                                        css.botaoAtivar
                                                                                    }
                                                                                    disabled={
                                                                                        carregandoAcao
                                                                                    }
                                                                                    onClick={() =>
                                                                                        abrirModalAtivar(
                                                                                            advogado.id,
                                                                                            esc.id,
                                                                                            advogado.nome,
                                                                                            esc.nome
                                                                                        )
                                                                                    }
                                                                                    type="button"
                                                                                >
                                                                                    Ativar
                                                                                </button>

                                                                            ) : esc.status === 'PROPRIETARIO' ? (

                                                                                <button
                                                                                    className={
                                                                                        css.botaoVer
                                                                                    }
                                                                                    disabled={
                                                                                        carregandoAcao
                                                                                    }
                                                                                    onClick={() =>
                                                                                        abrirModalAlterarCargo(
                                                                                            advogado.id,
                                                                                            esc.id,
                                                                                            advogado.nome,
                                                                                            esc.nome,
                                                                                            'PARCEIRO'
                                                                                        )
                                                                                    }
                                                                                    type="button"
                                                                                >
                                                                                    Regredir
                                                                                </button>

                                                                            ) : (

                                                                                <>
                                                                                    <button
                                                                                        className={
                                                                                            css.botaoVer
                                                                                        }
                                                                                        disabled={
                                                                                            carregandoAcao
                                                                                        }
                                                                                        onClick={() =>
                                                                                            abrirModalAlterarCargo(
                                                                                                advogado.id,
                                                                                                esc.id,
                                                                                                advogado.nome,
                                                                                                esc.nome,
                                                                                                'PROPRIETARIO'
                                                                                            )
                                                                                        }
                                                                                        type="button"
                                                                                    >
                                                                                        Promover
                                                                                    </button>

                                                                                    <button
                                                                                        className={
                                                                                            css.botaoInativar
                                                                                        }
                                                                                        disabled={
                                                                                            carregandoAcao
                                                                                        }
                                                                                        onClick={() =>
                                                                                            abrirModalRetirar(
                                                                                                advogado.id,
                                                                                                esc.id,
                                                                                                advogado.nome,
                                                                                                esc.nome
                                                                                            )
                                                                                        }
                                                                                        type="button"
                                                                                    >
                                                                                        Retirar
                                                                                    </button>

                                                                                    <button
                                                                                        className={
                                                                                            css.botaoInativarAdvogado
                                                                                        }
                                                                                        disabled={
                                                                                            carregandoAcao
                                                                                        }
                                                                                        onClick={() =>
                                                                                            abrirModalInativar(
                                                                                                advogado.id,
                                                                                                esc.id,
                                                                                                advogado.nome,
                                                                                                esc.nome
                                                                                            )
                                                                                        }
                                                                                        type="button"
                                                                                    >
                                                                                        Inativar
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </>

                                                                    ) : (

                                                                        <span
                                                                            className={
                                                                                css.semAcao
                                                                            }
                                                                        >
                                                                            Sem Ações
                                                                        </span>
                                                                    )}

                                                                </div>
                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}

                                </tbody>
                            </table>
                        )}
                    </div>

                </main>
            </div>

            {modalAlterarCargoAberto &&
                dadosAlterarCargo && (

                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={e => {
                            if (
                                e.target ===
                                e.currentTarget &&
                                !carregandoAcao
                            ) {
                                fecharModalAlterarCargo();
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
                                    fecharModalAlterarCargo
                                }
                                type="button"
                                disabled={
                                    carregandoAcao
                                }
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

                                {cargoEhPromocao
                                    ? 'promover?'
                                    : 'regredir?'}
                            </h2>

                            <p
                                className={
                                    css.subtituloInativacao
                                }
                            >
                                Confirme para{' '}

                                {cargoEhPromocao
                                    ? 'promover'
                                    : 'regredir'}{' '}

                                <strong>
                                    {
                                        dadosAlterarCargo.nomeAdvogado
                                    }
                                </strong>

                                <br />

                                {cargoEhPromocao
                                    ? 'a Proprietário'
                                    : 'a Parceiro'}{' '}

                                no escritório{' '}

                                <strong>
                                    {
                                        dadosAlterarCargo.nomeEscritorio
                                    }
                                </strong>.
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
                                        fecharModalAlterarCargo
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={
                                        css.btnConfirmarInativacao
                                    }
                                    onClick={
                                        confirmarAlterarCargo
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    {carregandoAcao
                                        ? (
                                            cargoEhPromocao
                                                ? 'Promovendo...'
                                                : 'Regredindo...'
                                        )
                                        : (
                                            cargoEhPromocao
                                                ? 'Promover'
                                                : 'Regredir'
                                        )}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            {modalRetirarAberto &&
                dadosRetirar && (

                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={e => {
                            if (
                                e.target ===
                                e.currentTarget &&
                                !carregandoAcao
                            ) {
                                fecharModalRetirar();
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
                                    fecharModalRetirar
                                }
                                type="button"
                                disabled={
                                    carregandoAcao
                                }
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
                                retirar?
                            </h2>

                            <p
                                className={
                                    css.subtituloInativacao
                                }
                            >
                                Confirme para retirar{' '}

                                <strong>
                                    {
                                        dadosRetirar.nomeAdvogado
                                    }
                                </strong>{' '}

                                do escritório{' '}

                                <strong>
                                    {
                                        dadosRetirar.nomeEscritorio
                                    }
                                </strong>.
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
                                        fecharModalRetirar
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={
                                        css.btnConfirmarInativacao
                                    }
                                    onClick={
                                        confirmarRetirar
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    {carregandoAcao
                                        ? 'Retirando...'
                                        : 'Retirar'}
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            {modalInativarAberto &&
                dadosInativar && (

                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={e => {
                            if (
                                e.target ===
                                e.currentTarget &&
                                !carregandoAcao
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
                                disabled={
                                    carregandoAcao
                                }
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
                                Confirme para inativar{' '}

                                <strong>
                                    {
                                        dadosInativar.nomeAdvogado
                                    }
                                </strong>{' '}

                                no escritório{' '}

                                <strong>
                                    {
                                        dadosInativar.nomeEscritorio
                                    }
                                </strong>.

                                <br />

                                Ele continuará podendo acessar
                                normalmente os outros escritórios
                                em que estiver ativo.
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
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={
                                        css.btnConfirmarInativacao
                                    }
                                    onClick={
                                        confirmarInativar
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    {carregandoAcao
                                        ? 'Inativando...'
                                        : 'Inativar'}
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            {modalAtivarAberto &&
                dadosAtivar && (

                    <div
                        className={
                            css.modalOverlay
                        }
                        onClick={e => {
                            if (
                                e.target ===
                                e.currentTarget &&
                                !carregandoAcao
                            ) {
                                fecharModalAtivar();
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
                                    fecharModalAtivar
                                }
                                type="button"
                                disabled={
                                    carregandoAcao
                                }
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
                                ativar?
                            </h2>

                            <p
                                className={
                                    css.subtituloInativacao
                                }
                            >
                                Confirme para reativar{' '}

                                <strong>
                                    {
                                        dadosAtivar.nomeAdvogado
                                    }
                                </strong>{' '}

                                no escritório{' '}

                                <strong>
                                    {
                                        dadosAtivar.nomeEscritorio
                                    }
                                </strong>.

                                <br />

                                Ele voltará a ter acesso a este
                                escritório.
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
                                        fecharModalAtivar
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={
                                        css.btnConfirmarInativacao
                                    }
                                    onClick={
                                        confirmarAtivar
                                    }
                                    type="button"
                                    disabled={
                                        carregandoAcao
                                    }
                                >
                                    {carregandoAcao
                                        ? 'Ativando...'
                                        : 'Ativar'}
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            <Footer />

        </div>
    );
}