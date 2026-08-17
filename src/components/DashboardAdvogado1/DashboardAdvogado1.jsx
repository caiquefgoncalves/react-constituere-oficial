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

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        async function buscarDados() {
            try {
                const response = await fetch(`${api}/meus_dados`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (response.ok) {
                    setNome(data.usuario.nome || 'Advogado');
                } else {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('nome');
                        localStorage.removeItem('tipo');
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

        buscarDados();
    }, [navigate, api]);


    function irParaEditarPerfil() {
        navigate('/editar_perfil_advogado');
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={api} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={api} />
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
                        <button className={css.botaoAdicionarEscritorio} type="button">+</button>
                    </div>
                    <div className={css.areaEscritorios}>
                        <div>
                            <p>Nenhum escritório cadastrado ainda.</p>
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