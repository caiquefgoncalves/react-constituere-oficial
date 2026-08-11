import React, { useState, useRef } from 'react';
import css from './Cadastro1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function Cadastro1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null); // Referência para scroll ao topo

    // Estados dos campos
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

    // Estados de controle
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    // Função para limpar a mensagem após 7 segundos
    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) {
            clearTimeout(window.timeoutMensagem);
        }
        window.timeoutMensagem = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 7000); // 7 segundos
    }

    function handleNome(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) setNome(valor);
    }

    function handleCpf(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        if (valor.length <= 3) setCpf(valor);
        else if (valor.length <= 6) setCpf(`${valor.slice(0, 3)}.${valor.slice(3)}`);
        else if (valor.length <= 9) setCpf(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`);
        else setCpf(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9, 11)}`);
    }

    function handleTelefone(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        if (valor.length <= 2) setTelefone(valor.length === 0 ? '' : `(${valor}`);
        else if (valor.length <= 7) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
        else setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
    }

    function handleEmail(e) {
        const valor = e.target.value.replace(/\s/g, '');
        if (valor.length <= 254) setEmail(valor);
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

    async function handleCadastro(e) {
        e.preventDefault();
        setCarregando(true);
        setMensagem('');
        setTipoMensagem('');

        // Verifica campos faltando
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

            // SCROLL PARA O TOPO
            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            agendarLimpezaMensagem();
            return;
        }

        // Verifica senhas
        if (senha !== confirmarSenha) {
            setMensagem('As senhas não coincidem.');
            setTipoMensagem('erro');
            setCarregando(false);

            if (topoRef.current) {
                topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            agendarLimpezaMensagem();
            return;
        }

        // --- Envio para API ---
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf_cnpj', cpf.replace(/\D/g, ''));
        formData.append('email', email);
        formData.append('senha', senha);
        formData.append('confirmar_senha', confirmarSenha);
        formData.append('telefone', telefone.replace(/\D/g, ''));
        formData.append('rg', rg);
        formData.append('orgao_expedidor', orgaoExpeditor);
        formData.append('num_oab', oab);
        formData.append('uf_oab', ufOab);
        formData.append('nacionalidade', nacionalidade);
        formData.append('estado_civil', estadoCivil);
        formData.append('tipo', 0);
        if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

        try {
            const resposta = await fetch(`${api}/criar_usuarios`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const dados = await resposta.json();

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
            <Header />

            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button className={css.botaoVoltar} onClick={voltarParaHome} tabIndex={-1}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className={css.titulo}>Faça parte da Constituere!</h1>
                </div>

                {/* Mensagem Única Centralizada no Topo (como no print) */}
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
                        backgroundColor: tipoMensagem === 'sucesso' ? '#d4edda' : '#fce8e6', // Fundo igual ao print (rosa claro)
                        color: tipoMensagem === 'sucesso' ? '#155724' : '#a94442',          // Texto igual ao print (marrom escuro)
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
                            <input type="text" className={css.input} placeholder="Digite seu nome" value={nome} onChange={handleNome} maxLength={254} tabIndex={1} />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>CPF *</label>
                            <input type="text" className={css.input} placeholder="Digite seu CPF" value={cpf} onChange={handleCpf} maxLength={14} tabIndex={2} />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>RG *</label>
                            <input type="text" className={css.input} placeholder="Digite seu RG" value={rg} onChange={(e) => setRg(e.target.value)} tabIndex={3} />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Órgão expedidor *</label>
                            <input type="text" className={css.input} placeholder="Ex: SSP/SP" value={orgaoExpeditor} onChange={(e) => setOrgaoExpeditor(e.target.value)} tabIndex={4} />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Número da OAB *</label>
                            <input type="text" className={css.input} placeholder="Digite sua OAB" value={oab} onChange={(e) => setOab(e.target.value)} tabIndex={5} />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>UF da OAB *</label>
                            <input type="text" className={css.input} placeholder="Ex: SP" value={ufOab} onChange={(e) => setUfOab(e.target.value)} tabIndex={6} />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Nacionalidade *</label>
                            <input type="text" className={css.input} placeholder="Ex: Brasileira" value={nacionalidade} onChange={(e) => setNacionalidade(e.target.value)} tabIndex={7} />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Estado civil *</label>
                            <select className={css.input} value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} tabIndex={8}>
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
                            <input type="text" className={css.input} placeholder="Digite seu telefone" value={telefone} onChange={handleTelefone} maxLength={15} tabIndex={9} />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>E-mail *</label>
                            <input type="text" className={css.input} placeholder="Digite seu e-mail" value={email} onChange={handleEmail} maxLength={254} tabIndex={10} />
                        </div>

                        <div className={css.campoMetade} style={{ gap: '1.5rem', marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Senha *</label>
                                <input type="password" className={css.input} placeholder="Digite sua senha" value={senha} onChange={handleSenha} maxLength={254} tabIndex={11} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Confirmar senha *</label>
                                <input type="password" className={css.input} placeholder="Confirme sua senha" value={confirmarSenha} onChange={handleConfirmarSenha} maxLength={254} tabIndex={13} />
                            </div>
                        </div>

                        <div className={css.campoMetade} style={{ marginBottom: 0 }}>
                            <label className={css.label}>Foto de perfil</label>
                            <input type="file" className={css.input} onChange={(e) => setFotoPerfil(e.target.files[0])} tabIndex={12} />
                        </div>

                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button className={css.botaoCadastro} type="submit" disabled={carregando} tabIndex={14}>
                            {carregando ? 'Cadastrando...' : 'Cadastre-se'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
        </div>
    );
}