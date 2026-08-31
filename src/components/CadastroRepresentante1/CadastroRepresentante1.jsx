import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import css from './CasdastroRepresentante1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

export default function CadastroRepresentante1({ api }) {
    const navigate = useNavigate();
    const { idCliente } = useParams();
    const topoRef = useRef(null);

    const [nomeCompleto, setNomeCompleto] = useState('');
    const [profissao, setProfissao] = useState('');
    const [cpf, setCpf] = useState('');
    const [sexo, setSexo] = useState('');
    const [rg, setRg] = useState('');
    const [orgaoExpedidor, setOrgaoExpedidor] = useState('');
    const [nacionalidade, setNacionalidade] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);

    const API_URL = api || 'http://10.92.11.4:5000';

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

    function mostrarErro(texto) {
        setMensagem(texto);
        setTipoMensagem('erro');
        setCarregando(false);
        setExibirCarregamento(false);
        if (topoRef.current) {
            topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        agendarLimpezaMensagem();
    }

    function mostrarSucesso(texto) {
        setMensagem(texto);
        setTipoMensagem('sucesso');
        agendarLimpezaMensagem();
    }

    function handleNome(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) setNomeCompleto(capitalizarNome(valor));
    }

    function handleProfissao(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 100) setProfissao(capitalizarNome(valor));
    }

    function handleCpf(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 11) valor = valor.slice(0, 11);
        if (valor.length <= 3) setCpf(valor);
        else if (valor.length <= 6) setCpf(`${valor.slice(0,3)}.${valor.slice(3)}`);
        else if (valor.length <= 9) setCpf(`${valor.slice(0,3)}.${valor.slice(3,6)}.${valor.slice(6)}`);
        else setCpf(`${valor.slice(0,3)}.${valor.slice(3,6)}.${valor.slice(6,9)}-${valor.slice(9,11)}`);
    }

    function handleRg(e) {
        let valor = e.target.value.replace(/[^0-9Xx]/g, '');
        if (valor.length > 9) valor = valor.slice(0, 9);
        if (valor.length <= 2) setRg(valor);
        else if (valor.length <= 5) setRg(`${valor.slice(0,2)}.${valor.slice(2)}`);
        else if (valor.length <= 8) setRg(`${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5)}`);
        else {
            const ultimoChar = valor.slice(8).toUpperCase();
            setRg(`${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5,8)}-${ultimoChar}`);
        }
    }

    function handleOrgaoExpedidor(e) {
        const valor = e.target.value.replace(/[^a-zA-Z0-9/]/g, '');
        if (valor.length <= 50) setOrgaoExpedidor(valor);
    }

    function handleNacionalidade(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 50) setNacionalidade(capitalizarNome(valor));
    }

    function voltar() {
        navigate('/clientes');
    }


    async function handleCadastrarClienteERepresentante(e) {
        e.preventDefault();
        if (carregando) return;
        setCarregando(true);
        setExibirCarregamento(true);
        setAvisoInternetLenta(false);
        setMensagem('');
        setTipoMensagem('');

        let camposFaltando = [];
        if (!nomeCompleto.trim()) camposFaltando.push('Nome completo');
        if (!cpf.trim()) camposFaltando.push('CPF');
        if (!sexo.trim()) camposFaltando.push('Sexo');

        if (camposFaltando.length > 0) {
            mostrarErro(`Preencha os campos obrigatórios do representante: ${camposFaltando.join(', ')}.`);
            return;
        }

        const cpfNumeros = apenasNumeros(cpf);
        if (cpfNumeros.length !== 11) {
            mostrarErro('CPF incompleto. Digite os 11 números do CPF.');
            return;
        }


        const dadosClienteStr = localStorage.getItem('clienteJuridicoDados');
        if (!dadosClienteStr) {
            mostrarErro('Dados do cliente não encontrados. Por favor, cadastre o cliente primeiro.');
            setCarregando(false);
            setExibirCarregamento(false);
            return;
        }

        const dadosCliente = JSON.parse(dadosClienteStr);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                mostrarErro('Você precisa estar logado.');
                navigate('/login');
                return;
            }


            const formDataCliente = new FormData();
            formDataCliente.append('nome', dadosCliente.nomeFantasia);
            formDataCliente.append('razao_social', dadosCliente.razaoSocial);
            formDataCliente.append('nome_fantasia', dadosCliente.nomeFantasia);
            formDataCliente.append('cpf_cnpj', dadosCliente.cnpj);
            formDataCliente.append('cnpj', dadosCliente.cnpj);
            formDataCliente.append('telefone', dadosCliente.telefone);
            formDataCliente.append('email', dadosCliente.email);
            formDataCliente.append('senha', dadosCliente.senha);
            formDataCliente.append('confirmar_senha', dadosCliente.confirmarSenha);
            formDataCliente.append('tipo', '3');
            formDataCliente.append('cep', dadosCliente.cep);
            formDataCliente.append('logradouro', dadosCliente.logradouro);
            formDataCliente.append('numero', dadosCliente.numero);
            formDataCliente.append('complemento', dadosCliente.complemento || '');
            formDataCliente.append('bairro', dadosCliente.bairro);
            formDataCliente.append('cidade', dadosCliente.cidade);
            formDataCliente.append('estado', dadosCliente.uf);

            const respostaCliente = await fetch(`${API_URL}/criar_usuarios`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-Access-Token': token
                },
                body: formDataCliente
            });

            const dadosClienteResposta = await respostaCliente.json();

            if (!respostaCliente.ok) {
                setExibirCarregamento(false);
                mostrarErro(dadosClienteResposta.error || 'Erro ao cadastrar cliente jurídico.');
                setCarregando(false);
                return;
            }

            const idClienteCadastrado = dadosClienteResposta.id || dadosClienteResposta.cliente_id || dadosClienteResposta.usuario_id;


            const formDataRepresentante = {
                id_cliente: parseInt(idClienteCadastrado),
                nome_completo: nomeCompleto,
                profissao: profissao,
                cpf: cpfNumeros,
                sexo: sexo,
                rg: rg,
                orgao_expedidor: orgaoExpedidor,
                nacionalidade: nacionalidade,
                estado_civil: estadoCivil
            };

            const respostaRep = await fetch(`${API_URL}/representante`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(formDataRepresentante)
            });

            const dadosRep = await respostaRep.json();
            setExibirCarregamento(false);

            if (respostaRep.ok) {
                localStorage.removeItem('clienteJuridicoDados');

                mostrarSucesso('Cliente jurídico e representante cadastrados com sucesso!');
                setCarregando(false);
                setTimeout(() => navigate('/clientes'), 2000);
            } else {
                mostrarErro(dadosRep.error || 'Cliente cadastrado, mas erro ao cadastrar representante.');
                setCarregando(false);
            }
        } catch (erro) {
            console.error('Erro ao cadastrar:', erro);
            setExibirCarregamento(false);
            mostrarErro(erro.message || 'Erro ao cadastrar. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }


    async function handleCadastrarRepresentante(e) {
        e.preventDefault();
        if (carregando) return;
        setCarregando(true);
        setExibirCarregamento(true);
        setAvisoInternetLenta(false);
        setMensagem('');
        setTipoMensagem('');

        let camposFaltando = [];
        if (!nomeCompleto.trim()) camposFaltando.push('Nome completo');
        if (!cpf.trim()) camposFaltando.push('CPF');
        if (!sexo.trim()) camposFaltando.push('Sexo');

        if (camposFaltando.length > 0) {
            mostrarErro(`Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`);
            return;
        }

        const cpfNumeros = apenasNumeros(cpf);
        if (cpfNumeros.length !== 11) {
            mostrarErro('CPF incompleto. Digite os 11 números do CPF.');
            return;
        }

        if (!idCliente) {
            mostrarErro('ID do cliente jurídico não informado.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                mostrarErro('Você precisa estar logado.');
                navigate('/login');
                return;
            }

            const formData = {
                id_cliente: parseInt(idCliente),
                nome_completo: nomeCompleto,
                profissao: profissao,
                cpf: cpfNumeros,
                sexo: sexo,
                rg: rg,
                orgao_expedidor: orgaoExpedidor,
                nacionalidade: nacionalidade,
                estado_civil: estadoCivil
            };

            const resposta = await fetch(`${API_URL}/representante`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(formData)
            });

            const dados = await resposta.json();
            setExibirCarregamento(false);

            if (resposta.ok) {
                mostrarSucesso(dados.mensagem || 'Representante cadastrado com sucesso!');
                setCarregando(false);
                setTimeout(() => navigate('/clientes'), 2000);
            } else {
                mostrarErro(dados.error || 'Erro ao cadastrar representante.');
            }
        } catch (erro) {
            console.error('Erro ao cadastrar representante:', erro);
            setExibirCarregamento(false);
            mostrarErro(erro.message || 'Erro ao cadastrar representante. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }

    function irParaCadastroCliente() {
        navigate('/cadastro_cliente_juridico');
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

    const handleSubmit = idCliente ? handleCadastrarRepresentante : handleCadastrarClienteERepresentante;

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            {exibirCarregamento && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', padding: '30px' }}>
                        <img src="/Martelinho.png" alt="Carregando" style={{ width: '100px', height: '100px', animation: 'spin 1.2s linear infinite' }} />
                        <p style={{ color: 'white', fontSize: '1.2rem', fontFamily: 'Clear Sans, sans-serif', fontWeight: 'bold' }}>
                            {idCliente ? 'Cadastrando representante...' : 'Cadastrando cliente e representante...'}
                        </p>
                        {avisoInternetLenta && (
                            <p style={{ color: '#ffc107', fontSize: '1rem', fontFamily: 'Clear Sans, sans-serif', fontWeight: 'bold', marginTop: '10px', maxWidth: '400px' }}>
                                Sua internet pode estar lenta. Por favor, aguarde mais alguns segundos...
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
                    <h1 className={css.titulo}>
                        {idCliente ? 'Cadastre seu representante' : 'Cadastre seu cliente e representante'}
                    </h1>
                </div>

                {mensagem && (
                    <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleSubmit}>
                    <div className={css.linha}>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Nome completo *</label>
                            <input type="text" className={css.input} placeholder="Digite o nome completo" value={nomeCompleto} onChange={handleNome} maxLength={254} tabIndex={1} name="nome_completo" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Profissão</label>
                            <input type="text" className={css.input} placeholder="Digite a profissão" value={profissao} onChange={handleProfissao} maxLength={100} tabIndex={2} name="profissao" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>CPF *</label>
                            <input type="text" className={css.input} placeholder="Digite o CPF" value={cpf} onChange={handleCpf} maxLength={14} tabIndex={3} name="cpf" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Sexo *</label>
                            <select className={css.input} value={sexo} onChange={(e) => setSexo(e.target.value)} tabIndex={4} name="sexo">
                                <option value="" disabled>Selecione o sexo</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Prefiro não informar">Prefiro não informar</option>
                            </select>
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>RG</label>
                            <input type="text" className={css.input} placeholder="Digite o RG" value={rg} onChange={handleRg} maxLength={15} tabIndex={5} name="rg" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Órgão expedidor</label>
                            <input type="text" className={css.input} placeholder="Digite o órgão expedidor" value={orgaoExpedidor} onChange={handleOrgaoExpedidor} maxLength={50} tabIndex={6} name="orgao_expedidor" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Nacionalidade</label>
                            <input type="text" className={css.input} placeholder="Ex: Brasileira" value={nacionalidade} onChange={handleNacionalidade} maxLength={50} tabIndex={7} name="nacionalidade" />
                        </div>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Estado civil</label>
                            <select className={css.input} value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} tabIndex={8} name="estado_civil">
                                <option value="" disabled>Selecione o estado civil</option>
                                <option value="Solteiro(a)">Solteiro(a)</option>
                                <option value="Casado(a)">Casado(a)</option>
                                <option value="Divorciado(a)">Divorciado(a)</option>
                                <option value="Viúvo(a)">Viúvo(a)</option>
                                <option value="União Estável">União Estável</option>
                            </select>
                        </div>

                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button
                            className={css.botaoCadastro}
                            type="submit"
                            disabled={carregando}
                            tabIndex={9}
                            name="btn-cadastrar"
                        >
                            {carregando ? 'Cadastrando...' : (idCliente ? 'Cadastrar Representante' : 'Cadastrar Cliente')}
                        </button>
                    </div>

                    {!idCliente && (
                        <div className={css.botaoContainer} style={{ marginTop: '1rem' }}>
                            <button
                                className={css.botaoCadastrarCliente}
                                type="button"
                                onClick={irParaCadastroCliente}
                                tabIndex={10}
                                name="btn-voltar-cliente"
                            >
                                Voltar para Cadastro do Cliente
                            </button>
                        </div>
                    )}
                </form>
            </section>

            <Footer />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}