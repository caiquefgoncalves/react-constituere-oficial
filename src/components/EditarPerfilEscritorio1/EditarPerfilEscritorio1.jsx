import React, { useState, useRef, useEffect } from 'react';
import css from './EditarPerfilEscritorio1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function EditarPerfilEscritorio1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);

    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [registroOab, setRegistroOab] = useState('');
    const [ufOab, setUfOab] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [idEscritorio, setIdEscritorio] = useState(null);

    const [dadosOriginais, setDadosOriginais] = useState({});
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const API_URL = api || 'http://10.92.11.4:5000';

    const ufs = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) clearTimeout(window.timeoutMensagem);
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

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, '');
    }

    function formatarCnpj(valor) {
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
        if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
        if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
        return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }

    function formatarCep(valor) {
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 5) return numeros;
        return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }

    function handleRazaoSocial(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s0-9]/g, '');
        if (valor.length <= 254) setRazaoSocial(capitalizarNome(valor));
    }

    function handleNomeFantasia(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s0-9]/g, '');
        if (valor.length <= 254) setNomeFantasia(capitalizarNome(valor));
    }

    function handleCnpj(e) {
        const valor = e.target.value;
        setCnpj(formatarCnpj(valor));
    }

    function handleTelefone(e) {
        const valor = e.target.value;
        setTelefone(formatarTelefone(valor));
    }

    function handleEmail(e) {
        const valor = e.target.value.replace(/\s/g, '');
        if (valor.length <= 254) setEmail(valor);
    }

    function handleCep(e) {
        const valor = e.target.value;
        const cepFormatado = formatarCep(valor);
        setCep(cepFormatado);
        const cepNumeros = apenasNumeros(valor);
        if (cepNumeros.length === 8) buscarCep(cepNumeros);
        if (cepNumeros.length < 8) {
            setLogradouro('');
            setBairro('');
            setCidade('');
            setUf('');
        }
    }

    async function buscarCep(cepInformado) {
        const cepNumeros = apenasNumeros(cepInformado);
        if (cepNumeros.length !== 8) return;
        setBuscandoCep(true);
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
            if (!resposta.ok) throw new Error('Não foi possível consultar o CEP.');
            const dados = await resposta.json();
            if (dados.erro) {
                setLogradouro('');
                setBairro('');
                setCidade('');
                setUf('');
                setMensagem('CEP não encontrado.');
                setTipoMensagem('erro');
                return;
            }
            setLogradouro(dados.logradouro || '');
            setBairro(dados.bairro || '');
            setCidade(dados.localidade || '');
            setUf(dados.uf || '');
            setMensagem('CEP encontrado! Endereço preenchido.');
            setTipoMensagem('sucesso');
            setTimeout(() => setMensagem(''), 3000);
        } catch (erro) {
            console.error('Erro ao consultar CEP:', erro);
            setMensagem('Não foi possível consultar o CEP.');
            setTipoMensagem('erro');
        } finally {
            setBuscandoCep(false);
        }
    }

    function handleNumero(e) {
        const valor = apenasNumeros(e.target.value);
        if (valor.length <= 20) setNumero(valor);
    }

    function voltar() {
        navigate('/dashboard_advogado');
    }

    useEffect(() => {
        let timerAviso = null;
        if (exibirCarregamento) {
            timerAviso = setTimeout(() => setAvisoInternetLenta(true), 15000);
        } else {
            setAvisoInternetLenta(false);
        }
        return () => { if (timerAviso) clearTimeout(timerAviso); };
    }, [exibirCarregamento]);

    useEffect(() => {
        async function carregarDados() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Busca os dados do escritório do advogado logado
                const resposta = await fetch(`${API_URL}/meu_escritorio`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    const escritorio = dados.escritorio;
                    setIdEscritorio(escritorio.id);

                    setRazaoSocial(escritorio.razao_social || '');
                    setNomeFantasia(escritorio.nome_fantasia || '');
                    setRegistroOab(escritorio.registro_oab || '');
                    setUfOab(escritorio.uf_oab || '');
                    setTelefone(formatarTelefone(escritorio.telefone || ''));
                    setEmail(escritorio.email || '');
                    setCnpj(formatarCnpj(escritorio.cnpj || ''));
                    setCep(formatarCep(escritorio.cep || ''));
                    setLogradouro(escritorio.logradouro || '');
                    setNumero(escritorio.numero || '');
                    setComplemento(escritorio.complemento || '');
                    setBairro(escritorio.bairro || '');
                    setCidade(escritorio.cidade || '');
                    setUf(escritorio.estado || '');

                    setDadosOriginais({
                        razaoSocial: escritorio.razao_social || '',
                        nomeFantasia: escritorio.nome_fantasia || '',
                        registroOab: escritorio.registro_oab || '',
                        ufOab: escritorio.uf_oab || '',
                        telefone: escritorio.telefone || '',
                        email: escritorio.email || '',
                        cnpj: escritorio.cnpj || '',
                        cep: escritorio.cep || '',
                        logradouro: escritorio.logradouro || '',
                        numero: escritorio.numero || '',
                        complemento: escritorio.complemento || '',
                        bairro: escritorio.bairro || '',
                        cidade: escritorio.cidade || '',
                        uf: escritorio.estado || ''
                    });
                } else if (resposta.status === 401) {
                    localStorage.removeItem('nome');
                    localStorage.removeItem('tipo');
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                } else {
                    const data = await resposta.json();
                    setMensagem(data.error || 'Erro ao carregar dados do escritório.');
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
        if (!razaoSocial.trim()) camposFaltando.push('Razão social');
        if (!nomeFantasia.trim()) camposFaltando.push('Nome fantasia');
        if (!registroOab.trim()) camposFaltando.push('Registro OAB');
        if (!ufOab.trim()) camposFaltando.push('UF da OAB');
        if (!telefone.trim()) camposFaltando.push('Telefone');
        if (!email.trim()) camposFaltando.push('E-mail');
        if (!cnpj.trim()) camposFaltando.push('CNPJ');
        if (!cep.trim()) camposFaltando.push('CEP');
        if (!logradouro.trim()) camposFaltando.push('Logradouro');
        if (!numero.trim()) camposFaltando.push('Número');
        if (!bairro.trim()) camposFaltando.push('Bairro');
        if (!cidade.trim()) camposFaltando.push('Cidade');
        if (!uf.trim()) camposFaltando.push('Estado');

        if (camposFaltando.length > 0) {
            setMensagem(`Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`);
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        const cnpjNumeros = apenasNumeros(cnpj);
        if (cnpjNumeros.length !== 14) {
            setMensagem('CNPJ inválido. Digite os 14 números.');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        const cepNumeros = apenasNumeros(cep);
        if (cepNumeros.length !== 8) {
            setMensagem('CEP inválido. Digite os 8 números.');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        const telefoneNumeros = apenasNumeros(telefone);
        if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
            setMensagem('Telefone inválido.');
            setTipoMensagem('erro');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            return;
        }

        const houveAlteracao = (
            razaoSocial !== dadosOriginais.razaoSocial ||
            nomeFantasia !== dadosOriginais.nomeFantasia ||
            registroOab !== dadosOriginais.registroOab ||
            ufOab !== dadosOriginais.ufOab ||
            telefone !== dadosOriginais.telefone ||
            email !== dadosOriginais.email ||
            cnpj !== dadosOriginais.cnpj ||
            cep !== dadosOriginais.cep ||
            logradouro !== dadosOriginais.logradouro ||
            numero !== dadosOriginais.numero ||
            complemento !== dadosOriginais.complemento ||
            bairro !== dadosOriginais.bairro ||
            cidade !== dadosOriginais.cidade ||
            uf !== dadosOriginais.uf ||
            fotoPerfil !== null
        );

        if (!houveAlteracao) {
            setMensagem('Nenhuma alteração foi feita.');
            setTipoMensagem('sucesso');
            setCarregando(false);
            setExibirCarregamento(false);
            if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            agendarLimpezaMensagem();
            setTimeout(() => navigate('/dashboard_advogado'), 2000);
            return;
        }

        const formData = new FormData();
        formData.append('razao_social', razaoSocial.trim());
        formData.append('nome_fantasia', nomeFantasia.trim());
        formData.append('registro_oab', registroOab.trim());
        formData.append('uf_oab', ufOab.trim().toUpperCase());
        formData.append('telefone', telefoneNumeros);
        formData.append('email', email.trim());
        formData.append('cnpj', cnpjNumeros);
        formData.append('cep', cepNumeros);
        formData.append('logradouro', logradouro.trim());
        formData.append('numero', numero.trim());
        formData.append('complemento', complemento.trim());
        formData.append('bairro', bairro.trim());
        formData.append('cidade', cidade.trim());
        formData.append('estado', uf);
        if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(`${API_URL}/editar_escritorio`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token },
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
                setMensagem(dados.error || 'Erro ao atualizar perfil.');
                setTipoMensagem('erro');
                if (topoRef.current) topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                agendarLimpezaMensagem();
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setExibirCarregamento(false);
            setMensagem('Erro de conexão com o servidor.');
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
                <div className={css.loadingContainer}>
                    Carregando dados do escritório...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={css.paginaCompleta}>
            <Header />

            {exibirCarregamento && (
                <div className={css.loadingOverlay}>
                    <div className={css.loadingContent}>
                        <img src="/Martelinho.png" alt="Carregando" className={css.loadingImage} />
                        <p className={css.loadingText}>Validando dados da OAB...</p>
                        {avisoInternetLenta && (
                            <p className={css.loadingAviso}>
                                Sua internet pode estar lenta. Aguarde...
                            </p>
                        )}
                    </div>
                </div>
            )}

            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button className={css.botaoVoltar} onClick={voltar} tabIndex={-1} type="button" name="btn-voltar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className={css.titulo}>Editar Perfil do Escritório</h1>
                </div>

                {mensagem && (
                    <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleSalvar}>
                    <div className={css.linha}>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Razão social *</label>
                            <input type="text" className={css.input} placeholder="Digite a razão social" value={razaoSocial} onChange={handleRazaoSocial} maxLength={254} tabIndex={1} name="razao_social" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Nome fantasia *</label>
                            <input type="text" className={css.input} placeholder="Digite o nome fantasia" value={nomeFantasia} onChange={handleNomeFantasia} maxLength={254} tabIndex={2} name="nome_fantasia" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Registro na OAB *</label>
                            <input type="text" className={css.input} placeholder="Digite a OAB" value={registroOab} onChange={(e) => setRegistroOab(e.target.value)} maxLength={30} tabIndex={3} name="registro_oab" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>UF da OAB *</label>
                            <select className={css.input} value={ufOab} onChange={(e) => setUfOab(e.target.value)} tabIndex={4} name="uf_oab">
                                <option value="" disabled>Selecione a UF</option>
                                {ufs.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Telefone *</label>
                            <input type="text" className={css.input} placeholder="Digite seu telefone" value={telefone} onChange={handleTelefone} maxLength={15} tabIndex={5} name="telefone" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>E-mail *</label>
                            <input type="email" className={css.input} placeholder="Digite seu e-mail" value={email} onChange={handleEmail} maxLength={254} tabIndex={6} name="email" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>CNPJ *</label>
                            <input type="text" className={css.input} placeholder="Digite o CNPJ" value={cnpj} onChange={handleCnpj} maxLength={18} tabIndex={7} name="cnpj" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>CEP *</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" className={css.input} value={cep} onChange={handleCep} placeholder="Digite seu CEP" maxLength={9} tabIndex={8} name="cep" />
                                {buscandoCep && (
                                    <span className={css.buscandoCep}>Buscando...</span>
                                )}
                            </div>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Logradouro *</label>
                            <input type="text" className={css.input} placeholder="Digite seu logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} maxLength={254} tabIndex={9} name="logradouro" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Número *</label>
                            <input type="text" className={css.input} placeholder="Digite seu número" value={numero} onChange={handleNumero} maxLength={20} tabIndex={10} name="numero" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Complemento</label>
                            <input type="text" className={css.input} placeholder="Digite o complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} maxLength={100} tabIndex={11} name="complemento" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Bairro *</label>
                            <input type="text" className={css.input} placeholder="Digite seu bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} maxLength={100} tabIndex={12} name="bairro" />
                        </div>

                        <div className={css.campoMetade} style={{ gap: '1.5rem', marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Cidade *</label>
                                <input type="text" className={css.input} placeholder="Digite sua cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} maxLength={100} tabIndex={13} name="cidade" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Estado *</label>
                                <select className={css.input} value={uf} onChange={(e) => setUf(e.target.value)} tabIndex={14} name="estado">
                                    <option value="" disabled>Selecione a UF</option>
                                    {ufs.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={css.campoMetade} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                            <label className={css.label}>Foto de perfil</label>
                            <div className={css.fotoContainer}>
                                <input
                                    type="file"
                                    className={css.inputFile}
                                    accept="image/*"
                                    onChange={(e) => setFotoPerfil(e.target.files[0] || null)}
                                    tabIndex={15}
                                    name="foto_perfil"
                                />
                            </div>
                        </div>

                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button className={css.botaoSalvar} type="submit" disabled={carregando} tabIndex={16} name="btn-salvar">
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