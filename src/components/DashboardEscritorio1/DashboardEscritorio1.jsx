import React, { useRef, useState } from 'react';
import css from './DashboardEscritorio1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import { useNavigate } from 'react-router-dom';

export default function DashboardEscritorio1() {
    const navigate = useNavigate();
    const carrosselRef = useRef(null);

    // Estado para controlar a página atual (0 = primeira página)
    const [paginaAtual, setPaginaAtual] = useState(0);

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
        navigate('/cadastro_advogado');
    }

    function irParaEditarEscritorio() {
        navigate('/editar_escritorio');
    }

    // Lista de botões (5 botões)
    const botoesAcoes = [
        { id: 1, texto: 'Novo cliente', icone: '+', acao: irParaNovoCliente },
        { id: 2, texto: 'Novo processo', icone: '+', acao: irParaNovoProcesso },
        { id: 3, texto: 'Marcar consulta', icone: '+', acao: irParaNovoAgendamento },
        { id: 4, texto: 'Editar Escritório', icone: '+', acao: irParaEditarEscritorio },
        { id: 5, texto: 'Novo Advogado', icone: '+', acao: irParaNovoAdvogado },
    ];

    const ITENS_POR_PAGINA = 3;
    const totalPaginas = Math.ceil(botoesAcoes.length / ITENS_POR_PAGINA); // 2 páginas

    // Função para rolar para a página anterior
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

    // Função para rolar para a próxima página
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
            <Header />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado />
                </div>

                <div className={css.conteudoPrincipal}>

                    <div className={css.topoSaudacao}>
                        <div className={css.saudacaoTexto}>
                            <h1 className={css.tituloSaudacao}>Olá, <span className={css.nomeDestaque}>Bini & Grillo!</span></h1>
                        </div>

                        <button
                            className={css.btnConfiguracoes}
                            type="button"
                            onClick={irParaEditarPerfil}
                        >
                            <img src="/engrenagem_1.png" alt="Configurações" className={css.imgEngrenagem} />
                        </button>
                    </div>

                    <div className={css.acoesRapidas}>
                        <h3 className={css.tituloAcoes}>Ações Rápidas</h3>

                        <div className={css.carrosselContainer}>
                            {podeRolarEsquerda && (
                                <button className={css.botaoSeta} onClick={rolarEsquerda}>
                                    &#10094;
                                </button>
                            )}

                            <div className={css.botoesAcoes} ref={carrosselRef}>
                                {botoesAcoes.map((botao) => (
                                    <button
                                        key={botao.id}
                                        className={css.botaoAcao}
                                        onClick={botao.acao}
                                    >
                                        <span className={css.iconeAcao}>{botao.icone}</span>
                                        {botao.texto}
                                    </button>
                                ))}
                            </div>

                            {podeRolarDireita && (
                                <button className={css.botaoSeta} onClick={rolarDireita}>
                                    &#10095;
                                </button>
                            )}
                        </div>

                        <div className={css.indicadores}>
                            {Array.from({ length: totalPaginas }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`${css.indicador} ${index === paginaAtual ? css.indicadorAtivo : ''}`}
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

                    {/* Cards de estatísticas */}
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

            <Footer />
        </div>
    );
}