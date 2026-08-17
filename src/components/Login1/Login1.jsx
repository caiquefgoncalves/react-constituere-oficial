import React, { useState } from 'react';
import css from './Login1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate, Link } from 'react-router-dom';

export default function Login1({ api }) {
    const navigate = useNavigate();

    const [cpfCnpj, setCpfCnpj] = useState('');
    const [senha, setSenha] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);


    function handleCpfCnpj(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length <= 14) {

            if (valor.length <= 11) {

                if (valor.length <= 3) setCpfCnpj(valor);
                else if (valor.length <= 6) setCpfCnpj(`${valor.slice(0, 3)}.${valor.slice(3)}`);
                else if (valor.length <= 9) setCpfCnpj(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`);
                else setCpfCnpj(`${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9, 11)}`);
            } else {

                if (valor.length <= 12) setCpfCnpj(`${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8)}`);
                else setCpfCnpj(`${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12, 14)}`);
            }
        }
    }

    function handleSenha(e) {
        setSenha(e.target.value);
    }

    function voltarParaHome() {
        navigate('/');
    }

    async function handleLogin(e) {
        e.preventDefault();
        setCarregando(true);
        setMensagem('');
        setTipoMensagem('');


        const cpfLimpo = cpfCnpj.replace(/\D/g, '');

        if (!cpfLimpo || !senha) {
            setMensagem('Preencha o CPF/CNPJ e a Senha.');
            setTipoMensagem('erro');
            setCarregando(false);
            return;
        }

        try {
            const resposta = await fetch(`${api}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpf_cnpj: cpfLimpo,
                    senha: senha
                })
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('token', dados.token);
                localStorage.setItem('nome', dados.nome);
                localStorage.setItem('tipo', dados.tipo);
                localStorage.setItem('id_usuario', dados.id_usuario);

                setMensagem('Login realizado com sucesso! Redirecionando...');
                setTipoMensagem('sucesso');

                setTimeout(() => {
                    if (dados.tipo === 0) navigate('/dashboard_advogado');
                    else if (dados.tipo === 1) navigate('/dashboard_escritorio');
                    else if (dados.tipo === 2) navigate('/dashboard_cliente');
                    else navigate('/');
                }, 2000);
            } else {

                setMensagem(dados.error || 'Erro ao fazer login. Verifique CPF e senha.');
                setTipoMensagem('erro');
            }
        } catch (erro) {
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={api} />

            <section className={css.containerSection}>
                <div className={css.topArea}>
                    <h1 className={css.titulo}>Bem-vindo de volta!</h1>
                </div>

                {mensagem && (
                    <div style={{
                        padding: '16px 20px',
                        margin: '0 auto 25px auto',
                        maxWidth: '400px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontFamily: 'Clear Sans, sans-serif',
                        fontWeight: '700',
                        fontSize: '1rem',
                        backgroundColor: tipoMensagem === 'sucesso' ? '#d4edda' : '#fce8e6',
                        color: tipoMensagem === 'sucesso' ? '#155724' : '#a94442',
                        border: tipoMensagem === 'sucesso' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleLogin}>
                    <div className={css.linha}>
                        <div className={css.campoInteiro}>
                            <label className={css.label}>CPF/CNPJ</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite seu CPF ou CNPJ"
                                value={cpfCnpj}
                                onChange={handleCpfCnpj}
                                maxLength={18}
                                tabIndex={1}
                            />
                        </div>

                        <div className={css.campoInteiro}>
                            <label className={css.label}>Senha</label>
                            <input
                                type="password"
                                className={css.input}
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={handleSenha}
                                maxLength={254}
                                tabIndex={2}
                            />
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button className={css.botaoLogin} type="submit" disabled={carregando} tabIndex={3}>
                            {carregando ? 'Entrando...' : 'Login'}
                        </button>
                    </div>

                    <div className={css.linkContainer}>
                        <p className={css.textoLink}>
                            Ainda não é nosso cliente? <Link to="/cadastro" className={css.linkCadastro}>Cadastre-se</Link>
                        </p>
                    </div>
                </form>
            </section>

            <Footer />
        </div>
    );
}