import React, { useEffect, useState } from 'react';

import css from './ModelosDocumentos1.module.css';

import Header from '../Header/Header.jsx';
import MenuLateralAdvogado from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    renderAsync
} from 'docx-preview';


export default function ModelosDocumentos1({ api }) {

    const navigate = useNavigate();

    const { id } = useParams();

    const API_URL =
        api || 'http://10.92.11.22:5000';


    // =====================================================
    // LISTAGEM
    // =====================================================

    const [modelos, setModelos] =
        useState([]);

    const [busca, setBusca] =
        useState('');

    const [filtroTipo, setFiltroTipo] =
        useState('todos');

    const [carregando, setCarregando] =
        useState(true);


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
    // MODAL
    // =====================================================

    const [
        modeloSelecionado,
        setModeloSelecionado
    ] = useState(null);

    const [
        modalAberto,
        setModalAberto
    ] = useState(false);

    const [
        editando,
        setEditando
    ] = useState(false);


    // =====================================================
    // EDIÇÃO
    // =====================================================

    const [
        nomeEditado,
        setNomeEditado
    ] = useState('');

    const [
        tipoEditado,
        setTipoEditado
    ] = useState('');

    const [
        descricaoEditada,
        setDescricaoEditada
    ] = useState('');


    // =====================================================
    // MENSAGENS
    // =====================================================

    const [mensagem, setMensagem] =
        useState('');

    const [
        tipoMensagem,
        setTipoMensagem
    ] = useState('');


    // =====================================================
    // MENU LATERAL
    // =====================================================

    const [
        menuColapsado,
        setMenuColapsado
    ] = useState(false);


    useEffect(() => {

        function aplicarEstadoMenu(e) {

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
    // CARREGAR MODELOS
    // =====================================================

    useEffect(() => {

        carregarModelos();

    }, [id]);


    async function carregarModelos() {

        setCarregando(true);

        try {

            const token =
                localStorage.getItem(
                    'token'
                );


            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos`,

                    {
                        method: 'GET',

                        credentials:
                            'include',

                        headers: {
                            'X-Access-Token':
                            token
                        }
                    }

                );


            let result = {};


            try {

                result =
                    await response.json();

            } catch {

                result = {};

            }


            if (!response.ok) {

                mostrarMensagem(
                    result.error
                    ||
                    'Erro ao carregar modelos.'
                );

                return;
            }


            setModelos(
                result.modelos || []
            );


        } catch (error) {

            console.error(
                'Erro ao carregar modelos:',
                error
            );

            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );


        } finally {

            setCarregando(false);

        }
    }


    // =====================================================
    // CARREGAR PREVIEW
    // =====================================================

    useEffect(() => {

        if (
            modalAberto
            &&
            modeloSelecionado
            &&
            !editando
        ) {

            carregarPreviewModelo(
                modeloSelecionado
            );
        }

    }, [
        modalAberto,
        modeloSelecionado?.id,
        editando
    ]);


    async function carregarPreviewModelo(
        modelo
    ) {

        if (!modelo) {
            return;
        }


        setCarregandoPreview(true);

        setErroPreview('');


        try {

            const token =
                localStorage.getItem(
                    'token'
                );


            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos/${modelo.id}/download`,

                    {
                        method: 'GET',

                        credentials:
                            'include',

                        headers: {
                            'X-Access-Token':
                            token
                        }
                    }

                );


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
                    'Não foi possível visualizar o documento.'
                );

                return;
            }


            const arquivo =
                await response.blob();


            /*
             * Espera o React montar
             * o espaço do preview.
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );


            const container =
                document.getElementById(
                    'preview-modelo-lista'
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
                    breakPages: true,

                    renderHeaders: true,

                    renderFooters: true,

                    renderFootnotes: true,

                    ignoreWidth: false,

                    ignoreHeight: false,

                    ignoreFonts: false
                }

            );


        } catch (erro) {

            console.error(
                'Erro ao carregar preview:',
                erro
            );


            setErroPreview(
                'Erro ao carregar a pré-visualização.'
            );


        } finally {

            setCarregandoPreview(false);

        }
    }


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


        if (
            window.timeoutMensagemModelos
        ) {

            clearTimeout(
                window.timeoutMensagemModelos
            );
        }


        window.timeoutMensagemModelos =
            setTimeout(() => {

                setMensagem('');

                setTipoMensagem('');

            }, 5000);
    }


    // =====================================================
    // FORMATAR TIPO
    // =====================================================

    function formatarTipo(tipo) {

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


        return tipos[tipo] || tipo;
    }


    // =====================================================
    // FILTROS
    // =====================================================

    function normalizarTexto(texto) {

        return String(
            texto || ''
        )
            .normalize('NFD')
            .replace(
                /[\u0300-\u036f]/g,
                ''
            )
            .toLowerCase();
    }


    const modelosFiltrados =
        modelos.filter(modelo => {

            const termo =
                normalizarTexto(
                    busca
                );


            const correspondeBusca =

                normalizarTexto(
                    modelo.nome
                ).includes(termo)

                ||

                normalizarTexto(
                    modelo.arquivo
                ).includes(termo)

                ||

                normalizarTexto(
                    formatarTipo(
                        modelo.tipo
                    )
                ).includes(termo);


            const correspondeTipo =

                filtroTipo === 'todos'

                ||

                modelo.tipo === filtroTipo;


            return (
                correspondeBusca
                &&
                correspondeTipo
            );

        });


    // =====================================================
    // NAVEGAÇÃO
    // =====================================================

    function irParaCadastro() {

        navigate(
            `/escritorio/${id}/cadastro_modelo_documento`
        );
    }




    // =====================================================
    // MODAL
    // =====================================================

    function abrirModal(modelo) {

        setErroPreview('');

        setModeloSelecionado(
            modelo
        );


        setNomeEditado(
            modelo.nome
        );


        setTipoEditado(
            modelo.tipo
        );


        setDescricaoEditada(
            modelo.descricao || ''
        );


        setEditando(false);

        setModalAberto(true);
    }


    function fecharModal() {

        setModalAberto(false);

        setModeloSelecionado(null);

        setEditando(false);

        setNomeEditado('');

        setTipoEditado('');

        setDescricaoEditada('');

        setErroPreview('');

        setCarregandoPreview(false);


        const container =
            document.getElementById(
                'preview-modelo-lista'
            );


        if (container) {

            container.innerHTML = '';

        }
    }


    function iniciarEdicao() {

        if (!modeloSelecionado) {
            return;
        }


        setNomeEditado(
            modeloSelecionado.nome
        );


        setTipoEditado(
            modeloSelecionado.tipo
        );


        setDescricaoEditada(
            modeloSelecionado.descricao
            || ''
        );


        setEditando(true);
    }


    function cancelarEdicao() {

        setNomeEditado(
            modeloSelecionado.nome
        );


        setTipoEditado(
            modeloSelecionado.tipo
        );


        setDescricaoEditada(
            modeloSelecionado.descricao
            || ''
        );


        setEditando(false);
    }


    // =====================================================
    // EDITAR MODELO
    // =====================================================

    async function salvarEdicao() {

        if (!nomeEditado.trim()) {

            mostrarMensagem(
                'Informe o nome do modelo.'
            );

            return;
        }


        if (!tipoEditado) {

            mostrarMensagem(
                'Selecione o tipo do documento.'
            );

            return;
        }


        try {

            const token =
                localStorage.getItem(
                    'token'
                );


            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos/${modeloSelecionado.id}`,

                    {
                        method: 'PUT',

                        credentials:
                            'include',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'X-Access-Token':
                            token
                        },

                        body:
                            JSON.stringify({

                                nome:
                                    nomeEditado.trim(),

                                tipo:
                                tipoEditado,

                                descricao:
                                    descricaoEditada.trim()
                            })
                    }

                );


            let result = {};


            try {

                result =
                    await response.json();

            } catch {

                result = {};

            }


            if (!response.ok) {

                mostrarMensagem(
                    result.error
                    ||
                    'Erro ao atualizar modelo.'
                );

                return;
            }


            const modeloAtualizado = {

                ...modeloSelecionado,

                nome:
                    nomeEditado.trim(),

                tipo:
                tipoEditado,

                descricao:
                    descricaoEditada.trim(),

                atualizado_em:
                    new Date()
                        .toLocaleDateString(
                            'pt-BR'
                        )
            };


            setModelos(
                modelos.map(modelo => {

                    if (
                        modelo.id ===
                        modeloSelecionado.id
                    ) {

                        return modeloAtualizado;
                    }


                    return modelo;

                })
            );


            setModeloSelecionado(
                modeloAtualizado
            );


            setEditando(false);


            mostrarMensagem(
                result.mensagem
                ||
                'Modelo atualizado com sucesso!',
                'sucesso'
            );


        } catch (error) {

            console.error(
                'Erro ao editar modelo:',
                error
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );
        }
    }


    // =====================================================
    // ATIVAR / INATIVAR
    // =====================================================

    async function alternarStatus(
        modelo
    ) {

        try {

            const token =
                localStorage.getItem(
                    'token'
                );


            const novoStatus =
                !modelo.ativo;


            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos/${modelo.id}/status`,

                    {
                        method: 'PUT',

                        credentials:
                            'include',

                        headers: {

                            'Content-Type':
                                'application/json',

                            'X-Access-Token':
                            token
                        },

                        body:
                            JSON.stringify({

                                ativo:
                                novoStatus
                            })
                    }

                );


            let result = {};


            try {

                result =
                    await response.json();

            } catch {

                result = {};

            }


            if (!response.ok) {

                mostrarMensagem(
                    result.error
                    ||
                    'Erro ao alterar status.'
                );

                return;
            }


            const atualizado = {

                ...modelo,

                ativo:
                result.ativo,

                atualizado_em:
                    new Date()
                        .toLocaleDateString(
                            'pt-BR'
                        )
            };


            setModelos(
                modelos.map(item => {

                    if (
                        item.id === modelo.id
                    ) {

                        return atualizado;
                    }


                    return item;

                })
            );


            setModeloSelecionado(
                atualizado
            );


            mostrarMensagem(
                result.mensagem
                ||
                (
                    atualizado.ativo
                        ? 'Modelo ativado com sucesso!'
                        : 'Modelo inativado com sucesso!'
                ),
                'sucesso'
            );


        } catch (error) {

            console.error(
                'Erro ao alterar status:',
                error
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );
        }
    }


    // =====================================================
    // BAIXAR
    // =====================================================

    async function baixarModelo(
        modelo
    ) {

        try {

            const token =
                localStorage.getItem(
                    'token'
                );


            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos/${modelo.id}/download`,

                    {
                        method: 'GET',

                        credentials:
                            'include',

                        headers: {
                            'X-Access-Token':
                            token
                        }
                    }

                );


            if (!response.ok) {

                let result = {};


                try {

                    result =
                        await response.json();

                } catch {

                    result = {};

                }


                mostrarMensagem(
                    result.error
                    ||
                    'Erro ao baixar o modelo.'
                );

                return;
            }


            const blob =
                await response.blob();


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            link.href =
                url;


            link.download =
                modelo.arquivo
                ||
                'modelo.docx';


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            window.URL.revokeObjectURL(
                url
            );


        } catch (error) {

            console.error(
                'Erro ao baixar modelo:',
                error
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );
        }
    }


    // =====================================================
    // RETURN
    // =====================================================

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

                {/* MENU LATERAL */}

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


                {/* CONTEÚDO */}

                <main
                    className={
                        css.conteudoPrincipal
                    }
                >

                    {/* TOPO */}

                    <div
                        className={
                            css.topo
                        }
                    >

                        <div
                            className={
                                css.tituloComVoltar
                            }
                        >


                            <h1
                                className={
                                    css.tituloPagina
                                }
                            >
                                Modelos de documentos
                            </h1>

                        </div>


                        <button
                            className={
                                css.botaoAdicionar
                            }
                            onClick={
                                irParaCadastro
                            }
                            name="btn-adicionar-modelo"
                            type="button"
                            aria-label="Adicionar modelo"
                        >
                            +
                        </button>

                    </div>


                    {/* MENSAGEM */}

                    {mensagem && (

                        <div
                            className={`
                                ${css.mensagemContainer}
                                ${
                                tipoMensagem === 'sucesso'
                                    ? css.sucesso
                                    : css.erro
                            }
                            `}
                        >

                            {mensagem}

                        </div>

                    )}


                    {/* FILTROS */}

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
                                className={
                                    css.inputBusca
                                }
                                type="text"
                                placeholder="Buscar modelo..."
                                value={busca}
                                onChange={(e) =>
                                    setBusca(
                                        e.target.value
                                    )
                                }
                                name="busca-modelo"
                            />


                            <span
                                className={
                                    css.iconeBusca
                                }
                            >

                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >

                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                        stroke="#888888"
                                        strokeWidth="2"
                                    />

                                    <path
                                        d="M16 16L21 21"
                                        stroke="#888888"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />

                                </svg>

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
                                    filtroTipo
                                }
                                onChange={(e) =>
                                    setFiltroTipo(
                                        e.target.value
                                    )
                                }
                                name="filtro-tipo"
                            >

                                <option
                                    value="todos"
                                >
                                    Filtrar por: Todos os tipos
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


                    {/* TABELA */}

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

                                <p>
                                    Carregando modelos...
                                </p>

                            </div>

                        ) : modelosFiltrados.length === 0 ? (

                            <div
                                className={
                                    css.estadoVazio
                                }
                            >

                                <p>
                                    Nenhum modelo encontrado.
                                </p>


                                <button
                                    type="button"
                                    className={
                                        css.botaoEstadoVazio
                                    }
                                    onClick={
                                        irParaCadastro
                                    }
                                >
                                    Cadastrar modelo
                                </button>

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
                                        Nome
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        Arquivo
                                    </th>

                                    <th>
                                        Atualizado em
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Ações
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {modelosFiltrados.map(
                                    modelo => (

                                        <tr
                                            key={
                                                modelo.id
                                            }
                                        >

                                            <td
                                                data-label="Nome"
                                            >

                                                    <span
                                                        className={
                                                            css.nomeModelo
                                                        }
                                                    >
                                                        {modelo.nome}
                                                    </span>

                                            </td>


                                            <td
                                                data-label="Tipo"
                                            >
                                                {formatarTipo(
                                                    modelo.tipo
                                                )}
                                            </td>


                                            <td
                                                data-label="Arquivo"
                                            >

                                                <div
                                                    className={
                                                        css.arquivo
                                                    }
                                                >

                                                        <span
                                                            className={
                                                                css.nomeArquivo
                                                            }
                                                        >
                                                            {modelo.arquivo}
                                                        </span>

                                                </div>

                                            </td>


                                            <td
                                                data-label="Atualizado em"
                                            >
                                                {modelo.atualizado_em || '--'}
                                            </td>


                                            <td
                                                data-label="Status"
                                            >

                                                    <span
                                                        className={`
                                                            ${css.statusBadge}
                                                            ${
                                                            modelo.ativo
                                                                ? css.ativo
                                                                : css.inativo
                                                        }
                                                        `}
                                                    >

                                                        {
                                                            modelo.ativo
                                                                ? 'Ativo'
                                                                : 'Inativo'
                                                        }

                                                    </span>

                                            </td>


                                            <td
                                                data-label="Ações"
                                                className={
                                                    css.colunaAcoes
                                                }
                                            >

                                                <div
                                                    className={
                                                        css.acoesModelo
                                                    }
                                                >

                                                    <button
                                                        className={
                                                            css.botaoVer
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            abrirModal(
                                                                modelo
                                                            )
                                                        }
                                                    >
                                                        Ver
                                                    </button>


                                                    <button
                                                        className={
                                                            css.botaoBaixar
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            baixarModelo(
                                                                modelo
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


            {/* =====================================================
                MODAL
            ===================================================== */}

            {modalAberto && modeloSelecionado && (

                <div
                    className={
                        css.overlay
                    }
                    onClick={
                        fecharModal
                    }
                >

                    <div
                        className={
                            css.modal
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* CABEÇALHO */}

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

                                {
                                    editando
                                        ? 'Editar modelo'
                                        : modeloSelecionado.nome
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
                                aria-label="Fechar"
                            >
                                ✕
                            </button>

                        </div>


                        {/* =================================================
                            EDIÇÃO
                        ================================================= */}

                        {editando ? (

                            <div
                                className={
                                    css.formEdicao
                                }
                            >

                                {/* NOME */}

                                <div
                                    className={
                                        css.campo
                                    }
                                >

                                    <label
                                        className={
                                            css.label
                                        }
                                    >
                                        Nome do modelo
                                    </label>


                                    <input
                                        className={
                                            css.input
                                        }
                                        type="text"
                                        value={
                                            nomeEditado
                                        }
                                        onChange={(e) =>
                                            setNomeEditado(
                                                e.target.value
                                            )
                                        }
                                        maxLength={150}
                                    />

                                </div>


                                {/* TIPO */}

                                <div
                                    className={
                                        css.campo
                                    }
                                >

                                    <label
                                        className={
                                            css.label
                                        }
                                    >
                                        Tipo do documento
                                    </label>



                                    <select
                                        className={
                                            css.input
                                        }
                                        value={
                                            tipoEditado
                                        }
                                        onChange={(e) =>
                                            setTipoEditado(
                                                e.target.value
                                            )
                                        }
                                        name="tipo-documento"
                                    >

                                        <option
                                            value=""
                                            disabled
                                        >
                                            Selecionar tipo
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


                                {/* DESCRIÇÃO */}

                                <div
                                    className={
                                        css.campo
                                    }
                                >

                                    <label
                                        className={
                                            css.label
                                        }
                                    >
                                        Descrição
                                    </label>


                                    <textarea
                                        className={
                                            css.textarea
                                        }
                                        value={
                                            descricaoEditada
                                        }
                                        onChange={(e) =>
                                            setDescricaoEditada(
                                                e.target.value
                                            )
                                        }
                                        rows={4}
                                        maxLength={500}
                                    />

                                </div>


                                {/* BOTÕES */}

                                <div
                                    className={
                                        css.botoesModal
                                    }
                                >

                                    <button
                                        className={
                                            css.botaoSecundario
                                        }
                                        type="button"
                                        onClick={
                                            cancelarEdicao
                                        }
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        className={
                                            css.botaoPrincipal
                                        }
                                        type="button"
                                        onClick={
                                            salvarEdicao
                                        }
                                    >
                                        Salvar alterações
                                    </button>

                                </div>

                            </div>

                        ) : (

                            <>

                                {/* =================================================
                                    INFORMAÇÕES
                                ================================================= */}

                                <div
                                    className={
                                        css.dadosModelo
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
                                            Tipo
                                        </span>

                                        <span>
                                            {formatarTipo(
                                                modeloSelecionado.tipo
                                            )}
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
                                            Arquivo
                                        </span>

                                        <span>
                                            {modeloSelecionado.arquivo}
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
                                            Última atualização
                                        </span>

                                        <span>
                                            {modeloSelecionado.atualizado_em || '--'}
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
                                            Status
                                        </span>

                                        <span
                                            className={`
                                                ${css.statusBadge}
                                                ${
                                                modeloSelecionado.ativo
                                                    ? css.ativo
                                                    : css.inativo
                                            }
                                            `}
                                        >
                                            {
                                                modeloSelecionado.ativo
                                                    ? 'Ativo'
                                                    : 'Inativo'
                                            }
                                        </span>

                                    </div>


                                    <div
                                        className={
                                            css.itemDadoInteiro
                                        }
                                    >

                                        <span
                                            className={
                                                css.rotulo
                                            }
                                        >
                                            Descrição
                                        </span>

                                        <span>

                                            {
                                                modeloSelecionado.descricao
                                                ||
                                                'Nenhuma descrição informada.'
                                            }

                                        </span>

                                    </div>

                                </div>


                                {/* =================================================
                                    PREVIEW DO DOCUMENTO
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
                                                baixarModelo(
                                                    modeloSelecionado
                                                )
                                            }
                                        >
                                            Baixar documento
                                        </button>

                                    </div>


                                    {/* CARREGANDO */}

                                    {carregandoPreview && (

                                        <div
                                            className={
                                                css.carregandoPreviewModal
                                            }
                                        >
                                            Preparando documento...
                                        </div>

                                    )}


                                    {/* ERRO */}

                                    {erroPreview && (

                                        <div
                                            className={
                                                css.erroPreviewModal
                                            }
                                        >
                                            {erroPreview}
                                        </div>

                                    )}


                                    {/* DOCUMENTO */}

                                    {!erroPreview && (

                                        <div
                                            className={
                                                css.fundoPreviewModal
                                            }
                                        >

                                            <div
                                                id="preview-modelo-lista"
                                                className={
                                                    css.documentoPreviewModal
                                                }
                                            />

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    AÇÕES
                                ================================================= */}

                                <div
                                    className={
                                        css.botoesModal
                                    }
                                >

                                    <button
                                        className={
                                            css.botaoSecundario
                                        }
                                        type="button"
                                        onClick={() =>
                                            alternarStatus(
                                                modeloSelecionado
                                            )
                                        }
                                    >

                                        {
                                            modeloSelecionado.ativo
                                                ? 'Inativar'
                                                : 'Ativar'
                                        }

                                    </button>


                                    <button
                                        className={
                                            css.botaoPrincipal
                                        }
                                        type="button"
                                        onClick={
                                            iniciarEdicao
                                        }
                                    >
                                        Editar
                                    </button>

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}