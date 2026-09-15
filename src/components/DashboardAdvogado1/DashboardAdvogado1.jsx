import React, { useEffect, useRef, useState } from 'react';
import css from './DashboardAdvogado1.module.css';
import Header from "../Header/Header.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import { useNavigate } from 'react-router-dom';
import Footer from "../Footer/Footer.jsx";

export default function DashboardAdvogado1({ api }) {
    const navigate = useNavigate();
    const estatisticasRef = useRef(null);
    const [nome, setNome] = useState('Carregando...');

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');



    const [escritorios, setEscritorios] = useState([]);
    const [carregandoEscritorios, setCarregandoEscritorios] = useState(true);


    const [totalClientes, setTotalClientes] = useState(0);
    const [clientesMes, setClientesMes] = useState(0);
    const [clientesAtivos, setClientesAtivos] = useState(0);

    const [carregandoEstatisticas, setCarregandoEstatisticas] = useState(true);

    const [paginaEstatisticas, setPaginaEstatisticas] = useState(0);



    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [carregandoGrafico, setCarregandoGrafico] = useState(false);

    const [filtroPeriodo, setFiltroPeriodo] = useState('mes');

    const [totaisGrafico, setTotaisGrafico] = useState({
        recebido: 0,
        aReceber: 0
    });



    const API_URL = api || 'http://10.92.11.62:5000';



    function limparSessaoERedirecionar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');

        navigate('/login');
    }



    function contarClientesMes(clientes) {
        const dataAtual = new Date();

        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();

        return clientes.filter(cliente => {
            if (!cliente.data_cadastro) {
                return false;
            }

            try {
                const partes = cliente.data_cadastro.split('/');

                if (partes.length !== 3) {
                    return false;
                }

                const dia = parseInt(partes[0], 10);
                const mes = parseInt(partes[1], 10) - 1;
                const ano = parseInt(partes[2], 10);

                const data = new Date(
                    ano,
                    mes,
                    dia
                );

                return (
                    data.getMonth() === mesAtual &&
                    data.getFullYear() === anoAtual
                );

            } catch (error) {
                return false;
            }
        }).length;
    }

    async function buscarDadosGrafico(periodo) {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        setCarregandoGrafico(true);

        try {
            const response = await fetch(
                `${API_URL}/dashboard/rendimentos?periodo=${periodo}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();

                setDadosGrafico(
                    data.dados || []
                );

                setTotaisGrafico({
                    recebido:
                        data.totais?.recebido || 0,

                    aReceber:
                        data.totais?.a_receber || 0
                });

            } else if (response.status === 401) {
                limparSessaoERedirecionar();
            }

        } catch (error) {
            console.error(
                'Erro ao buscar dados do gráfico:',
                error
            );

        } finally {
            setCarregandoGrafico(false);
        }
    }



    useEffect(() => {
        const tipo = localStorage.getItem('tipo');
        const token = localStorage.getItem('token');

        if (!tipo || !token) {
            navigate('/login');
            return;
        }

        async function buscarDados() {
            try {
                const response = await fetch(
                    `${API_URL}/meus_dados`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'X-Access-Token': token
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setNome(
                        data.usuario?.nome ||
                        'Advogado'
                    );

                } else if (response.status === 401) {
                    limparSessaoERedirecionar();

                } else {
                    setMensagem(
                        data.error ||
                        'Erro ao carregar dados'
                    );

                    setTipoMensagem('erro');
                }

            } catch (error) {
                console.error(
                    'Erro ao buscar dados do usuário:',
                    error
                );

                setMensagem(
                    'Erro de conexão com o servidor'
                );

                setTipoMensagem('erro');
            }
        }

        async function buscarEscritorios() {
            try {
                const response = await fetch(
                    `${API_URL}/meus_escritorios`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'X-Access-Token': token
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    setEscritorios(
                        data.escritorios || []
                    );

                } else if (response.status === 401) {
                    limparSessaoERedirecionar();
                }

            } catch (error) {
                console.error(
                    'Erro ao buscar escritórios:',
                    error
                );

            } finally {
                setCarregandoEscritorios(false);
            }
        }

        async function buscarClientes() {
            try {
                const response = await fetch(
                    `${API_URL}/clientes`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'X-Access-Token': token
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    const clientes =
                        data.clientes || [];

                    setTotalClientes(
                        clientes.length
                    );

                    setClientesMes(
                        contarClientesMes(clientes)
                    );

                    setClientesAtivos(
                        clientes.filter(
                            cliente =>
                                cliente.status === 'ativo'
                        ).length
                    );

                } else if (response.status === 401) {
                    limparSessaoERedirecionar();
                }

            } catch (error) {
                console.error(
                    'Erro ao buscar clientes:',
                    error
                );

            } finally {
                setCarregandoEstatisticas(false);
            }
        }

        buscarDados();
        buscarEscritorios();
        buscarClientes();
        buscarDadosGrafico('mes');

    }, [API_URL, navigate]);



    useEffect(() => {
        function verificarTamanhoTela() {
            if (window.innerWidth > 426) {
                setPaginaEstatisticas(0);

                if (estatisticasRef.current) {
                    estatisticasRef.current.scrollTo({
                        left: 0,
                        behavior: 'auto'
                    });
                }
            }
        }

        window.addEventListener(
            'resize',
            verificarTamanhoTela
        );

        return () => {
            window.removeEventListener(
                'resize',
                verificarTamanhoTela
            );
        };
    }, []);



    function handleFiltroChange(event) {
        const novoFiltro = event.target.value;

        setFiltroPeriodo(novoFiltro);

        buscarDadosGrafico(novoFiltro);
    }



    function irParaEditarPerfil() {
        navigate(
            '/editar_perfil_advogado'
        );
    }

    function irParaCadastroEscritorio() {
        navigate(
            '/cadastro_escritorio'
        );
    }

    function irParaDetalhesEscritorio(idEscritorio) {
        navigate(
            `/escritorio/${idEscritorio}`
        );
    }



    function getFotoEscritorio(idEscritorio) {
        return (
            `${API_URL}/uploads/Escritorios/` +
            `escritorio_${idEscritorio}.jpeg`
        );
    }



    function formatarMoeda(valor) {
        return new Intl.NumberFormat(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        ).format(
            Number(valor) || 0
        );
    }



    const totalEstatisticas = 3;

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
        if (paginaEstatisticas > 0) {
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



    const maxValor = Math.max(
        ...dadosGrafico.map(item =>
            Math.max(
                Number(item.recebido) || 0,
                Number(item.a_receber) || 0
            )
        ),
        1
    );



    return (
        <div className={css.paginaCompleta}>

            <Header api={API_URL} />

            <div className={css.layoutDashboard}>



                <div
                    className={
                        css.menuLateralContainer
                    }
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



                    {mensagem && (
                        <div
                            className={`
                                ${css.mensagemContainer}
                                ${
                                tipoMensagem === 'erro'
                                    ? css.erro
                                    : css.sucesso
                            }
                            `}
                        >
                            {mensagem}
                        </div>
                    )}



                    <div
                        className={
                            css.topoSaudacao
                        }
                    >
                        <div
                            className={
                                css.saudacaoTexto
                            }
                        >
                            <h1
                                className={
                                    css.tituloSaudacao
                                }
                            >
                                Olá,{' '}

                                <span
                                    className={
                                        css.nomeDestaque
                                    }
                                >
                                    {nome}!
                                </span>
                            </h1>
                        </div>

                        <button
                            className={
                                css.btnConfiguracoes
                            }
                            type="button"
                            onClick={
                                irParaEditarPerfil
                            }
                            name="btn-configuracoes"
                            aria-label="Configurações"
                        >
                            <img
                                src="/engrenagem_1.png"
                                alt=""
                                className={
                                    css.imgEngrenagem
                                }
                            />
                        </button>
                    </div>


                    <section
                        className={
                            css.carrosselEstatisticas
                        }
                        aria-label="Estatísticas de clientes"
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
                                name="btn-seta-estatisticas-esquerda"
                                aria-label="Estatística anterior"
                            >
                                &#10094;
                            </button>
                        )}

                        <div
                            className={
                                css.estatisticasContainer
                            }
                            ref={estatisticasRef}
                        >

                            <div
                                className={
                                    css.cardNovo
                                }
                            >
                                <span
                                    className={
                                        css.labelCardNovo
                                    }
                                >
                                    Clientes cadastrados
                                </span>

                                <div
                                    className={
                                        css.bolinhaVerde
                                    }
                                >
                                    <span
                                        className={
                                            css.numeroCardNovo
                                        }
                                    >
                                        {carregandoEstatisticas
                                            ? '...'
                                            : totalClientes}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={
                                    css.cardNovo
                                }
                            >
                                <span
                                    className={
                                        css.labelCardNovo
                                    }
                                >
                                    Novos clientes
                                    (este mês)
                                </span>

                                <div
                                    className={
                                        css.bolinhaVerde
                                    }
                                >
                                    <span
                                        className={
                                            css.numeroCardNovo
                                        }
                                    >
                                        {carregandoEstatisticas
                                            ? '...'
                                            : clientesMes}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={
                                    css.cardNovo
                                }
                            >
                                <span
                                    className={
                                        css.labelCardNovo
                                    }
                                >
                                    Clientes ativos
                                </span>

                                <div
                                    className={
                                        css.bolinhaVerde
                                    }
                                >
                                    <span
                                        className={
                                            css.numeroCardNovo
                                        }
                                    >
                                        {carregandoEstatisticas
                                            ? '...'
                                            : clientesAtivos}
                                    </span>
                                </div>
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
                                name="btn-seta-estatisticas-direita"
                                aria-label="Próxima estatística"
                            >
                                &#10095;
                            </button>
                        )}

                    </section>



                    <div
                        className={
                            css.areaTitulo
                        }
                    >
                        <h2
                            className={
                                css.tituloSecao
                            }
                        >
                            Meus escritórios
                        </h2>

                        <button
                            className={
                                css.botaoAdicionarEscritorio
                            }
                            type="button"
                            onClick={
                                irParaCadastroEscritorio
                            }
                            name="btn-adicionar-escritorio"
                            aria-label="Adicionar escritório"
                        >
                            +
                        </button>
                    </div>


                    <section
                        className={
                            css.areaEscritorios
                        }
                    >
                        {carregandoEscritorios ? (

                            <p>
                                Carregando escritórios...
                            </p>

                        ) : escritorios.length === 0 ? (

                            <p>
                                Nenhum escritório
                                cadastrado ainda.
                            </p>

                        ) : (

                            <div
                                className={
                                    css.gridEscritorios
                                }
                            >
                                {escritorios.map(
                                    escritorio => (
                                        <article
                                            key={
                                                escritorio.id
                                            }
                                            className={
                                                css.cardEscritorio
                                            }
                                        >

                                            <div
                                                className={
                                                    css.cardEscritorioHeader
                                                }
                                            >
                                                <img
                                                    src={
                                                        getFotoEscritorio(
                                                            escritorio.id
                                                        )
                                                    }
                                                    alt={
                                                        escritorio.nome_fantasia ||
                                                        'Escritório'
                                                    }
                                                    className={
                                                        css.fotoEscritorio
                                                    }
                                                    onError={
                                                        event => {
                                                            event.currentTarget.onerror =
                                                                null;

                                                            event.currentTarget.src =
                                                                '/perfil-padrao.png';
                                                        }
                                                    }
                                                />

                                                <div
                                                    className={
                                                        css.cardEscritorioInfo
                                                    }
                                                >
                                                    <h3
                                                        className={
                                                            css.nomeEscritorio
                                                        }
                                                    >
                                                        {
                                                            escritorio.nome_fantasia
                                                        }
                                                    </h3>

                                                    <span
                                                        className={
                                                            css.tipoEscritorio
                                                        }
                                                    >
                                                        {escritorio.status ===
                                                        'PROPRIETARIO'
                                                            ? 'Proprietário'
                                                            : 'Parceiro'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                className={
                                                    css.botaoVerDetalhes
                                                }
                                                onClick={() =>
                                                    irParaDetalhesEscritorio(
                                                        escritorio.id
                                                    )
                                                }
                                                type="button"
                                                name={
                                                    `btn-detalhes-${escritorio.id}`
                                                }
                                            >
                                                Ver Detalhes →
                                            </button>

                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </section>



                    <div
                        className={
                            css.gradeDupla
                        }
                    >

                        <section
                            className={
                                css.cardDuplo
                            }
                        >
                            <div
                                className={
                                    css.cardDuploHeader
                                }
                            >
                                <h3
                                    className={
                                        css.tituloCardDuplo
                                    }
                                >
                                    Rendimentos
                                </h3>

                                <select
                                    className={
                                        css.selectFiltro
                                    }
                                    value={
                                        filtroPeriodo
                                    }
                                    onChange={
                                        handleFiltroChange
                                    }
                                    aria-label="Período dos rendimentos"
                                >
                                    <option value="mes">
                                        Este mês
                                    </option>

                                    <option value="2025">
                                        2025
                                    </option>

                                    <option value="2026">
                                        2026
                                    </option>
                                </select>
                            </div>

                            {dadosGrafico.length === 0 &&
                            !carregandoGrafico ? (

                                <div
                                    className={
                                        css.placeholderGrafico
                                    }
                                >
                                    <p
                                        className={
                                            css.textoPlaceholder
                                        }
                                    >
                                        Nenhum dado disponível
                                    </p>
                                </div>

                            ) : (

                                <>
                                    <div
                                        className={
                                            css.graficoContainer
                                        }
                                    >
                                        <div
                                            className={
                                                css.graficoLegenda
                                            }
                                        >
                                            <span
                                                className={
                                                    css.legendaRecebido
                                                }
                                            >
                                                ■ Recebido
                                            </span>

                                            <span
                                                className={
                                                    css.legendaAReceber
                                                }
                                            >
                                                ■ A Receber
                                            </span>
                                        </div>

                                        <div
                                            className={
                                                css.graficoBarras
                                            }
                                        >
                                            {dadosGrafico.map(
                                                (
                                                    item,
                                                    index
                                                ) => {
                                                    const recebido =
                                                        Number(
                                                            item.recebido
                                                        ) || 0;

                                                    const aReceber =
                                                        Number(
                                                            item.a_receber
                                                        ) || 0;

                                                    const alturaRecebido =
                                                        (recebido /
                                                            maxValor) *
                                                        150;

                                                    const alturaAReceber =
                                                        (aReceber /
                                                            maxValor) *
                                                        150;

                                                    return (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className={
                                                                css.barraGrupo
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    css.barras
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        css.barraRecebido
                                                                    }
                                                                    style={{
                                                                        height:
                                                                            `${alturaRecebido}px`
                                                                    }}
                                                                >
                                                                    <span
                                                                        className={
                                                                            css.barraValor
                                                                        }
                                                                    >
                                                                        {formatarMoeda(
                                                                            recebido
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        css.barraAReceber
                                                                    }
                                                                    style={{
                                                                        height:
                                                                            `${alturaAReceber}px`
                                                                    }}
                                                                >
                                                                    <span
                                                                        className={
                                                                            css.barraValor
                                                                        }
                                                                    >
                                                                        {formatarMoeda(
                                                                            aReceber
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={
                                                                    css.barraLabel
                                                                }
                                                            >
                                                                {
                                                                    item.label
                                                                }
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            css.graficoTotais
                                        }
                                    >
                                        <div
                                            className={
                                                css.totalItem
                                            }
                                        >
                                            <span
                                                className={
                                                    css.totalLabel
                                                }
                                            >
                                                Recebido
                                            </span>

                                            <span
                                                className={
                                                    css.totalValor
                                                }
                                            >
                                                {formatarMoeda(
                                                    totaisGrafico.recebido
                                                )}
                                            </span>
                                        </div>

                                        <div
                                            className={
                                                css.totalItem
                                            }
                                        >
                                            <span
                                                className={
                                                    css.totalLabel
                                                }
                                            >
                                                A Receber
                                            </span>

                                            <span
                                                className={
                                                    css.totalValor
                                                }
                                            >
                                                {formatarMoeda(
                                                    totaisGrafico.aReceber
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>

                        <section
                            className={
                                css.cardDuplo
                            }
                        >
                            <h3
                                className={
                                    css.tituloCardDuplo
                                }
                            >
                                Agendamentos
                            </h3>

                            <div
                                className={
                                    css.placeholderGrafico
                                }
                            >
                                <p
                                    className={
                                        css.textoPlaceholder
                                    }
                                >
                                    Lista em breve
                                </p>
                            </div>
                        </section>

                    </div>

                </main>
            </div>

            <Footer />

        </div>
    );
}