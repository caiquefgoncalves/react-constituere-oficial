import React, { useState, useRef, useEffect } from 'react';
import css from './Cadastro1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function Cadastro1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [orgaoExpeditor, setOrgaoExpeditor] = useState('');
    const [oab, setOab] = useState('');
    const [ufOab, setUfOab] = useState('');
    const [nacionalidade, setNacionalidade] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);

    const API_URL = api || 'http://10.92.11.4:5000';

    const ufs = [
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

    function capitalizarNome(texto) {
        if (!texto) return '';
        return texto.split(' ').map(palavra =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        ).join(' ');
    }

    function capitalizarNacionalidade(texto) {
        if (!texto) return '';
        return texto.split(' ').map(palavra =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        ).join(' ');
    }

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, '');
    }

    function handleNome(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) {
            setNome(capitalizarNome(valor));
        }
    }

    function handleCpf(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length <= 3) setCpf(valor);
        else if (valor.length <= 6) setCpf(`${valor.slice(0, 3)}.${valor.slice(3)}`);
        else if (valor.length <= 9) setCpf(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`);
        else setCpf(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9, 11)}`);
    }

    function handleRg(e) {
        const valor = apenasNumeros(e.target.value);
        if (valor.length <= 20) setRg(valor);
    }

    function handleOrgaoExpedidor(e) {
        const valor = e.target.value.replace(/[^a-zA-Z0-9\/]/g, '');
        if (valor.length <= 20) setOrgaoExpeditor(valor);
    }

    function handleTelefone(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length <= 2) setTelefone(valor.length === 0 ? '' : `(${valor}`);
        else if (valor.length <= 7) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
        else setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
    }

    function handleEmail(e) {
        const valor = e.target.value.replace(/\s/g, '');
        if (valor.length <= 254) setEmail(valor);
    }

    function handleNacionalidade(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 50) {
            setNacionalidade(capitalizarNacionalidade(valor));
        }
    }

    function handleSenha(e) {
        if (e.target.value.length <= 254) setSenha(e.target.value);
    }

    function handleConfirmarSenha(e) {
        if (e.target.value.length <= 254) setConfirmarSenha(e.target.value);
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
        if (!nome.trim()) camposFaltando.push('Nome completo');
        if (!cpf.trim()) camposFaltando.push('CPF');
        if (!rg.trim()) camposFaltando.push('RG');
        if (!orgaoExpeditor.trim()) camposFaltando.push('Órgão expedidor');
        if (!oab.trim()) camposFaltando.push('Número da OAB');
        if (!ufOab.trim()) camposFaltando.push('UF da OAB');
        if (!nacionalidade.trim()) camposFaltando.push('Nacionalidade');
        if (!estadoCivil) camposFaltando.push('Estado civil');
        if (!telefone.trim()) camposFaltando.push('Telefone');
        if (!email.trim()) camposFaltando.push('E-mail');
        if (!senha.trim()) camposFaltando.push('Senha');
        if (!confirmarSenha.trim()) camposFaltando.push('Confirmar senha');

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

        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) {
            setMensagem('CPF incompleto. Digite os 11 números do CPF.');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);

            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            agendarLimpezaMensagem();
            return;
        }

        const telefoneNumeros = telefone.replace(/\D/g, '');
        if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
            setMensagem('Telefone incompleto. Digite DDD + número (10 ou 11 dígitos).');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);

            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            agendarLimpezaMensagem();
            return;
        }

        if (senha !== confirmarSenha) {
            setMensagem('As senhas não coincidem.');
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
        formData.append('nome', nome);
        formData.append('cpf_cnpj', cpfNumeros);
        formData.append('email', email);
        formData.append('senha', senha);
        formData.append('confirmar_senha', confirmarSenha);
        formData.append('telefone', telefoneNumeros);
        formData.append('rg', rg);
        formData.append('orgao_expedidor', orgaoExpeditor);
        formData.append('num_oab', oab);
        formData.append('uf_oab', ufOab);
        formData.append('nacionalidade', nacionalidade);
        formData.append('estado_civil', estadoCivil);
        formData.append('tipo', 0);
        if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

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
                    <h1 className={css.titulo}>Faça parte da Constituere!</h1>
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
                            <label className={css.label}>Nome completo *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu nome"
                                value={nome}
                                onChange={handleNome}
                                maxLength={254}
                                tabIndex={1}
                                name="nome"
                            />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>CPF *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu CPF"
                                value={cpf}
                                onChange={handleCpf}
                                maxLength={14}
                                tabIndex={2}
                                name="cpf"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>RG *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu RG"
                                value={rg}
                                onChange={handleRg}
                                maxLength={20}
                                tabIndex={3}
                                name="rg"
                            />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Órgão expedidor *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Ex: SSP/SP"
                                value={orgaoExpeditor}
                                onChange={handleOrgaoExpedidor}
                                maxLength={20}
                                tabIndex={4}
                                name="orgao_expedidor"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Número da OAB *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite sua OAB"
                                value={oab}
                                onChange={(e) => setOab(e.target.value)}
                                tabIndex={5}
                                name="num_oab"
                            />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>UF da OAB *</label>
                            <select
                                className={css.input}
                                value={ufOab}
                                onChange={(e) => setUfOab(e.target.value)}
                                tabIndex={6}
                                name="uf_oab"
                            >
                                <option value="" disabled>Selecione a UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Nacionalidade *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Ex: Brasileira"
                                value={nacionalidade}
                                onChange={handleNacionalidade}
                                maxLength={50}
                                tabIndex={7}
                                name="nacionalidade"
                            />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Estado civil *</label>
                            <select className={css.input} value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} tabIndex={8} name="estado_civil">
                                <option value="" disabled>Selecione o estado civil</option>
                                <option value="Solteiro(a)">Solteiro(a)</option>
                                <option value="Casado(a)">Casado(a)</option>
                                <option value="Divorciado(a)">Divorciado(a)</option>
                                <option value="Viúvo(a)">Viúvo(a)</option>
                                <option value="União Estável">União Estável</option>
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Telefone *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu telefone"
                                value={telefone}
                                onChange={handleTelefone}
                                maxLength={15}
                                tabIndex={9}
                                name="telefone"
                            />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>E-mail *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={handleEmail}
                                maxLength={254}
                                tabIndex={10}
                                name="email"
                            />
                        </div>

                        <div className={css.campoMetade} style={{ gap: '1.5rem', marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Senha *</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={handleSenha}
                                    maxLength={254}
                                    tabIndex={11}
                                    name="senha"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Confirmar senha *</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    placeholder="Confirme sua senha"
                                    value={confirmarSenha}
                                    onChange={handleConfirmarSenha}
                                    maxLength={254}
                                    tabIndex={13}
                                    name="confirmar_senha"
                                />
                            </div>
                        </div>

                        <div className={css.campoMetade} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                            <label className={css.label}>Foto de perfil</label>
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #dcdcdc',
                                borderRadius: '8px',
                                backgroundColor: '#ffffff',
                                boxSizing: 'border-box',
                                padding: '0 1rem'
                            }}>
                                <input
                                    type="file"
                                    className={css.inputFile}
                                    onChange={(e) => setFotoPerfil(e.target.files[0])}
                                    tabIndex={12}
                                    name="foto_perfil"
                                    style={{
                                        width: '100%',
                                        border: 'none',
                                        padding: 0,
                                        margin: 0,
                                        backgroundColor: 'transparent',
                                        display: 'block'
                                    }}
                                />
                            </div>
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