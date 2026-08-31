import React, { useState, useRef, useEffect } from 'react';
import css from './CadastroProcesso1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function CadastroProcesso1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);

    const [numProcesso, setNumProcesso] = useState('');
    const [tipoProcesso, setTipoProcesso] = useState('');
    const [comarca, setComarca] = useState('');
    const [assunto, setAssunto] = useState('');
    const [area, setArea] = useState('');
    const [vara, setVara] = useState('');
    const [instancia, setInstancia] = useState('');
    const [data, setData] = useState('');
    const [cliente, setCliente] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);

    const API_URL = api || 'http://192.168.0.123:5000';

    const clientes = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) {
            clearTimeout(window.timeoutMensagem);
        }
        window.timeoutMensagem = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 7000);
    }


    function capitalizar(texto) {
        if (!texto) return '';
        return texto.split(' ').map(palavra =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        ).join(' ');
    }

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, '');
    }


    function handleNumProcesso(e) {
        let valor = apenasNumeros(e.target.value);

        if (valor.length > 20) valor = valor.slice(0, 20);

        if (valor.length <= 7) {
            setNumProcesso(valor);
        } else if (valor.length <= 9) {
            setNumProcesso(`${valor.slice(0, 7)}-${valor.slice(7)}`);
        } else if (valor.length <= 13) {
            setNumProcesso(`${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9)}`);
        } else if (valor.length <= 14) {
            setNumProcesso(`${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13)}`);
        } else if (valor.length <= 16) {
            setNumProcesso(`${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13, 14)}.${valor.slice(14)}`);
        } else {
            setNumProcesso(`${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13, 14)}.${valor.slice(14, 16)}.${valor.slice(16)}`);
        }
    }

    function handleAssunto(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 50) {
            setAssunto(capitalizar(valor));
        }
    }
    function handleVara(e) {
        setVara(capitalizar(e.target.value));
    }

    function handleData(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 8) valor = valor.slice(0, 8);
        if (valor.length <= 2) setData(valor);
        else if (valor.length <= 4) setData(`${valor.slice(0,2)}/${valor.slice(2)}`);
        else setData(`${valor.slice(0,2)}/${valor.slice(2,4)}/${valor.slice(4,8)}`);
    }

    function voltarParaHome() {
        navigate('/');
    }

    useEffect(() => {
        let timerAviso = null;

        if (exibirCarregamento) {
            timerAviso = setTimeout(() => {
                setAvisoInternetLenta(true);
            }, 15000);
        } else {
            setAvisoInternetLenta(false);
        }

        return () => {
            if (timerAviso) clearTimeout(timerAviso);
        };
    }, [exibirCarregamento]);

    async function handleCadastro(e) {
        e.preventDefault();
        setCarregando(true);
        setExibirCarregamento(true);
        setAvisoInternetLenta(false);
        setMensagem('');
        setTipoMensagem('');

        let camposFaltando = [];
        if (!assunto.trim()) camposFaltando.push('Assunto');

        if (camposFaltando.length > 0) {
            const lista = camposFaltando.join(', ');
            setMensagem(`Preencha os campos obrigatórios: ${lista}.`);
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);

            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            agendarLimpezaMensagem();
            return;
        }


        const formData = new FormData();
        formData.append('area', area);

        try {
            const resposta = await fetch(`${API_URL}/criar_usuarios`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const dados = await resposta.json();

            setExibirCarregamento(false);

            if (resposta.ok) {
                setMensagem('Cadastro realizado com sucesso! Redirecionando para o login...');
                setTipoMensagem('sucesso');

                if (topoRef.current) {
                    topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                agendarLimpezaMensagem();
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setMensagem(dados.error || 'Erro ao realizar o cadastro.');
                setTipoMensagem('erro');

                if (topoRef.current) {
                    topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                agendarLimpezaMensagem();
            }
        } catch (erro) {
            setExibirCarregamento(false);
            setMensagem('Erro de conexão com o servidor. Verifique o back-end.');
            setTipoMensagem('erro');

            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            agendarLimpezaMensagem();
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            {exibirCarregamento && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        textAlign: 'center',
                        padding: '30px'
                    }}>
                        <img
                            src={'./public/Martelinho.png'}
                            alt="Carregando"
                            style={{
                                width: '100px',
                                height: '100px',
                                animation: 'spin 1.2s linear infinite'
                            }}
                        />
                        <p style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontFamily: 'Clear Sans, sans-serif',
                            fontWeight: 'bold'
                        }}>
                            Validando seus dados com a OAB...
                        </p>

                        {avisoInternetLenta && (
                            <p style={{
                                color: '#ffc107',
                                fontSize: '1rem',
                                fontFamily: 'Clear Sans, sans-serif',
                                fontWeight: 'bold',
                                marginTop: '10px',
                                maxWidth: '400px'
                            }}>
                                Sua internet pode estar lenta ou a OAB está demorando para responder.
                                Por favor, aguarde mais alguns segundos...
                            </p>
                        )}
                    </div>
                </div>
            )}

            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button className={css.botaoVoltar} onClick={voltarParaHome} tabIndex={-1} name="btn-voltar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className={css.titulo}>Cadastre o processo</h1>
                </div>

                {mensagem && (
                    <div style={{
                        padding: '16px 24px',
                        margin: '0 auto 25px auto',
                        maxWidth: '700px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontFamily: 'Clear Sans, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.05rem',
                        backgroundColor: tipoMensagem === 'sucesso' ? '#d4edda' : '#fce8e6',
                        color: tipoMensagem === 'sucesso' ? '#155724' : '#a94442',
                        border: tipoMensagem === 'sucesso' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleCadastro}>
                    <div className={css.linha}>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Número do processo</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o número do processo"
                                value={numProcesso}
                                onChange={handleNumProcesso}
                                maxLength={25}
                                tabIndex={1}
                                name="numProcesso"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Tipo do processo *</label>
                            <select className={css.input} value={tipoProcesso} onChange={(e) => setTipoProcesso(e.target.value)} tabIndex={8} name="estado_civil">
                                <option value="" disabled>Ver com dona minha mãe</option>
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Assunto *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o assunto"
                                value={assunto}
                                onChange={handleAssunto}
                                maxLength={50}
                                tabIndex={7}
                                name="assunto"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Área</label>
                            <select className={css.input} value={area} onChange={(e) => setArea(e.target.value)} tabIndex={8} name="area">
                                <option value="" disabled>Ver com dona minha mãe</option>
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Comarca *</label>
                            <select className={css.input} value={comarca} onChange={(e) => setComarca(e.target.value)} tabIndex={8} name="comarca">
                                <option value="" disabled>Ver com dona minha mãe</option>
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Vara</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Ex: Ver com dona minha mãe"
                                value={vara}
                                onChange={handleVara}
                                tabIndex={4}
                                name="vara"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Instância *</label>
                            <select className={css.input} value={instancia} onChange={(e) => setInstancia(e.target.value)} tabIndex={8} name="instancia">
                                <option value="" disabled>Ver com dona minha mãe</option>
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Data de início</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="xx/xx/xxxx"
                                value={data}
                                onChange={handleData}
                                tabIndex={4}
                                name="vara"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Cliente *</label>
                            <select
                                className={css.input}
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                tabIndex={18}
                                name="cliente"
                            >
                                <option value="" disabled>Selecione o cliente</option>
                                {clientes.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>


                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button className={css.botaoCadastro} type="submit" disabled={carregando} tabIndex={14} name="btn-cadastrar">
                            {carregando ? 'Cadastrando...' : 'Cadastre-se'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}