import React, { useState, useRef, useEffect } from 'react';
import css from './EditarPerfilAdvogado1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function EditarPerfilAdvogado({ api }) {
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

    const [dadosOriginais, setDadosOriginais] = useState({});

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);

    const API_URL = api || ' http://192.168.0.123:5000';

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

    function formatarCpf(valor) {
        const numeros = apenasNumeros(valor);
        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor);
        if (numeros.length <= 2) return numeros.length === 0 ? '' : `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }

    function handleNome(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) {
            setNome(capitalizarNome(valor));
        }
    }

    function handleCpf(e) {
        const numeros = e.target.value.replace(/\D/g, '');
        if (numeros.length <= 11) {
            setCpf(numeros);
        }
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
        const numeros = e.target.value.replace(/\D/g, '');
        if (numeros.length <= 11) {
            setTelefone(numeros);
        }
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

    function voltarParaDashboardAdvogado() {
        navigate('/dashboard_advogado');
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

    useEffect(() => {
        async function carregarDados() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const resposta = await fetch(`${API_URL}/meus_dados`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    const user = dados.usuario;
                    setNome(user.nome || '');
                    setCpf(apenasNumeros(user.cpf || ''));
                    setRg(user.rg || '');
                    setOrgaoExpeditor(user.orgao_expedidor || '');
                    setOab(user.num_oab || '');
                    setUfOab(user.uf_oab || '');
                    setNacionalidade(user.nacionalidade || '');
                    setEstadoCivil(user.estado_civil || '');
                    setTelefone(apenasNumeros(user.telefone || ''));
                    setEmail(user.email || '');

                    setDadosOriginais({
                        nome: user.nome || '',
                        cpf: apenasNumeros(user.cpf || ''),
                        rg: user.rg || '',
                        orgao_expedidor: user.orgao_expedidor || '',
                        oab: user.num_oab || '',
                        ufOab: user.uf_oab || '',
                        nacionalidade: user.nacionalidade || '',
                        estadoCivil: user.estado_civil || '',
                        telefone: apenasNumeros(user.telefone || ''),
                        email: user.email || '',
                        senha: '',
                        confirmarSenha: ''
                    });
                } else {
                    if (resposta.status === 401) {
                        localStorage.removeItem('nome');
                        localStorage.removeItem('tipo');
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    }
                    setMensagem('Erro ao carregar seus dados. Tente novamente.');
                    setTipoMensagem('erro');
                    agendarLimpezaMensagem();
                }
            } catch (erro) {
                console.error('Erro ao carregar dados:', erro);
                setMensagem('Erro de conexão ao carregar dados.');
                setTipoMensagem('erro');
                agendarLimpezaMensagem();
            } finally {
                setCarregandoDados(false);
            }
        }
        carregarDados();
    }, [API_URL, navigate]);

    async function handleSalvar(e) {
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

        if (camposFaltando.length > 0) {
            const lista = camposFaltando.join(', ');
            setMensagem(`Preencha os campos obrigatórios: ${lista}.`);
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        if (cpf.length !== 11) {
            setMensagem('CPF incompleto. Digite os 11 números do CPF.');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        if (telefone.length < 10 || telefone.length > 11) {
            setMensagem('Telefone incompleto. Digite DDD + número (10 ou 11 dígitos).');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        if (senha && senha.trim() !== '') {
            if (senha !== confirmarSenha) {
                setMensagem('As senhas não coincidem.');
                setTipoMensagem('erro');
                setCarregando(false);
                setExibirCarregamento(false);
                if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                agendarLimpezaMensagem();
                return;
            }
        }

        const houveAlteracao = (
            nome !== dadosOriginais.nome ||
            cpf !== dadosOriginais.cpf ||
            rg !== dadosOriginais.rg ||
            orgaoExpeditor !== dadosOriginais.orgao_expedidor ||
            oab !== dadosOriginais.oab ||
            ufOab !== dadosOriginais.ufOab ||
            nacionalidade !== dadosOriginais.nacionalidade ||
            estadoCivil !== dadosOriginais.estadoCivil ||
            telefone !== dadosOriginais.telefone ||
            email !== dadosOriginais.email ||
            (senha && senha.trim() !== '') ||
            fotoPerfil !== null
        );

        if (!houveAlteracao) {
            setMensagem('Nenhuma alteração foi feita no seu perfil.');
            setTipoMensagem('sucesso');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            setTimeout(() => navigate('/dashboard_advogado'), 2000);
            return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf_cnpj', cpf);
        formData.append('email', email);
        if (senha && senha.trim() !== '') {
            formData.append('senha', senha);
            formData.append('confirmar_senha', confirmarSenha);
        }
        formData.append('telefone', telefone);
        formData.append('rg', rg);
        formData.append('orgao_expedidor', orgaoExpeditor);
        formData.append('num_oab', oab);
        formData.append('uf_oab', ufOab);
        formData.append('nacionalidade', nacionalidade);
        formData.append('estado_civil', estadoCivil);
        if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(`${API_URL}/editar_perfil`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'X-Access-Token': token
                },
                body: formData
            });
            const dados = await resposta.json();

            setExibirCarregamento(false);

            if (resposta.ok) {
                setMensagem('Perfil atualizado com sucesso!');
                setTipoMensagem('sucesso');
                if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                agendarLimpezaMensagem();
                setTimeout(() => navigate('/dashboard_advogado'), 2000);
            } else {
                if (resposta.status === 401) {
                    localStorage.removeItem('nome');
                    localStorage.removeItem('tipo');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                const erro = dados.error || 'Erro ao atualizar o perfil.';

                if (erro.includes('Sua situação é')) {
                    setMensagem(erro);
                } else if (erro.includes('não encontrada no cadastro da OAB')) {
                    setMensagem(erro);
                } else if (erro.includes('já está cadastrado para outro usuário')) {
                    setMensagem(erro);
                } else if (erro.includes('CPF já cadastrado')) {
                    setMensagem(erro);
                } else if (erro.includes('E-mail já cadastrado')) {
                    setMensagem(erro);
                } else if (erro.includes('CPF inválido')) {
                    setMensagem(erro);
                } else {
                    setMensagem(erro);
                }

                setTipoMensagem('erro');
                if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                agendarLimpezaMensagem();
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setExibirCarregamento(false);
            setMensagem('Erro de conexão com o servidor. Verifique o back-end.');
            setTipoMensagem('erro');
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
        } finally {
            setCarregando(false);
        }
    }

    if (carregandoDados) {
        return (
            <div className={css.paginaCompleta}>
                <Header />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    color: '#0047ab'
                }}>
                    Carregando seus dados...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={css.paginaCompleta}>
            <Header />

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
                        <img src={'./public/Martelinho.png'} alt="Carregando" style={{
                            width: '100px',
                            height: '100px',
                            animation: 'spin 1.2s linear infinite'
                        }} />
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
                    <button className={css.botaoVoltar} onClick={voltarParaDashboardAdvogado} tabIndex={-1} name="btn-voltar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className={css.titulo}>Editar Perfil</h1>
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

                <form className={css.formulario} onSubmit={handleSalvar}>
                    <div className={css.linha}>
                        {/* ... todos os campos ... */}

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
                                value={formatarCpf(cpf)}
                                onChange={handleCpf}
                                maxLength={14}
                                tabIndex={2}
                                name="cpf"
                                data-testid="cpf-input"
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
                                value={formatarTelefone(telefone)}
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
                                <label className={css.label}>Nova senha</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    placeholder="Deixe em branco para não alterar"
                                    value={senha}
                                    onChange={handleSenha}
                                    maxLength={254}
                                    tabIndex={11}
                                    name="senha"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Confirmar nova senha</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    placeholder="Confirme a nova senha"
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
                        <button className={css.botaoSalvar} type="submit" disabled={carregando} tabIndex={14} name="btn-salvar">
                            {carregando ? 'Salvando...' : 'Salvar Alterações'}
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