import React, {
    useEffect,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import {
    renderAsync
} from 'docx-preview';

import css from './DocumentosGerados1.module.css';

import Header from '../Header/Header.jsx';

import MenuLateralAdvogado
    from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';


export default function DocumentosGerados1({
                                               api
                                           }) {

    const navigate =
        useNavigate();


    const API_URL =
        api || 'http://localhost:5000';


    // =====================================================
    // DOCUMENTOS
    // =====================================================

    const [
        documentos,
        setDocumentos
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    // =====================================================
    // FILTROS
    // =====================================================

    const [
        busca,
        setBusca
    ] = useState('');


    const [
        filtroEscritorio,
        setFiltroEscritorio
    ] = useState('todos');


    const [
        filtroTipo,
        setFiltroTipo
    ] = useState('todos');


    // =====================================================
    // MODAL
    // =====================================================

    const [
        modalAberto,
        setModalAberto
    ] = useState(false);


    const [
        documentoSelecionado,
        setDocumentoSelecionado
    ] = useState(null);


    // =====================================================
    // PREVIEW
    // =====================================================

    const [
        carregandoPreview,
        setCarregandoPreview
    ] = useState(false);


    const [
        erroPreview,
        setErroPreview
    ] = useState('');


    // =====================================================
    // MENSAGENS
    // =====================================================

    const [
        mensagem,
        setMensagem
    ] = useState('');


    const [
        tipoMensagem,
        setTipoMensagem
    ] = useState('');


    // =====================================================
    // MENU
    // =====================================================

    const [
        menuColapsado,
        setMenuColapsado
    ] = useState(false);


    useEffect(() => {

        function aplicarEstadoMenu(
            e
        ) {

            const colapsado =
                e?.detail?.colapsado
                ?? false;


            setMenuColapsado(
                colapsado
            );
        }


        aplicarEstadoMenu({

            detail: {

                colapsado:
                    localStorage.getItem(
                        'menu_colapsado'
                    ) === 'true'
            }

        });


        window.addEventListener(
            'menu-lateral-toggle',
            aplicarEstadoMenu
        );


        return () => {

            window.removeEventListener(
                'menu-lateral-toggle',
                aplicarEstadoMenu
            );

        };

    }, []);


    // =====================================================
    // INICIAL
    // =====================================================

    useEffect(() => {

        carregarDocumentos();

    }, []);


    // =====================================================
    // MENSAGEM
    // =====================================================

    function mostrarMensagem(
        texto,
        tipo = 'erro'
    ) {

        setMensagem(
            texto
        );

        setTipoMensagem(
            tipo
        );


        setTimeout(() => {

            setMensagem('');

            setTipoMensagem('');

        }, 5000);
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function deslogar() {

        localStorage.removeItem(
            'token'
        );

        localStorage.removeItem(
            'nome'
        );

        localStorage.removeItem(
            'tipo'
        );

        localStorage.removeItem(
            'id_usuario'
        );


        navigate(
            '/login'
        );
    }


    // =====================================================
    // CARREGAR DOCUMENTOS
    // =====================================================

    async function carregarDocumentos() {

        setCarregando(
            true
        );


        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            deslogar();

            return;
        }


        try {

            const response =
                await fetch(

                    `${API_URL}/documentos-gerados`,

                    {
                        method:
                            'GET',

                        credentials:
                            'include',

                        headers: {

                            'X-Access-Token':
                            token
                        }
                    }

                );


            let resultado = {};


            try {

                resultado =
                    await response.json();

            } catch {

                resultado = {};

            }


            if (
                response.status === 401
            ) {

                deslogar();

                return;
            }


            if (!response.ok) {

                mostrarMensagem(

                    resultado.error
                    ||
                    'Erro ao carregar documentos.'

                );

                return;
            }


            setDocumentos(
                resultado.documentos
                || []
            );


        } catch (error) {

            console.error(
                'Erro ao carregar documentos:',
                error
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );


        } finally {

            setCarregando(
                false
            );
        }
    }


    // =====================================================
    // NORMALIZAR TEXTO
    // =====================================================

    function normalizarTexto(
        texto
    ) {

        return String(
            texto || ''
        )
            .normalize('NFD')
            .replace(
                /[\u0300-\u036f]/g,
                ''
            )
            .toLowerCase()
            .trim();
    }


    // =====================================================
    // FORMATAR TIPO
    // =====================================================

    function formatarTipo(
        tipo
    ) {

        const tipos = {

            CONTRATO:
                'Contrato',

            PROCURACAO:
                'Procuração',

            PETICAO_INICIAL:
                'Petição inicial',

            HIPOSSUFICIENCIA:
                'Declaração de hipossuficiência'

        };


        return (
            tipos[tipo]
            ||
            tipo
            ||
            '--'
        );
    }

    // =====================================================
    // ESCRITÓRIOS PARA O FILTRO
    // =====================================================

    const escritorios = [];


    documentos.forEach(
        documento => {

            if (
                !documento.id_escritorio
            ) {

                return;
            }


            const existe =
                escritorios.some(

                    escritorio =>
                        String(
                            escritorio.id
                        )
                        ===
                        String(
                            documento.id_escritorio
                        )

                );


            if (!existe) {

                escritorios.push({

                    id:
                    documento.id_escritorio,

                    nome:
                    documento.escritorio
                });
            }

        }
    );


    // =====================================================
    // FILTRO
    // =====================================================

    const documentosFiltrados =
        documentos.filter(
            documento => {

                const textoBusca =
                    normalizarTexto(
                        busca
                    );


                const textoDocumento =
                    normalizarTexto(
                        [
                            documento.nome_arquivo,
                            documento.nome_modelo,
                            documento.cliente,
                            documento.numero_processo,
                            documento.escritorio,
                            formatarTipo(
                                documento.tipo
                            )
                        ].join(' ')
                    );


                const correspondeBusca =
                    !textoBusca
                    ||
                    textoDocumento.includes(
                        textoBusca
                    );


                const correspondeEscritorio =

                    filtroEscritorio ===
                    'todos'

                    ||

                    String(
                        documento.id_escritorio
                    )
                    ===
                    String(
                        filtroEscritorio
                    );


                const correspondeTipo =

                    filtroTipo ===
                    'todos'

                    ||

                    documento.tipo ===
                    filtroTipo;


                return (

                    correspondeBusca
                    &&
                    correspondeEscritorio
                    &&
                    correspondeTipo

                );
            }
        );


    // =====================================================
    // ABRIR DOCUMENTO
    // =====================================================

    function abrirDocumento(
        documento
    ) {

        setDocumentoSelecionado(
            documento
        );

        setModalAberto(
            true
        );

        setErroPreview('');
    }


    // =====================================================
    // FECHAR MODAL
    // =====================================================

    function fecharModal() {

        setModalAberto(
            false
        );

        setDocumentoSelecionado(
            null
        );

        setErroPreview('');

        setCarregandoPreview(
            false
        );


        const container =
            document.getElementById(
                'preview-documento-gerado'
            );


        if (container) {

            container.innerHTML = '';
        }
    }


    // =====================================================
    // PREVIEW
    // =====================================================

    useEffect(() => {

        if (
            modalAberto
            &&
            documentoSelecionado
        ) {

            carregarPreview(
                documentoSelecionado
            );
        }

    }, [
        modalAberto,
        documentoSelecionado?.id
    ]);


    async function carregarPreview(
        documento
    ) {

        if (!documento) {

            return;
        }


        setCarregandoPreview(
            true
        );

        setErroPreview('');


        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            deslogar();

            return;
        }


        try {

            const response =
                await fetch(

                    `${API_URL}/documentos-gerados/${documento.id}/download`,

                    {
                        method:
                            'GET',

                        credentials:
                            'include',

                        headers: {

                            'X-Access-Token':
                            token
                        }
                    }

                );


            if (
                response.status === 401
            ) {

                deslogar();

                return;
            }


            if (!response.ok) {

                let resultado = {};


                try {

                    resultado =
                        await response.json();

                } catch {

                    resultado = {};

                }


                setErroPreview(

                    resultado.error
                    ||
                    'Não foi possível carregar o documento.'

                );

                return;
            }


            const arquivo =
                await response.blob();


            await new Promise(

                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )

            );


            const container =
                document.getElementById(
                    'preview-documento-gerado'
                );


            if (!container) {

                return;
            }


            container.innerHTML = '';


            await renderAsync(

                arquivo,

                container,

                null,

                {
                    breakPages:
                        true,

                    renderHeaders:
                        true,

                    renderFooters:
                        true,

                    renderFootnotes:
                        true,

                    ignoreWidth:
                        false,

                    ignoreHeight:
                        false,

                    ignoreFonts:
                        false
                }

            );


        } catch (error) {

            console.error(
                'Erro ao carregar preview:',
                error
            );


            setErroPreview(
                'Erro ao preparar a visualização do documento.'
            );


        } finally {

            setCarregandoPreview(
                false
            );
        }
    }


    // =====================================================
    // BAIXAR
    // =====================================================

    async function baixarDocumento(
        documento
    ) {

        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            deslogar();

            return;
        }


        try {

            const response =
                await fetch(

                    `${API_URL}/documentos-gerados/${documento.id}/download`,

                    {
                        method:
                            'GET',

                        credentials:
                            'include',

                        headers: {

                            'X-Access-Token':
                            token
                        }
                    }

                );


            if (
                response.status === 401
            ) {

                deslogar();

                return;
            }


            if (!response.ok) {

                let resultado = {};


                try {

                    resultado =
                        await response.json();

                } catch {

                    resultado = {};

                }


                mostrarMensagem(

                    resultado.error
                    ||
                    'Erro ao baixar documento.'

                );

                return;
            }


            const arquivo =
                await response.blob();


            const url =
                window.URL.createObjectURL(
                    arquivo
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;


            link.download =
                documento.nome_arquivo
                ||
                'documento.docx';


            document.body.appendChild(
                link
            );


            link.click();

            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (error) {

            console.error(
                'Erro ao baixar documento:',
                error
            );


            mostrarMensagem(
                'Erro de conexão ao baixar documento.'
            );
        }
    }


    // =====================================================
    // JSX
    // =====================================================

    return (

        <div
            className={
                css.paginaCompleta
            }
        >

            <Header />


            <div
                className={
                    css.layoutDashboard
                }
            >

                <div
                    className={`
                        ${css.menuLateralContainer}

                        ${
                        menuColapsado
                            ? css.menuLateralColapsado
                            : ''
                    }
                    `}
                >

                    <MenuLateralAdvogado
                        api={API_URL}
                    />

                </div>


                <main
                    className={
                        css.conteudoPrincipal
                    }
                >

                    {/* =================================================
                        TOPO
                    ================================================= */}

                    <div
                        className={
                            css.topo
                        }
                    >

                        <div>

                            <h1
                                className={
                                    css.tituloPagina
                                }
                            >
                                Documentos
                            </h1>


                            <p
                                className={
                                    css.subtituloPagina
                                }
                            >
                                Consulte os documentos gerados
                                nos seus processos.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        MENSAGEM
                    ================================================= */}

                    {mensagem && (

                        <div
                            className={`
                                ${css.mensagemContainer}

                                ${
                                tipoMensagem ===
                                'sucesso'

                                    ? css.sucesso

                                    : css.erro
                            }
                            `}
                        >
                            {mensagem}
                        </div>

                    )}


                    {/* =================================================
                        FILTROS
                    ================================================= */}

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
                                placeholder="Buscar por documento, cliente, processo ou escritório"
                                value={
                                    busca
                                }
                                onChange={(e) =>
                                    setBusca(
                                        e.target.value
                                    )
                                }
                            />


                            <span
                                className={
                                    css.iconeBusca
                                }
                            >
                                ⌕
                            </span>

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
                                    filtroEscritorio
                                }
                                onChange={(e) =>
                                    setFiltroEscritorio(
                                        e.target.value
                                    )
                                }
                            >

                                <option
                                    value="todos"
                                >
                                    Todos os escritórios
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
                            >

                                <option
                                    value="todos"
                                >
                                    Todos os tipos
                                </option>

                                <option
                                    value="CONTRATO"
                                >
                                    Contrato
                                </option>

                                <option
                                    value="PROCURACAO"
                                >
                                    Procuração
                                </option>

                                <option
                                    value="PETICAO_INICIAL"
                                >
                                    Petição inicial
                                </option>

                                <option
                                    value="HIPOSSUFICIENCIA"
                                >
                                    Declaração de hipossuficiência
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =================================================
                        TABELA
                    ================================================= */}

                    <div
                        className={
                            css.tabelaContainer
                        }
                    >

                        {carregando ? (

                            <div
                                className={
                                    css.estadoVazio
                                }
                            >
                                Carregando documentos...
                            </div>

                        ) : documentosFiltrados.length === 0 ? (

                            <div
                                className={
                                    css.estadoVazio
                                }
                            >

                                {documentos.length === 0
                                    ? 'Nenhum documento foi gerado ainda.'
                                    : 'Nenhum documento encontrado com os filtros selecionados.'
                                }

                            </div>

                        ) : (

                            <table
                                className={
                                    css.tabela
                                }
                            >

                                <thead>

                                <tr>

                                    <th>
                                        Documento
                                    </th>

                                    <th>
                                        Cliente
                                    </th>

                                    <th>
                                        Processo
                                    </th>

                                    <th>
                                        Escritório
                                    </th>

                                    <th>
                                        Gerado em
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

                                {documentosFiltrados.map(
                                    documento => (

                                        <tr
                                            key={
                                                documento.id
                                            }
                                        >

                                            <td
                                                data-label="Documento"
                                            >

                                                <div
                                                    className={
                                                        css.documentoInfo
                                                    }
                                                >


                                                    <div
                                                        className={
                                                            css.documentoTexto
                                                        }
                                                    >

                                                        <strong
                                                            className={
                                                                css.nomeDocumento
                                                            }
                                                        >
                                                            {
                                                                documento.nome_modelo
                                                            }
                                                        </strong>


                                                        <span
                                                            className={
                                                                css.tipoDocumento
                                                            }
                                                        >
                                                                {
                                                                    formatarTipo(
                                                                        documento.tipo
                                                                    )
                                                                }
                                                            </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td
                                                data-label="Cliente"
                                            >
                                                {
                                                    documento.cliente
                                                    || '--'
                                                }
                                            </td>


                                            <td
                                                data-label="Processo"
                                            >
                                                {
                                                    documento.numero_processo
                                                    || '--'
                                                }
                                            </td>


                                            <td
                                                data-label="Escritório"
                                            >
                                                {
                                                    documento.escritorio
                                                    || '--'
                                                }
                                            </td>


                                            <td
                                                data-label="Gerado em"
                                            >
                                                {
                                                    documento.data_geracao
                                                    || '--'
                                                }
                                            </td>


                                            <td
                                                data-label="Ações"
                                                className={
                                                    css.colunaAcoes
                                                }
                                            >

                                                <div
                                                    className={
                                                        css.acoesDocumento
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        className={
                                                            css.botaoVer
                                                        }
                                                        onClick={() =>
                                                            abrirDocumento(
                                                                documento
                                                            )
                                                        }
                                                    >
                                                        Ver
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            css.botaoBaixar
                                                        }
                                                        onClick={() =>
                                                            baixarDocumento(
                                                                documento
                                                            )
                                                        }
                                                    >
                                                        Baixar
                                                    </button>

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


            {/* =================================================
                MODAL
            ================================================= */}

            {
                modalAberto
                &&
                documentoSelecionado
                &&
                (

                    <div
                        className={
                            css.overlay
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
                                css.modal
                            }
                        >

                            <div
                                className={
                                    css.modalHeader
                                }
                            >

                                <div>

                                    <h2
                                        className={
                                            css.modalTitulo
                                        }
                                    >
                                        {
                                            documentoSelecionado.nome_modelo
                                        }
                                    </h2>


                                    <p
                                        className={
                                            css.modalSubtitulo
                                        }
                                    >
                                        {
                                            documentoSelecionado.numero_processo
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        css.modalFechar
                                    }
                                    onClick={
                                        fecharModal
                                    }
                                >
                                    ✕
                                </button>

                            </div>


                            {/* =================================================
                                DADOS
                            ================================================= */}

                            <div
                                className={
                                    css.dadosDocumento
                                }
                            >

                                <div
                                    className={
                                        css.itemDado
                                    }
                                >

                                    <span
                                        className={
                                            css.rotulo
                                        }
                                    >
                                        Cliente
                                    </span>

                                    <span>
                                        {
                                            documentoSelecionado.cliente
                                            || '--'
                                        }
                                    </span>

                                </div>


                                <div
                                    className={
                                        css.itemDado
                                    }
                                >

                                    <span
                                        className={
                                            css.rotulo
                                        }
                                    >
                                        Escritório
                                    </span>

                                    <span>
                                        {
                                            documentoSelecionado.escritorio
                                            || '--'
                                        }
                                    </span>

                                </div>


                                <div
                                    className={
                                        css.itemDado
                                    }
                                >

                                    <span
                                        className={
                                            css.rotulo
                                        }
                                    >
                                        Tipo
                                    </span>

                                    <span>
                                        {
                                            formatarTipo(
                                                documentoSelecionado.tipo
                                            )
                                        }
                                    </span>

                                </div>


                                <div
                                    className={
                                        css.itemDado
                                    }
                                >

                                    <span
                                        className={
                                            css.rotulo
                                        }
                                    >
                                        Gerado em
                                    </span>

                                    <span>
                                        {
                                            documentoSelecionado.data_geracao
                                            || '--'
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* =================================================
                                PREVIEW
                            ================================================= */}

                            <div
                                className={
                                    css.areaPreviewModal
                                }
                            >

                                <div
                                    className={
                                        css.cabecalhoPreviewModal
                                    }
                                >

                                    <div>

                                        <h3
                                            className={
                                                css.tituloPreviewModal
                                            }
                                        >
                                            Pré-visualização
                                        </h3>

                                        <p
                                            className={
                                                css.subtituloPreviewModal
                                            }
                                        >
                                            Por ser uma visualização prévia, algumas fontes podem aparecer alteradas, porém as fontes originais do seu documento foram salvas e serão utilizadas quando você gerar um documento usando esse modelo.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className={
                                            css.botaoBaixarPreview
                                        }
                                        onClick={() =>
                                            baixarDocumento(
                                                documentoSelecionado
                                            )
                                        }
                                    >
                                        Baixar documento
                                    </button>

                                </div>


                                {
                                    carregandoPreview
                                    &&
                                    (

                                        <div
                                            className={
                                                css.carregandoPreviewModal
                                            }
                                        >
                                            Preparando documento...
                                        </div>

                                    )
                                }


                                {
                                    erroPreview
                                    &&
                                    (

                                        <div
                                            className={
                                                css.erroPreviewModal
                                            }
                                        >
                                            {
                                                erroPreview
                                            }
                                        </div>

                                    )
                                }


                                {
                                    !erroPreview
                                    &&
                                    (

                                        <div
                                            className={
                                                css.fundoPreviewModal
                                            }
                                        >

                                            <div
                                                id="preview-documento-gerado"
                                                className={
                                                    css.documentoPreviewModal
                                                }
                                            />

                                        </div>

                                    )
                                }

                            </div>

                        </div>

                    </div>

                )
            }

        </div>
    );
}