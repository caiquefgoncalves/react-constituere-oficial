// CADASTRO DE MODELOS | Interface React do Constituere
// Esta página permite cadastrar um modelo Word que será preenchido
// automaticamente com dados de clientes, processos e advogados.
// Fluxo: preencher formulário -> selecionar Word -> conferir variáveis
// -> enviar modelo à API -> voltar à lista de modelos.
//
// React monta a interface; useState guarda valores que podem mudar;
// useEffect executa ações quando determinadas informações são alteradas.
import React, {
    useEffect,
    useState
} from 'react';

// O CSS Module reúne estilos desta página. O objeto css associa
// cada classe a um nome específico, evitando conflito com outras telas.
import css from './CadastroModeloDocumento1.module.css';

// Header e Footer são componentes compartilhados do sistema:
// o cabeçalho e o rodapé aparecem junto ao conteúdo da página.
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';

// React Router controla a navegação sem precisar recarregar o site.
// useNavigate muda de tela; useParams lê parâmetros da URL.
import {
    useNavigate,
    useParams
} from 'react-router-dom';

// docx-preview converte o conteúdo do arquivo Word em elementos
// visuais para exibi-lo diretamente no navegador.
import {
    renderAsync
} from 'docx-preview';


// Componente principal da página. A propriedade api pode fornecer
// o endereço do servidor, separando a interface da API Flask.
export default function CadastroModeloDocumento1({ api }) {

    // navigate é a função utilizada para mudar de página.
    const navigate = useNavigate();

    // Extrai o id presente na rota atual: neste caso, o escritório
    // no qual o modelo será cadastrado.
    const { id } = useParams();

    // Usa o endereço de API recebido por propriedade ou, se não vier
    // nenhum, o endereço local definido para o desenvolvimento.
    const API_URL =
        api || 'http://10.92.11.21:5000';




    // ESTADOS DO FORMULÁRIO
    // useState(valorInicial) cria um valor controlado pelo React.
    // O primeiro item contém o valor atual; o segundo o atualiza.
    // Ao chamar um setter como setNome, o React atualiza a tela.
    const [nome, setNome] =
        useState('');

    // Guarda o tipo escolhido: contrato, petição ou declaração.
    const [tipo, setTipo] =
        useState('');

    // Armazena a descrição opcional digitada no formulário.
    const [descricao, setDescricao] =
        useState('');

    // Guarda o arquivo Word selecionado. null significa nenhum arquivo.
    const [arquivo, setArquivo] =
        useState(null);




    // ESTADOS DE MENSAGEM
    // mensagem guarda o texto do aviso exibido na página.
    const [mensagem, setMensagem] =
        useState('');

    // tipoMensagem indica se o aviso será exibido como sucesso ou erro.
    const [
        tipoMensagem,
        setTipoMensagem
    ] = useState('');




    // ESTADOS DE INTERAÇÃO
    // Controla se o modal de instruções está aberto (true) ou fechado (false).
    const [
        modalFormatoAberto,
        setModalFormatoAberto
    ] = useState(false);

    // Guarda a última variável copiada para mudar temporariamente
    // o texto do botão de "Copiar" para "Copiado!".
    const [
        copiado,
        setCopiado
    ] = useState('');




    // ESTADOS DA PRÉ-VISUALIZAÇÃO
    // Indica quando o navegador está processando o arquivo Word.
    const [
        carregandoPreview,
        setCarregandoPreview
    ] = useState(false);

    // Armazena uma possível mensagem de erro ao visualizar o documento.
    const [
        erroPreview,
        setErroPreview
    ] = useState('');

    // Lista as variáveis presentes no Word e aceitas pelo sistema.
    const [
        variaveisReconhecidas,
        setVariaveisReconhecidas
    ] = useState([]);

    // Lista as variáveis encontradas no Word que não estão cadastradas
    // como opções válidas. Elas impedem o envio do modelo.
    const [
        variaveisNaoReconhecidas,
        setVariaveisNaoReconhecidas
    ] = useState([]);




    // ESTADO DO ENVIO
    // Fica true enquanto o formulário é enviado, evitando cliques repetidos.
    const [
        cadastrando,
        setCadastrando
    ] = useState(false);




    // CATÁLOGO DE VARIÁVEIS ACEITAS PELO SISTEMA
    // Cada grupo tem um título e uma lista de itens com nome e valor.
    // O nome aparece na tela; o valor, como {{cliente.nome}}, deve ser
    // colocado no Word para substituição automática pela API.
    // As mesmas definições alimentam o modal e a validação do arquivo.
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

            // Variáveis com informações do processo judicial cadastrado.
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

            // Variáveis com os dados do advogado responsável pelo processo.
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

            // Variáveis com as informações cadastrais do escritório.
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
                },

                {
                    nome: 'Cidade',
                    valor: '{{escritorio.cidade}}'
                },

                {
                    nome: 'Estado',
                    valor: '{{escritorio.estado}}'
                },

                {
                    nome: 'CEP',
                    valor: '{{escritorio.cep}}'
                },

            ]
        },

        {

            // Variáveis usadas para inserir dia, mês, ano ou data completa.
            titulo: 'Data',
            variaveis: [
                {
                    nome: 'Data completa',
                    valor: '{{data.completa}}'
                },

                {
                    nome: 'Dia',
                    valor: '{{data.dia}}'
                },
                {
                    nome: 'Mês',
                    valor: '{{data.mes}}'
                },
                {
                    nome: 'Ano',
                    valor: '{{data.ano}}'
                }

            ]}

    ];



    // MENSAGENS AO USUÁRIO
    // Centraliza os avisos de sucesso ou erro.
    // O parâmetro tipo usa "erro" por padrão quando não é informado.
    function mostrarMensagem(
        texto,
        tipo = 'erro'
    ) {

        // Atualiza o conteúdo e o estilo do aviso na interface.
        setMensagem(
            texto
        );

        setTipoMensagem(
            tipo
        );


        // Se já existe um prazo para esconder uma mensagem anterior,
        // clearTimeout cancela esse prazo para não apagar o aviso novo cedo demais.
        if (
            window.timeoutMensagemCadastroModelo
        ) {

            clearTimeout(
                window.timeoutMensagemCadastroModelo
            );
        }


        // setTimeout agenda a limpeza da mensagem após 6.000 ms (6 segundos).
        // O identificador fica em window para ser reutilizado na próxima mensagem.
        window.timeoutMensagemCadastroModelo =
            setTimeout(() => {

                setMensagem('');

                setTipoMensagem('');

            }, 6000);


        // Leva suavemente a página ao topo, onde o aviso é exibido.
        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });
    }




    // NAVEGAÇÃO
    // Retorna para a lista de modelos do escritório atual.
    function voltar() {

        navigate(
            `/escritorio/${id}/modelos_documentos`
        );
    }




    // SELEÇÃO E VALIDAÇÃO DO ARQUIVO
    // Esta função é chamada sempre que o usuário escolhe um arquivo.
    // O argumento e representa o evento disparado pelo campo de upload.
    function handleArquivo(e) {

        // e.target.files contém os arquivos selecionados.
        // O ?. evita erro se a lista não existir; [0] pega o primeiro arquivo.
        const selecionado =
            e.target.files?.[0];


        // Se a seleção foi cancelada, limpa o arquivo, as listas de variáveis
        // e qualquer erro anterior. return encerra a função nesse ponto.
        if (!selecionado) {

            setArquivo(null);

            setVariaveisReconhecidas([]);

            setVariaveisNaoReconhecidas([]);

            setErroPreview('');

            return;
        }


        // Padroniza o nome em minúsculas e remove espaços nas extremidades
        // antes de verificar sua extensão.
        const nomeArquivo =
            selecionado.name
                .toLowerCase()
                .trim();


        // endsWith verifica se o nome termina em .docx.
        // O sinal ! inverte a condição: entra neste bloco se não for Word.
        if (
            !nomeArquivo.endsWith(
                '.docx'
            )
        ) {

            mostrarMensagem(
                'Selecione um arquivo no formato .docx.'
            );


            // Limpa o campo de upload para não manter um arquivo inválido.
            e.target.value = '';


            setArquivo(
                null
            );


            return;
        }


        // Um arquivo válido é salvo no estado; isso ativa o useEffect abaixo.
        setArquivo(
            selecionado
        );
    }




    // PRÉ-VISUALIZAÇÃO AUTOMÁTICA
    // useEffect executa esta ação quando o estado arquivo mudar.
    // A lista [arquivo] impede que a visualização rode a cada atualização
    // de qualquer outro campo do formulário.
    useEffect(() => {

        // Sem arquivo, não existe documento a processar.
        if (!arquivo) {

            return;
        }


        // Chama a função que desenha o Word e analisa as suas variáveis.
        visualizarDocumento(
            arquivo
        );

    }, [arquivo]);




    // PREPARAÇÃO DO DOCUMENTO WORD
    // async permite usar await para aguardar tarefas assíncronas
    // sem bloquear a interface enquanto o navegador processa o arquivo.
    async function visualizarDocumento(
        arquivoSelecionado
    ) {

        // Ativa o indicador de carregamento e limpa dados da análise anterior.
        setCarregandoPreview(
            true
        );

        setErroPreview('');

        setVariaveisReconhecidas([]);

        setVariaveisNaoReconhecidas([]);


        // try executa as etapas de visualização; catch trata falhas;
        // finally executa a limpeza do estado de carregamento em ambos os casos.
        try {


            // Aguarda 50 milissegundos para dar tempo de o React montar
            // o elemento que receberá a pré-visualização do documento.
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );


            // Procura pelo id do elemento HTML reservado ao documento.
            // document.getElementById localiza esse elemento na página.
            const container =
                document.getElementById(
                    'preview-documento'
                );


            // Se a área de visualização não estiver na tela, interrompe a ação.
            if (!container) {

                return;
            }


            // Remove a visualização anterior antes de desenhar outro arquivo.
            container.innerHTML = '';


            // renderAsync lê o Word e monta a prévia dentro do container.
            // As opções preservam quebras de página, cabeçalhos, rodapés, notas,
            // dimensões e fontes sempre que a biblioteca conseguir representá-los.
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


            // Após renderizar, lê o texto visível para localizar expressões
            // como {{cliente.nome}}. O operador || utiliza a primeira opção disponível.
            verificarVariaveis(
                container.innerText
                ||
                container.textContent
                ||
                ''
            );


            // Em caso de falha, registra detalhes no console do navegador
            // e prepara uma mensagem amigável para o usuário.
        } catch (erro) {

            console.error(
                'Erro ao gerar preview:',
                erro
            );


            setErroPreview(
                'Não foi possível visualizar este documento.'
            );


            // Desliga o carregamento mesmo que a visualização tenha falhado.
        } finally {

            setCarregandoPreview(
                false
            );

        }
    }




    // CONFERÊNCIA DAS VARIÁVEIS DO WORD
    // Compara os campos escritos no documento com o catálogo autorizado.
    // Essa análise é feita no texto extraído da pré-visualização.
    function verificarVariaveis(
        textoDocumento
    ) {


        // flatMap percorre os grupos e reúne seus valores em uma única lista.
        // O map interno seleciona o campo valor de cada variável.
        const variaveisPermitidas =
            gruposVariaveis.flatMap(
                grupo =>
                    grupo.variaveis.map(
                        item =>
                            item.valor
                    )
            );



        // match usa uma expressão regular para encontrar textos entre {{ e }}.
        // A opção g procura todas as ocorrências; || [] evita resultado nulo.
        const encontradas =
            textoDocumento.match(
                /\{\{[^{}]+\}\}/g
            )
            || [];


        // Set elimina repetições, e o operador ... transforma os itens
        // únicos novamente em array. Cada variável é contada uma vez só.
        const semRepeticao =
            [...new Set(
                encontradas
            )];


        // filter mantém apenas os nomes que aparecem na lista permitida;
        // includes verifica se cada nome está nessa lista.
        const reconhecidas =
            semRepeticao.filter(
                variavel =>
                    variaveisPermitidas
                        .includes(
                            variavel
                        )
            );


        // Com !includes, o filtro separa os nomes que não são aceitos.
        const naoReconhecidas =
            semRepeticao.filter(
                variavel =>
                    !variaveisPermitidas
                        .includes(
                            variavel
                        )
            );


        // Salva os dois resultados em estados para atualizar os indicadores
        // na tela e controlar se o cadastro pode ser concluído.
        setVariaveisReconhecidas(
            reconhecidas
        );


        setVariaveisNaoReconhecidas(
            naoReconhecidas
        );
    }




    // CÓPIA DE VARIÁVEIS
    // Permite copiar uma expressão pronta do modal, evitando digitá-la
    // manualmente no Word e reduzindo erros de escrita.
    async function copiarVariavel(
        valor
    ) {

        try {

            // A API clipboard do navegador grava o texto na área de transferência.
            // await aguarda a conclusão da operação.
            await navigator.clipboard
                .writeText(
                    valor
                );


            // Guarda a expressão copiada, usada para mostrar "Copiado!" no botão.
            setCopiado(
                valor
            );


            // Após 1,5 segundo, remove a confirmação visual de cópia.
            setTimeout(() => {

                setCopiado('');

            }, 1500);


            // Caso a cópia não seja permitida pelo navegador, exibe um aviso.
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




    // CADASTRO DO MODELO NA API
    // Esta função é chamada quando o formulário é enviado.
    // Primeiro valida os campos e as variáveis; depois envia o Word ao servidor.
    async function handleCadastro(e) {

        // preventDefault evita que o navegador recarregue a página
        // ao enviar o formulário, deixando o React controlar a operação.
        e.preventDefault();


        // O array camposFaltando vai reunir os nomes dos campos obrigatórios
        // que ainda não foram preenchidos.
        const camposFaltando = [];


        // trim remove espaços em branco; !nome.trim() identifica um nome vazio.
        if (!nome.trim()) {

            camposFaltando.push(
                'Nome do modelo'
            );
        }


        // Confere se o usuário escolheu um tipo de documento.
        if (!tipo) {

            camposFaltando.push(
                'Tipo do documento'
            );
        }


        // Confere se já existe um arquivo Word selecionado.
        if (!arquivo) {

            camposFaltando.push(
                'Arquivo do documento'
            );
        }


        // Se algum campo estiver faltando, join monta uma mensagem
        // com os nomes separados por vírgulas e encerra o envio.
        if (
            camposFaltando.length > 0
        ) {

            mostrarMensagem(
                `Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`
            );

            return;
        }




        // Bloqueia modelos com variáveis que o sistema não reconhece.
        // O arquivo precisa ser corrigido antes do cadastro.
        if (
            variaveisNaoReconhecidas.length > 0
        ) {

            mostrarMensagem(
                'Existem variáveis não reconhecidas no documento. Corrija o arquivo antes de cadastrar.'
            );

            return;
        }


        // Busca no armazenamento do navegador o token da sessão.
        // Ele identifica o usuário autenticado para a API.
        const token =
            localStorage.getItem(
                'token'
            );


        // Sem token, não é possível autorizar a solicitação de cadastro.
        if (!token) {

            mostrarMensagem(
                'Sessão expirada. Faça login novamente.'
            );

            return;
        }


        // FormData prepara os campos e o arquivo para envio em uma única
        // requisição HTTP, no formato apropriado para upload.
        const formData =
            new FormData();


        // append acrescenta cada informação ao formulário enviado à API.
        // Os nomes das chaves devem corresponder aos esperados pelo Flask.
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


        // Inclui o arquivo Word propriamente dito, além dos campos de texto.
        formData.append(
            'arquivo',
            arquivo
        );


        // Ativa o estado de envio; o botão ficará temporariamente desabilitado.
        setCadastrando(
            true
        );


        try {

            // fetch envia uma solicitação HTTP POST para a rota de cadastro
            // do escritório indicado por id. await aguarda a resposta do servidor.
            const response =
                await fetch(

                    `${API_URL}/escritorio/${id}/modelos-documentos`,

                    {

                        // POST indica a criação de um novo modelo no banco de dados.
                        method:
                            'POST',

                        // credentials: include permite incluir cookies da sessão,
                        // quando aplicável às configurações do navegador e do servidor.
                        credentials:
                            'include',

                        // O cabeçalho X-Access-Token envia a credencial de acesso.
                        // O body contém o FormData com os dados e o arquivo anexado.
                        headers: {

                            'X-Access-Token':
                            token
                        },

                        body:
                        formData

                    }

                );


            // Prepara um objeto para armazenar a resposta da API.
            let resultado = {};


            // Converte a resposta JSON em objeto JavaScript. Se não houver JSON
            // válido, mantém um objeto vazio para evitar quebra na interface.
            try {

                resultado =
                    await response.json();

            } catch {

                resultado = {};

            }


            // response.ok indica se o status HTTP foi de sucesso (2xx).
            // Se a API negar a operação, exibe o erro retornado ou a mensagem padrão.
            if (!response.ok) {

                mostrarMensagem(
                    resultado.error
                    ||
                    'Erro ao cadastrar modelo.'
                );

                return;
            }


            // Quando o cadastro é aceito, mostra a confirmação de sucesso.
            mostrarMensagem(
                resultado.mensagem
                ||
                'Modelo cadastrado com sucesso!',
                'sucesso'
            );


            // Aguarda 1,2 segundo para permitir a leitura da mensagem
            // antes de retornar à lista de modelos.
            setTimeout(() => {

                navigate(
                    `/escritorio/${id}/modelos_documentos`
                );

            }, 1200);


            // catch trata falhas de rede ou outros erros durante a requisição.
        } catch (erro) {

            console.error(
                'Erro ao cadastrar modelo:',
                erro
            );


            mostrarMensagem(
                'Erro de conexão com o servidor.'
            );


            // finally libera o botão ao final da tentativa, com ou sem sucesso.
        } finally {

            setCadastrando(
                false
            );

        }
    }




    // INTERFACE DA PÁGINA (JSX)
    // return descreve os elementos que o React vai mostrar na tela.
    // JSX combina marcação semelhante a HTML com expressões JavaScript
    // entre chaves {}. className associa estilos do CSS Module.
    return (

        <div
            className={
                css.paginaCompleta
            }
        >

            {/* Cabeçalho padrão do sistema, com o endereço da API recebido. */}
            <Header
                api={API_URL}
            />


            <section
                className={
                    css.containerSection
                }
            >


                {/* Área superior com botão de retorno e título da página. */}
                <div
                    className={
                        css.topArea
                    }
                >

                    {/*
                        onClick liga o botão à função voltar; type="button" evita
                        que ele tente enviar o formulário.
                    */}
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

                        {/* Ícone de seta desenhado em SVG, sem depender de uma imagem externa. */}
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




                {/*
                    Renderização condicional: mensagem && só mostra este aviso
                    quando existe texto no estado mensagem. A classe varia por tipo.
                */}
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




                {/*
                    O envio do formulário chama handleCadastro pelo onSubmit.
                    Isso também funciona quando a pessoa usa Enter para confirmar.
                */}
                <form
                    className={
                        css.formulario
                    }
                    onSubmit={
                        handleCadastro
                    }
                >

                    {/*
                        Campos do cadastro. value apresenta o estado atual;
                        onChange atualiza esse estado conforme o usuário digita ou seleciona.
                    */}
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
                                Nome do modelo *
                            </label>


                            {/* Campo de nome do modelo: limita a entrada a 150 caracteres. */}
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


                            {/*
                                Lista suspensa com os tipos aceitos pela API.
                                O valor selecionado é guardado em tipo.
                            */}
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


                            {/*
                                Campo de texto opcional para descrever o modelo, limitado
                                a 500 caracteres.
                            */}
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

                                {/*
                                    Campo de upload: accept sugere a seleção de arquivos .docx;
                                    onChange executa a validação feita em handleArquivo.
                                */}
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


                            {/* Abre o modal que explica a preparação do Word e lista variáveis. */}
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


                    {/*
                        Se houver um arquivo selecionado, exibe a área de prévia.
                        Sem arquivo, toda esta seção fica oculta.
                    */}
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


                                {/* Mostra o nome original do arquivo enviado pelo usuário. */}
                                <span
                                    className={
                                        css.nomeArquivoPreview
                                    }
                                >
                                    {arquivo.name}
                                </span>

                            </div>

                            {/*
    Mostra as variáveis reconhecidas quando o processamento termina
    sem erro. O contador ajusta o texto ao singular ou plural.
*/}

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


                                        {/* Mostra o contador de variáveis inválidas apenas se houver alguma. */}
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



                            {/*
                                Havendo variáveis não reconhecidas, exibe um aviso detalhado
                                para orientar a correção antes do cadastro.
                            */}
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

                                            {/*
                                                map cria um elemento visual para cada variável inválida.
                                                key identifica cada item e ajuda o React a atualizar a lista.
                                            */}
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



                            {/* Enquanto o Word está sendo processado, mostra o carregamento. */}
                            {carregandoPreview && (

                                <div
                                    className={
                                        css.carregandoPreview
                                    }
                                >
                                    Preparando pré-visualização...
                                </div>

                            )}



                            {/* Se a prévia falhar, apresenta a mensagem salva em erroPreview. */}
                            {erroPreview && (

                                <div
                                    className={
                                        css.erroPreview
                                    }
                                >
                                    {erroPreview}
                                </div>

                            )}



                            {/*
                                Esta área contém o elemento id="preview-documento", onde
                                docx-preview coloca a representação visual do Word.
                            */}
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




                    <div
                        className={
                            css.botaoContainer
                        }
                    >

                        {/*
                            disabled impede o cadastro durante o envio, o processamento
                            do Word ou enquanto houver variáveis não reconhecidas.
                        */}
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

                            {/*
                                Operador ternário: mostra "Cadastrando..." durante o envio
                                e "Cadastrar modelo" quando o formulário está disponível.
                            */}
                            {
                                cadastrando
                                    ? 'Cadastrando...'
                                    : 'Cadastrar modelo'
                            }

                        </button>

                    </div>

                </form>

            </section>


            {/* Rodapé reutilizado em outras páginas do Constituere. */}
            <Footer />




            {/*
                MODAL DE ORIENTAÇÕES
                A janela só é montada quando modalFormatoAberto for true.
                O clique no fundo fecha a janela; stopPropagation bloqueia
                esse efeito quando o clique acontece dentro do conteúdo.
            */}
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

                        {/* Botão específico para fechar a janela de instruções. */}
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



                        {/* Orientação sobre o formato Word e os elementos preservados no arquivo. */}
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


                        {/* Área com as variáveis disponíveis para o preenchimento automático. */}
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


                            {/*
                                map percorre os grupos (cliente, processo, advogado etc.)
                                e cria uma seção para cada categoria sem repetir o JSX.
                            */}
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

                                                {/*
                                                    Dentro de cada grupo, map cria botões para cada variável.
                                                    onClick usa copiarVariavel para copiar o valor exato.
                                                */}
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


                                                                        {/* A tag code destaca o texto da variável como {{cliente.nome}}. */}
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


                                                                    {/* O texto do botão muda conforme a última variável copiada. */}
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

                            {/* Botão final para fechar o modal e voltar ao formulário. */}
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
