import React, { useRef, useState, useEffect } from 'react';
import css from './DashboardEscritorio1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import ModalAdvogadoAdicionar1 from '../ModalAdvogadoAdicionar1/ModalAdvogadoAdicionar1.jsx';

export default function DashboardEscritorio1({ api }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const carrosselRef = useRef(null);

    const [paginaAtual, setPaginaAtual] = useState(0);
    const [modalAberto, setModalAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('Carregando...');
    const [fotoPerfil, setFotoPerfil] = useState('');

    const API_URL = api || 'http://192.168.0.129:5000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tipo = localStorage.getItem('tipo');

        if (!token || !tipo) {
            navigate('/login');
            return;
        }

        async function buscarDadosEscritorio() {
            try {
                // Busca os dados do escritório específico
                const response = await fetch(`${API_URL}/escritorio/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const escritorio = data.escritorio;
                    setNomeFantasia(escritorio.nome_fantasia || 'Escritório');

                    // Define a foto de perfil do escritório
                    if (escritorio.id) {
                        setFotoPerfil(`${API_URL}/uploads/Escritorios/escritorio_${escritorio.id}.jpeg`);
                    }
                } else if (response.status === 401) {
                    localStorage.removeItem('nome');
                    localStorage.removeItem('tipo');
                    localStorage.removeItem('token');
                    localStorage.removeItem('id_usuario');
                    navigate('/login');
                } else {
                    const data = await response.json();
                    setMensagem(data.error || 'Erro ao carregar dados do escritório');
                    setTipoMensagem('erro');
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setMensagem('Erro de conexão com o servidor');
                setTipoMensagem('erro');
            }
        }

        buscarDadosEscritorio();
    }, [API_URL, navigate, id]);

    function voltarParaDashboardAdvogado() {
        navigate('/dashboard_advogado');
    }

    function irParaEditarPerfil() {
        navigate('/editar_perfil_escritorio');
    }

    function irParaNovoCliente() {
        navigate('/cadastro_cliente');
    }

    function irParaNovoProcesso() {
        navigate('/cadastro_processo');
    }

    function irParaNovoAgendamento() {
        navigate('/cadastro_agendamento');
    }

    function irParaNovoAdvogado() {
        setModalAberto(true);
    }

    function irParaEditarEscritorio() {
        navigate('/editar_escritorio');
    }

    function fecharModal() {
        setModalAberto(false);
        setMensagem('');
        setTipoMensagem('');
    }

    async function adicionarAdvogado(dados) {
        setCarregando(true);
        setMensagem('');
        setTipoMensagem('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/adicionar_advogado_escritorio`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({
                    email: dados.email,
                    status: dados.posicao
                })
            });

            const result = await response.json();

            if (response.ok) {
                setMensagem(result.mensagem || 'Advogado adicionado com sucesso!');
                setTipoMensagem('sucesso');
                setModalAberto(false);
                setTimeout(() => {
                    setMensagem('');
                    setTipoMensagem('');
                }, 5000);
            } else {
                setMensagem(result.mensagem || 'Erro ao adicionar advogado.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            console.error('Erro ao adicionar advogado:', error);
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setCarregando(false);
        }
    }

    const botoesAcoes = [
        { id: 1, texto: 'Novo cliente', icone: '+', acao: irParaNovoCliente, name: 'btn-novo-cliente' },
        { id: 2, texto: 'Novo processo', icone: '+', acao: irParaNovoProcesso, name: 'btn-novo-processo' },
        { id: 3, texto: 'Marcar consulta', icone: '+', acao: irParaNovoAgendamento, name: 'btn-marcar-consulta' },
        { id: 4, texto: 'Editar Escritório', icone: '+', acao: irParaEditarEscritorio, name: 'btn-editar-escritorio' },
        { id: 5, texto: 'Novo Advogado', icone: '+', acao: irParaNovoAdvogado, name: 'btn-novo-advogado' },
    ];

    const ITENS_POR_PAGINA = 3;
    const totalPaginas = Math.ceil(botoesAcoes.length / ITENS_POR_PAGINA);

    function rolarEsquerda() {
        if (paginaAtual > 0) {
            const novaPagina = paginaAtual - 1;
            setPaginaAtual(novaPagina);
            if (carrosselRef.current) {
                const container = carrosselRef.current;
                const scrollAmount = container.clientWidth * 0.85;
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }

    function rolarDireita() {
        if (paginaAtual < totalPaginas - 1) {
            const novaPagina = paginaAtual + 1;
            setPaginaAtual(novaPagina);
            if (carrosselRef.current) {
                const container = carrosselRef.current;
                const scrollAmount = container.clientWidth * 0.85;
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }

    const podeRolarEsquerda = paginaAtual > 0;
    const podeRolarDireita = paginaAtual < totalPaginas - 1;

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} fotoPerfil={fotoPerfil} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>

                    {mensagem && (
                        <div style={{
                            padding: '12px 20px',
                            borderRadius: '8px',
                            backgroundColor: tipoMensagem === 'erro' ? '#f8d7da' : '#d4edda',
                            color: tipoMensagem === 'erro' ? '#721c24' : '#155724',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontFamily: 'Clear Sans, sans-serif',
                            border: tipoMensagem === 'erro' ? '1px solid #f5c6cb' : '1px solid #c3e6cb'
                        }}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.topArea}>
                        <button
                            className={css.botaoVoltar}
                            onClick={voltarParaDashboardAdvogado}
                            tabIndex={-1}
                            name="btn-voltar"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className={css.topoSaudacao}>
                            <div className={css.saudacaoTexto}>
                                <h1 className={css.tituloSaudacao}>
                                    <span className={css.nomeDestaque}>{nomeFantasia}</span>
                                </h1>
                                <p className={css.subtituloSaudacao}>Gerenciamento de escritório</p>
                            </div>

                            <button
                                className={css.btnConfiguracoes}
                                type="button"
                                onClick={irParaEditarPerfil}
                                name="btn-configuracoes"
                            >
                                <img src="/engrenagem_1.png" alt="Configurações" className={css.imgEngrenagem} />
                            </button>
                        </div>
                    </div>

                    <div className={css.acoesRapidas}>
                        <h3 className={css.tituloAcoes}>Ações Rápidas</h3>

                        <div className={css.carrosselContainer}>
                            {podeRolarEsquerda && (
                                <button className={css.botaoSeta} onClick={rolarEsquerda} name="btn-seta-esquerda">
                                    &#10094;
                                </button>
                            )}

                            <div className={css.botoesAcoes} ref={carrosselRef}>
                                {botoesAcoes.map((botao) => (
                                    <button
                                        key={botao.id}
                                        className={css.botaoAcao}
                                        onClick={botao.acao}
                                        name={botao.name}
                                    >
                                        <span className={css.iconeAcao}>{botao.icone}</span>
                                        {botao.texto}
                                    </button>
                                ))}
                            </div>

                            {podeRolarDireita && (
                                <button className={css.botaoSeta} onClick={rolarDireita} name="btn-seta-direita">
                                    &#10095;
                                </button>
                            )}
                        </div>

                        <div className={css.indicadores}>
                            {Array.from({ length: totalPaginas }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`${css.indicador} ${index === paginaAtual ? css.indicadorAtivo : ''}`}
                                    name={`indicador-pagina-${index + 1}`}
                                    onClick={() => {
                                        if (carrosselRef.current) {
                                            const container = carrosselRef.current;
                                            const scrollAmount = container.clientWidth * 0.85 * (index - paginaAtual);
                                            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                                            setPaginaAtual(index);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={css.gradeEstatisticas}>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Advogados ativos</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Processos ativos</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Agendamentos ativos</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                    </div>

                    <div className={css.gradeDupla}>
                        <div className={css.cardDuplo}>
                            <h3 className={css.tituloCardDuplo}>Processos ativos</h3>
                            <div className={css.placeholderGrafico}>
                                <p className={css.textoPlaceholder}>Nenhum processo ativo</p>
                            </div>
                        </div>
                        <div className={css.cardDuplo}>
                            <h3 className={css.tituloCardDuplo}>Agendamentos</h3>
                            <div className={css.placeholderGrafico}>
                                <p className={css.textoPlaceholder}>Nenhum agendamento</p>
                            </div>
                        </div>
                    </div>

                    <div className={css.gradeDupla}>
                        <div className={css.cardDuplo}>
                            <h3 className={css.tituloCardDuplo}>Rendimentos</h3>
                            <div className={css.placeholderGrafico}>
                                <p className={css.textoPlaceholder}>Gráfico em breve</p>
                            </div>
                        </div>
                        <div className={css.cardDuplo}>
                            <h3 className={css.tituloCardDuplo}>Agendamentos</h3>
                            <div className={css.placeholderGrafico}>
                                <p className={css.textoPlaceholder}>Lista em breve</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <ModalAdvogadoAdicionar1
                isOpen={modalAberto}
                onClose={fecharModal}
                onAdicionar={adicionarAdvogado}
                carregando={carregando}
            />

            <Footer />
        </div>
    );
}