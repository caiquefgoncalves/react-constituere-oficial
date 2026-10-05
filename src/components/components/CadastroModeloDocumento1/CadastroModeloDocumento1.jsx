import React, {
    useEffect,
    useState
} from 'react';

import css from './CadastroModeloDocumento1.module.css';

import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    renderAsync
} from 'docx-preview';


export default function CadastroModeloDocumento1({ api }) {

    const navigate = useNavigate();

    const { id } = useParams();

    const API_URL =
        api || 'http://10.92.11.22:5000';


    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const [nome, setNome] =
        useState('');

    const [tipo, setTipo] =
        useState('');

    const [descricao, setDescricao] =
        useState('');

    const [arquivo, setArquivo] =
        useState(null);


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
    // MODAL DE AJUDA
    // =====================================================

    const [
        modalFormatoAberto,
        setModalFormatoAberto
    ] = useState(false);

    const [
        copiado,
        setCopiado
    ] = useState('');


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

    const [
        variaveisReconhecidas,
        setVariaveisReconhecidas
    ] = useState([]);

    const [
        variaveisNaoReconhecidas,
        setVariaveisNaoReconhecidas
    ] = useState([]);


    // =====================================================
    // CADASTRO
    // =====================================================

    const [
        cadastrando,
        setCadastrando
    ] = useState(false);


    // =====================================================
    // VARIÁVEIS DISPONÍVEIS
    // =====================================================

    const gruposVariaveis = [

        {
            titulo: 'Cliente',

            variaveis: [

                {
                    nome: 'Nome completo',
                    valor: '{{cliente.nome}}'
                },

                {
                    nome: 'CPF',
                    valor: '{{cliente.cpf}}'
                },

                {
                    nome: 'CNPJ',
                    valor: '{{cliente.cnpj}}'
                },

                {
                    nome: 'RG',
                    valor: '{{cliente.rg}}'
                },

                {
                    nome: 'Órgão expedidor',
                    valor: '{{cliente.orgao_expedidor}}'
                },

                {
                    nome: 'Nacionalidade',
                    valor: '{{cliente.nacionalidade}}'
                },

                {
                    nome: 'Estado civil',
                    valor: '{{cliente.estado_civil}}'
                },

                {
                    nome: 'Profissão',
                    valor: '{{cliente.profissao}}'
                },

                {
                    nome: 'E-mail',
                    valor: '{{cliente.email}}'
                },

                {
                    nome: 'Telefone',
                    valor: '{{cliente.telefone}}'
                },

                {
                    nome: 'CEP',
                    valor: '{{cliente.cep}}'
                },

                {
                    nome: 'Logradouro',
                    valor: '{{cliente.logradouro}}'
                },

                {
                    nome: 'Número',
                    valor: '{{cliente.numero}}'
                },

                {
                    nome: 'Complemento',
                    valor: '{{cliente.complemento}}'
                },

                {
                    nome: 'Bairro',
                    valor: '{{cliente.bairro}}'
                },

                {
                    nome: 'Cidade',
                    valor: '{{cliente.cidade}}'
                },

                {
                    nome: 'Estado',
                    valor: '{{cliente.estado}}'
                }

            ]
        },

        {
            titulo: 'Processo',

            variaveis: [

                {
                    nome: 'Número do processo',
                    valor: '{{processo.numero}}'
                },

                {
                    nome: 'Tipo',
                    valor: '{{processo.tipo}}'
                },

                {
                    nome: 'Assunto',
                    valor: '{{processo.assunto}}'
                },

                {
                    nome: 'Área',
                    valor: '{{processo.area}}'
                },

                {
                    nome: 'Comarca',
                    valor: '{{processo.comarca}}'
                },

                {
                    nome: 'Vara',
                    valor: '{{processo.vara}}'
                },

                {
                    nome: 'Instância',
                    valor: '{{processo.instancia}}'
                },

                {
                    nome: 'Data de início',
                    valor: '{{processo.data_inicio}}'
                }

            ]
        },

        {
            titulo: 'Advogado',

            variaveis: [

                {
                    nome: 'Nome',
                    valor: '{{advogado.nome}}'
                },

                {
                    nome: 'OAB',
                    valor: '{{advogado.oab}}'
                },

                {
                    nome: 'E-mail',
                    valor: '{{advogado.email}}'
                },

                {
                    nome: 'Telefone',
                    valor: '{{advogado.telefone}}'
                }

            ]
        },

        {
            titulo: 'Escritório',

            variaveis: [

                {
                    nome: 'Nome fantasia',
                    valor: '{{escritorio.nome_fantasia}}'
                },

                {
                    nome: 'Razão social',
                    valor: '{{escritorio.razao_social}}'
                },

                {
                    nome: 'CNPJ',
                    valor: '{{escritorio.cnpj}}'
                },

                {
                    nome: 'Telefone',
                    valor: '{{escritorio.telefone}}'
                },

                {
                    nome: 'E-mail',
                    valor: '{{escritorio.email}}'
                }

            ]
        }

    ];


    // =====================================================
    // MOSTRAR MENSAGEM
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
            window.timeoutMensagemCadastroModelo
        ) {

            clearTimeout(
                window.timeoutMensagemCadastroModelo
            );
        }


        window.timeoutMensagemCadastroModelo =
            setTimeout(() => {

                setMensagem('');

                setTipoMensagem('');

            }, 6000);


        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });
    }


    // =====================================================
    // VOLTAR
    // =====================================================

    function voltar() {

        navigate(
            `/escritorio/${id}/modelos_documentos`
        );
    }


    // =====================================================
    // ARQUIVO
    // =====================================================

    function handleArquivo(e) {

        const selecionado =
            e.target.files?.[0];


        if (!selecionado) {

            setArquivo(null);

            setVariaveisReconhecidas([]);

            setVariaveisNaoReconhecidas([]);

            setErroPreview('');

            return;
        }


        const nomeArquivo =
            selecionado.name
                .toLowerCase()
                .trim();


        if (
            !nomeArquivo.endsWith(
                '.docx'
            )
        ) {

            mostrarMensagem(
                'Selecione um arquivo no formato .docx.'
            );


            e.target.value = '';


            setArquivo(
                null
            );


            return;
        }


        setArquivo(
            selecionado
        );
    }


    // =====================================================
    // GERAR PREVIEW QUANDO SELECIONAR O ARQUIVO
    // =====================================================

    useEffect(() => {

        if (!arquivo) {

            return;
        }


        visualizarDocumento(
            arquivo
        );

    }, [arquivo]);


    // =====================================================
    // PREVIEW DO WORD
    // =====================================================

    async function visualizarDocumento(
        arquivoSelecionado
    ) {

        setCarregandoPreview(
            true
        );

        setErroPreview('');

        setVariaveisReconhecidas([]);

        setVariaveisNaoReconhecidas([]);


        try {

            /*
             * Dá um pequeno tempo para o React
             * criar o container do preview.
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
                    'preview-documento'
                );


            if (!container) {

                return;
            }


            container.innerHTML = '';


            await renderAsync(

                arquivoSelecionado,

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


            verificarVariaveis(
                container.innerText
                ||
                container.textContent
                ||
                ''
            );


        } catch (erro) {

            console.error(
                'Erro ao gerar preview:',
                erro
            );


            setErroPreview(
                'Não foi possível visualizar este documento.'
            );


        } finally {

            setCarregandoPreview(
                false
            );

        }
    }


    // =====================================================
    // VERIFICAR VARIÁVEIS DO DOCUMENTO
    // =====================================================

    function verificarVariaveis(
        textoDocumento
    ) {

        const variaveisPermitidas =
            gruposVariaveis.flatMap(
                grupo =>
                    grupo.variaveis.map(
                        item =>
                            item.valor
                    )
            );


        /*
         * Procura tudo que estiver
         * no formato {{alguma.coisa}}
         */

        const encontradas =
            textoDocumento.match(
                /\{\{[^{}]+\}\}/g
            )
            || [];


        const semRepeticao =
            [...new Set(
                encontradas
            )];


        const reconhecidas =
            semRepeticao.filter(
                variavel =>
                    variaveisPermitidas
                        .includes(
                            variavel
                        )
            );


        const naoReconhecidas =
            semRepeticao.filter(
                variavel =>
                    !variaveisPermitidas
                        .includes(
                            variavel
                        )
            );


        setVariaveisReconhecidas(
            reconhecidas
        );


        setVariaveisNaoReconhecidas(
            naoReconhecidas
        );
    }


    // =====================================================
    // COPIAR VARIÁVEL
    // =====================================================

    async function copiarVariavel(
        valor
    ) {

        try {

            await navigator.clipboard
                .writeText(
                    valor
                );


            setCopiado(
                valor
            );


            setTimeout(() => {

                setCopiado('');

            }, 1500);


        } catch (erro) {

            console.error(
                'Erro ao copiar variável:',
                erro
            );


            mostrarMensagem(
                'Não foi possível copiar a variável.'
            );
        }
    }


    // =====================================================
    // CADASTRAR MODELO
    // =====================================================

    async function handleCadastro(e) {

        e.preventDefault();


        const camposFaltando = [];


        if (!nome.trim()) {

            camposFaltando.push(
                'Nome do modelo'
            );
        }


        if (!tipo) {

            camposFaltando.push(
                'Tipo do documento'
            );
        }


        if (!arquivo) {

            camposFaltando.push(
                'Arquivo do documento'
            );
        }


        if (
            camposFaltando.length > 0
        ) {

            mostrarMensagem(
                `Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`
            );

            return;
        }


        /*
         * Não deixa cadastrar se houver
         * uma variável escrita errada.
         */

        if (
            variaveisNaoReconhecidas.length > 0
        ) {

            mostrarMensagem(
                'Existem variáveis não reconhecidas no documento. Corrija o arquivo antes de cadastrar.'
            );

            return;
        }


        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            mostrarMensagem(
                'Sessão expirada. Faça login novamente.'
            );

            return;
        }


        const formData =
            new FormData();


        formData.append(
            'nome',
            nome.trim()
        );


        formData.append(
            'tipo',
            tipo
        );


        formData.append(
            'descricao',
            descricao.trim()
        );


        formData.append(
            'arquivo',
            arquivo
        );


        setCadastrando(
            true
        );


        try {

            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos`,

                    {

                        method:
                            'POST',

                        credentials:
                            'include',

                        headers: {

                            'X-Access-Token':
                            token
                        },

                        body:
                        formData

                    }

                );


            let resultado = {};


            try {

                resultado =
                    await response.json();

            } catch {

                resultado = {};

            }


            if (!response.ok) {

                mostrarMensagem(
                    resultado.error
                    ||
                    'Erro ao cadastrar modelo.'
                );

                return;
            }


            mostrarMensagem(
                resultado.mensagem
                ||
                'Modelo cadastrado com sucesso!',
                'sucesso'
            );


            setTimeout(() => {

                navigate(
                    `/escritorio/${id}/modelos_documentos`
                );

            }, 1200);


        } catch (erro) {

            console.error(
                'Erro ao cadastrar modelo:',
                erro
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );


        } finally {

            setCadastrando(
                false
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


            <section
                className={
                    css.containerSection
                }
            >

                {/* =================================================
                    TOPO
                ================================================= */}

                <div
                    className={
                        css.topArea
                    }
                >

                    <button
                        className={
                            css.botaoVoltar
                        }
                        onClick={
                            voltar
                        }
                        type="button"
                        aria-label="Voltar"
                    >

                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >

                            <path
                                d="M15 18L9 12L15 6"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                        </svg>

                    </button>


                    <h1
                        className={
                            css.titulo
                        }
                    >
                        Cadastre o modelo
                    </h1>

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
                    FORMULÁRIO
                ================================================= */}

                <form
                    className={
                        css.formulario
                    }
                    onSubmit={
                        handleCadastro
                    }
                >

                    <div
                        className={
                            css.linha
                        }
                    >

                        {/* NOME */}

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
                                Nome do modelo *
                            </label>


                            <input
                                className={
                                    css.input
                                }
                                type="text"
                                placeholder="Ex: Contrato padrão"
                                value={
                                    nome
                                }
                                onChange={(e) =>
                                    setNome(
                                        e.target.value
                                    )
                                }
                                maxLength={150}
                                name="nome-modelo"
                            />

                        </div>


                        {/* TIPO */}

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
                                Tipo do documento *
                            </label>


                            <select
                                className={
                                    css.input
                                }
                                value={
                                    tipo
                                }
                                onChange={(e) =>
                                    setTipo(
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
                                css.campoMetade
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
                                    css.textareaDescricao
                                }
                                placeholder="Digite uma breve descrição do modelo"
                                value={
                                    descricao
                                }
                                onChange={(e) =>
                                    setDescricao(
                                        e.target.value
                                    )
                                }
                                maxLength={500}
                                name="descricao-modelo"
                            />

                            <p
                                className={
                                    css.camposObrigatorios
                                }
                            >
                                * Campos obrigatórios
                            </p>


                        </div>


                        {/* ARQUIVO */}

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
                                Arquivo do documento *
                            </label>


                            <div
                                className={
                                    css.areaArquivo
                                }
                            >

                                <input
                                    className={
                                        css.inputFile
                                    }
                                    type="file"
                                    accept=".docx"
                                    onChange={
                                        handleArquivo
                                    }
                                    name="arquivo-modelo"
                                />

                            </div>


                            <button
                                type="button"
                                className={
                                    css.linkFormato
                                }
                                onClick={() =>
                                    setModalFormatoAberto(
                                        true
                                    )
                                }
                            >
                                Confira aqui o formato do arquivo!
                            </button>

                        </div>

                    </div>

                    {/* =================================================
                        PREVIEW
                    ================================================= */}

                    {arquivo && (

                        <section
                            className={
                                css.areaPreview
                            }
                        >

                            <div
                                className={
                                    css.cabecalhoPreview
                                }
                            >

                                <div>

                                    <h2
                                        className={
                                            css.tituloPreview
                                        }
                                    >
                                        Pré-visualização
                                    </h2>

                                </div>


                                <span
                                    className={
                                        css.nomeArquivoPreview
                                    }
                                >
                                    {arquivo.name}
                                </span>

                            </div>


                            {
                                !carregandoPreview
                                &&
                                !erroPreview
                                &&
                                (

                                    <div
                                        className={
                                            css.resumoVariaveis
                                        }
                                    >

                                        <div
                                            className={
                                                css.variaveisCorretas
                                            }
                                        >

                                            <span>
                                                ✓
                                            </span>

                                            <span>

                                                {
                                                    variaveisReconhecidas.length
                                                }

                                                {' '}

                                                {
                                                    variaveisReconhecidas.length === 1
                                                        ? 'variável reconhecida'
                                                        : 'variáveis reconhecidas'
                                                }

                                            </span>

                                        </div>


                                        {
                                            variaveisNaoReconhecidas.length > 0
                                            &&
                                            (

                                                <div
                                                    className={
                                                        css.variaveisErradas
                                                    }
                                                >

                                                    <span>
                                                        ⚠
                                                    </span>

                                                    <span>

                                                        {
                                                            variaveisNaoReconhecidas.length
                                                        }

                                                        {' '}

                                                        {
                                                            variaveisNaoReconhecidas.length === 1
                                                                ? 'variável não reconhecida'
                                                                : 'variáveis não reconhecidas'
                                                        }

                                                    </span>

                                                </div>

                                            )
                                        }

                                    </div>

                                )
                            }


                            {/* VARIÁVEIS COM ERRO */}

                            {
                                variaveisNaoReconhecidas.length > 0
                                &&
                                (

                                    <div
                                        className={
                                            css.avisoVariaveis
                                        }
                                    >

                                        <strong>
                                            Corrija estas variáveis antes de cadastrar:
                                        </strong>


                                        <div
                                            className={
                                                css.listaVariaveisErro
                                            }
                                        >

                                            {
                                                variaveisNaoReconhecidas
                                                    .map(
                                                        variavel => (

                                                            <code
                                                                key={
                                                                    variavel
                                                                }
                                                            >
                                                                {
                                                                    variavel
                                                                }
                                                            </code>

                                                        )
                                                    )
                                            }

                                        </div>

                                    </div>

                                )
                            }


                            {/* CARREGANDO */}

                            {carregandoPreview && (

                                <div
                                    className={
                                        css.carregandoPreview
                                    }
                                >
                                    Preparando pré-visualização...
                                </div>

                            )}


                            {/* ERRO */}

                            {erroPreview && (

                                <div
                                    className={
                                        css.erroPreview
                                    }
                                >
                                    {erroPreview}
                                </div>

                            )}


                            {/* DOCUMENTO */}

                            <div
                                className={
                                    css.fundoPreview
                                }
                            >

                                <div
                                    id="preview-documento"
                                    className={
                                        css.documentoPreview
                                    }
                                />

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        BOTÃO CADASTRAR
                    ================================================= */}

                    <div
                        className={
                            css.botaoContainer
                        }
                    >

                        <button
                            className={
                                css.botaoCadastro
                            }
                            type="submit"
                            name="btn-cadastrar-modelo"
                            disabled={
                                cadastrando
                                ||
                                carregandoPreview
                                ||
                                variaveisNaoReconhecidas.length > 0
                            }
                        >

                            {
                                cadastrando
                                    ? 'Cadastrando...'
                                    : 'Cadastrar modelo'
                            }

                        </button>

                    </div>

                </form>

            </section>


            <Footer />


            {/* =====================================================
                MODAL - COMO PREPARAR O DOCUMENTO
            ===================================================== */}

            {modalFormatoAberto && (

                <div
                    className={
                        css.overlayModal
                    }
                    onClick={() =>
                        setModalFormatoAberto(
                            false
                        )
                    }
                >

                    <div
                        className={
                            css.modalFormato
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className={
                                css.botaoFecharModal
                            }
                            onClick={() =>
                                setModalFormatoAberto(
                                    false
                                )
                            }
                            aria-label="Fechar"
                        >
                            ×
                        </button>


                        <div
                            className={
                                css.cabecalhoModal
                            }
                        >

                            <h2
                                className={
                                    css.tituloModal
                                }
                            >
                                Como preparar seu documento?
                            </h2>


                            <p
                                className={
                                    css.subtituloModal
                                }
                            >
                                Prepare normalmente seu documento no Word e indique quais informações devem ser preenchidas automaticamente pelo Constituere utilizando as variáveis abaixo.
                            </p>

                        </div>


                        {/* FORMATO */}

                        <div
                            className={
                                css.avisoFormato
                            }
                        >

                            <div
                                className={
                                    css.iconeWord
                                }
                            >
                                DOCX
                            </div>


                            <div>

                                <strong>
                                    Formato do arquivo
                                </strong>


                                <p>
                                    O documento deve estar no formato
                                    <strong>
                                        {' '}.docx
                                    </strong>
                                    . Você pode manter normalmente sua formatação, logotipo, cabeçalho, rodapé, assinaturas, tabelas e demais elementos do Word.
                                </p>

                            </div>

                        </div>

                        {/* VARIÁVEIS */}

                        <div
                            className={
                                css.areaVariaveisModal
                            }
                        >

                            <h3
                                className={
                                    css.tituloVariaveisModal
                                }
                            >
                                Variáveis disponíveis
                            </h3>


                            <p
                                className={
                                    css.explicacaoVariaveis
                                }
                            >
                                Clique em uma variável para copiá-la e depois cole no local desejado do documento.
                            </p>


                            {
                                gruposVariaveis.map(
                                    grupo => (

                                        <div
                                            className={
                                                css.grupoModal
                                            }
                                            key={
                                                grupo.titulo
                                            }
                                        >

                                            <h4
                                                className={
                                                    css.tituloGrupoModal
                                                }
                                            >
                                                {
                                                    grupo.titulo
                                                }
                                            </h4>


                                            <div
                                                className={
                                                    css.gradeVariaveis
                                                }
                                            >

                                                {
                                                    grupo.variaveis
                                                        .map(
                                                            item => (

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        css.variavelModal
                                                                    }
                                                                    key={
                                                                        item.valor
                                                                    }
                                                                    onClick={() =>
                                                                        copiarVariavel(
                                                                            item.valor
                                                                        )
                                                                    }
                                                                >

                                                                    <div
                                                                        className={
                                                                            css.infoVariavel
                                                                        }
                                                                    >

                                                                        <span
                                                                            className={
                                                                                css.nomeVariavelModal
                                                                            }
                                                                        >
                                                                            {
                                                                                item.nome
                                                                            }
                                                                        </span>


                                                                        <code
                                                                            className={
                                                                                css.codigoVariavelModal
                                                                            }
                                                                        >
                                                                            {
                                                                                item.valor
                                                                            }
                                                                        </code>

                                                                    </div>


                                                                    <span
                                                                        className={
                                                                            css.textoCopiar
                                                                        }
                                                                    >

                                                                        {
                                                                            copiado === item.valor
                                                                                ? 'Copiado!'
                                                                                : 'Copiar'
                                                                        }

                                                                    </span>

                                                                </button>

                                                            )
                                                        )
                                                }

                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>


                        <div
                            className={
                                css.rodapeModal
                            }
                        >

                            <button
                                type="button"
                                className={
                                    css.botaoEntendi
                                }
                                onClick={() =>
                                    setModalFormatoAberto(
                                        false
                                    )
                                }
                            >
                                Entendi
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}