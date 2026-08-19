import React, { useEffect, useState } from 'react';
import css from './DashboardAdvogado1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import { useNavigate } from 'react-router-dom';

export default function DashboardAdvogado1({ api }) {
    const navigate = useNavigate();

    const [nome, setNome] = useState('Carregando...');
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [escritorios, setEscritorios] = useState([]);
    const [carregandoEscritorios, setCarregandoEscritorios] = useState(true);

    const API_URL = api || 'http://192.168.0.129:5000';

    useEffect(() => {
        const tipo = localStorage.getItem('tipo');
        const token = localStorage.getItem('token');

        if (!tipo || !token) {
            navigate('/login');
            return;
        }

        async function buscarDados() {
            try {
                const response = await fetch(`${API_URL}/meus_dados`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setNome(data.usuario.nome || 'Advogado');
                } else {
                    if (response.status === 401) {
                        localStorage.removeItem('nome');
                        localStorage.removeItem('tipo');
                        localStorage.removeItem('token');
                        localStorage.removeItem('id_usuario');
                        navigate('/login');
                        return;
                    }
                    setMensagem(data.error || 'Erro ao carregar dados');
                    setTipoMensagem('erro');
                }
            } catch (error) {
                setMensagem('Erro de conexão com o servidor');
                setTipoMensagem('erro');
            }
        }

        async function buscarEscritorios() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/meus_escritorios`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEscritorios(data.escritorios || []);
                } else if (response.status === 401) {
                    localStorage.removeItem('nome');
                    localStorage.removeItem('tipo');
                    localStorage.removeItem('token');
                    localStorage.removeItem('id_usuario');
                    navigate('/login');
                    return;
                }
            } catch (error) {
                console.error('Erro ao buscar escritórios:', error);
            } finally {
                setCarregandoEscritorios(false);
            }
        }

        buscarDados();
        buscarEscritorios();
    }, [navigate, API_URL]);

    function irParaEditarPerfil() {
        navigate('/editar_perfil_advogado');
    }

    function irParaCadastroEscritorio() {
        navigate('/cadastro_escritorio');
    }

    function irParaDetalhesEscritorio(id) {
        navigate(`/escritorio/${id}`);
    }

    function getFotoEscritorio(id) {
        return `${API_URL}/uploads/Escritorios/escritorio_${id}.jpeg`;
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>
                    {mensagem && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: tipoMensagem === 'erro' ? '#f8d7da' : '#d4edda',
                            color: tipoMensagem === 'erro' ? '#721c24' : '#155724',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontFamily: 'Clear Sans, sans-serif'
                        }}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.topoSaudacao}>
                        <div className={css.saudacaoTexto}>
                            <h1 className={css.tituloSaudacao}>Olá, <span className={css.nomeDestaque}>{nome}!</span></h1>
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

                    <div className={css.gradeEstatisticas}>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Processos ativos</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Clientes cadastrados</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                        <div className={css.cardNovo}>
                            <span className={css.labelCardNovo}>Parcelas atrasadas</span>
                            <div className={css.bolinhaVerde}>
                                <span className={css.numeroCardNovo}>0</span>
                            </div>
                        </div>
                    </div>

                    <div className={css.areaTitulo}>
                        <h2 className={css.tituloSecao}>Meus escritórios</h2>
                        <button
                            className={css.botaoAdicionarEscritorio}
                            type="button"
                            onClick={irParaCadastroEscritorio}
                            name="btn-adicionar-escritorio"
                        >
                            +
                        </button>
                    </div>

                    <div className={css.areaEscritorios}>
                        {carregandoEscritorios ? (
                            <p>Carregando escritórios...</p>
                        ) : escritorios.length === 0 ? (
                            <p>Nenhum escritório cadastrado ainda.</p>
                        ) : (
                            <div className={css.gridEscritorios}>
                                {escritorios.map((escritorio) => (
                                    <div key={escritorio.id} className={css.cardEscritorio}>
                                        <div className={css.cardEscritorioHeader}>
                                            <img
                                                src={getFotoEscritorio(escritorio.id)}
                                                alt={escritorio.nome_fantasia}
                                                className={css.fotoEscritorio}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/perfil-padrao.png';
                                                }}
                                            />
                                            <div className={css.cardEscritorioInfo}>
                                                <h3 className={css.nomeEscritorio}>{escritorio.nome_fantasia}</h3>
                                                <span className={css.tipoEscritorio}>
                                                    {escritorio.status === 'PROPRIETARIO' ? 'Proprietário' : 'Parceiro'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={css.botaoVerDetalhes}
                                            onClick={() => irParaDetalhesEscritorio(escritorio.id)}
                                            name={`btn-detalhes-${escritorio.id}`}
                                        >
                                            Ver Detalhes →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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