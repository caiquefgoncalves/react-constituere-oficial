import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './CadastroClienteJuridico1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";

export default function CadastroClienteJuridico1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);


    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const [isFisico, setIsFisico] = useState(false);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [exibirCarregamento, setExibirCarregamento] = useState(false);
    const [avisoInternetLenta, setAvisoInternetLenta] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const API_URL = api || 'http://192.168.0.123:5000';
    const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

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


    function handleRazaoSocial(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s0-9]/g, '');
        if (valor.length <= 254) setRazaoSocial(capitalizarNome(valor));
    }

    function handleNomeFantasia(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s0-9]/g, '');
        if (valor.length <= 254) setNomeFantasia(capitalizarNome(valor));
    }

    function handleCnpj(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 14) valor = valor.slice(0, 14);
        if (valor.length <= 2) setCnpj(valor);
        else if (valor.length <= 5) setCnpj(`${valor.slice(0,2)}.${valor.slice(2)}`);
        else if (valor.length <= 8) setCnpj(`${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5)}`);
        else if (valor.length <= 12) setCnpj(`${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5,8)}/${valor.slice(8)}`);
        else setCnpj(`${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5,8)}/${valor.slice(8,12)}-${valor.slice(12,14)}`);
    }

    function handleTelefone(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 11) valor = valor.slice(0, 11);
        if (valor.length === 0) setTelefone('');
        else if (valor.length <= 2) setTelefone(`(${valor}`);
        else if (valor.length <= 7) setTelefone(`(${valor.slice(0,2)}) ${valor.slice(2)}`);
        else setTelefone(`(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7,11)}`);
    }

    function handleEmail(e) {
        const valor = e.target.value.replace(/\s/g, '');
        if (valor.length <= 254) setEmail(valor);
    }

    function handleCep(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 8) valor = valor.slice(0, 8);
        if (valor.length <= 5) setCep(valor);
        else setCep(`${valor.slice(0,5)}-${valor.slice(5,8)}`);
        if (valor.length === 8) buscarCep(valor);
        if (valor.length < 8) {
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
                mostrarErro('CEP não encontrado. Verifique o número informado.');
                return;
            }
            setLogradouro(dados.logradouro || '');
            setBairro(dados.bairro || '');
            setCidade(dados.localidade || '');
            setUf(dados.uf || '');
            setMensagem('');
            setTipoMensagem('');
        } catch (erro) {
            console.error('Erro ao consultar CEP:', erro);
            mostrarErro('Não foi possível consultar o CEP. Verifique sua conexão com a internet.');
        } finally {
            setBuscandoCep(false);
        }
    }

    function handleNumero(e) {
        const valor = apenasNumeros(e.target.value);
        if (valor.length <= 20) setNumero(valor);
    }

    function handleSenha(e) {
        if (e.target.value.length <= 254) setSenha(e.target.value);
    }

    function handleConfirmarSenha(e) {
        if (e.target.value.length <= 254) setConfirmarSenha(e.target.value);
    }

    function voltar() {
        navigate('/clientes');
    }

    useEffect(() => {
        const dadosSalvos = localStorage.getItem('clienteJuridicoDados');
        if (dadosSalvos) {
            try {
                const dados = JSON.parse(dadosSalvos);
                setRazaoSocial(dados.razaoSocial || '');
                setNomeFantasia(dados.nomeFantasia || '');
                setCnpj(dados.cnpj || '');
                setTelefone(dados.telefone || '');
                setEmail(dados.email || '');
                setSenha(dados.senha || '');
                setConfirmarSenha(dados.confirmarSenha || '');
                setCep(dados.cep || '');
                setLogradouro(dados.logradouro || '');
                setNumero(dados.numero || '');
                setComplemento(dados.complemento || '');
                setBairro(dados.bairro || '');
                setCidade(dados.cidade || '');
                setUf(dados.uf || '');
                if (dados.fotoPerfil) {
                }
            } catch (e) {
                console.error('Erro ao recuperar dados salvos:', e);
            }
        }
    }, []);

    useEffect(() => {
        let timerAviso = null;
        if (exibirCarregamento) {
            timerAviso = setTimeout(() => setAvisoInternetLenta(true), 15000);
        } else {
            setAvisoInternetLenta(false);
        }
        return () => { if (timerAviso) clearTimeout(timerAviso); };
    }, [exibirCarregamento]);


    function irParaRepresentante(e) {
        e.preventDefault();


        let camposFaltando = [];
        if (!razaoSocial.trim()) camposFaltando.push('Razão social');
        if (!nomeFantasia.trim()) camposFaltando.push('Nome fantasia');
        if (!cnpj.trim()) camposFaltando.push('CNPJ');
        if (!telefone.trim()) camposFaltando.push('Telefone');
        if (!email.trim()) camposFaltando.push('E-mail');
        if (!cep.trim()) camposFaltando.push('CEP');
        if (!logradouro.trim()) camposFaltando.push('Logradouro');
        if (!numero.trim()) camposFaltando.push('Número');
        if (!bairro.trim()) camposFaltando.push('Bairro');
        if (!cidade.trim()) camposFaltando.push('Cidade');
        if (!uf.trim()) camposFaltando.push('Estado');
        if (!senha.trim()) camposFaltando.push('Senha');
        if (!confirmarSenha.trim()) camposFaltando.push('Confirmar senha');

        if (camposFaltando.length > 0) {
            mostrarErro(`Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`);
            return;
        }

        const cnpjNumeros = apenasNumeros(cnpj);
        if (cnpjNumeros.length !== 14) {
            mostrarErro('CNPJ incompleto. Digite os 14 números do CNPJ.');
            return;
        }

        const cepNumeros = apenasNumeros(cep);
        if (cepNumeros.length !== 8) {
            mostrarErro('CEP incompleto. Digite os 8 números do CEP.');
            return;
        }

        const telefoneNumeros = apenasNumeros(telefone);
        if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
            mostrarErro('Telefone incompleto. Digite DDD + número (10 ou 11 dígitos).');
            return;
        }

        if (senha !== confirmarSenha) {
            mostrarErro('As senhas não coincidem.');
            return;
        }


        const dadosCliente = {
            razaoSocial,
            nomeFantasia,
            cnpj: cnpjNumeros,
            telefone: telefoneNumeros,
            email,
            senha,
            confirmarSenha,
            cep: cepNumeros,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
            fotoPerfil: fotoPerfil ? true : false
        };

        localStorage.setItem('clienteJuridicoDados', JSON.stringify(dadosCliente));

        mostrarSucesso('Dados salvos! Redirecionando para cadastro do representante...');

        setTimeout(() => {
            navigate('/cadastro-representante');
        }, 1000);
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
                    backgroundColor: 'rgba(0,0,0,0.7)',
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
                        <img src="/Martelinho.png" alt="Carregando" style={{
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
                            Salvando dados...
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
                                Sua internet pode estar lenta. Por favor, aguarde mais alguns segundos...
                            </p>
                        )}
                    </div>
                </div>
            )}

            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button
                        className={css.botaoVoltar}
                        onClick={voltar}
                        tabIndex={-1}
                        type="button"
                        name="btn-voltar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className={css.titulo} style={{ color: '#0047ab' }}>Cadastre seu cliente</h1>
                </div>

                {mensagem && (
                    <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                        {mensagem}
                    </div>
                )}

                <BotaoAlternar fisico={isFisico} onToggle={setIsFisico} />

                <form className={css.formulario} onSubmit={irParaRepresentante}>
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
                            <label className={css.label}>CNPJ *</label>
                            <input type="text" className={css.input} placeholder="Digite o CNPJ" value={cnpj} onChange={handleCnpj} maxLength={18} tabIndex={3} name="cnpj" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>CEP *</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" className={css.input} value={cep} onChange={handleCep} placeholder="Digite seu CEP" maxLength={9} tabIndex={5} name="cep" />
                                {buscandoCep && (
                                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: '#666' }}>Buscando...</span>
                                )}
                            </div>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Logradouro *</label>
                            <input type="text" className={css.input} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Digite seu logradouro" maxLength={254} tabIndex={6} name="logradouro" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Número *</label>
                            <input type="text" className={css.input} value={numero} onChange={handleNumero} placeholder="Digite seu número" maxLength={20} tabIndex={7} name="numero" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Complemento</label>
                            <input type="text" className={css.input} value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Digite o complemento" maxLength={100} tabIndex={8} name="complemento" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Bairro *</label>
                            <input type="text" className={css.input} value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Digite seu bairro" maxLength={100} tabIndex={9} name="bairro" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Cidade *</label>
                            <input type="text" className={css.input} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Digite sua cidade" maxLength={100} tabIndex={10} name="cidade" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>UF *</label>
                            <select className={css.input} value={uf} onChange={(e) => setUf(e.target.value)} tabIndex={11} name="uf">
                                <option value="" disabled>Selecione a UF</option>
                                {ufs.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Telefone *</label>
                            <input type="text" className={css.input} value={telefone} onChange={handleTelefone} placeholder="Digite seu telefone" maxLength={15} tabIndex={12} name="telefone" />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>E-mail *</label>
                            <input type="text" className={css.input} value={email} onChange={handleEmail} placeholder="Digite seu e-mail" maxLength={254} tabIndex={13} name="email" />
                        </div>

                        <div className={css.campoMetade} style={{ gap: '1.5rem', marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Senha *</label>
                                <input type="password" className={css.input} value={senha} onChange={handleSenha} placeholder="Digite sua senha" maxLength={254} tabIndex={14} name="senha" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Confirmar senha *</label>
                                <input type="password" className={css.input} value={confirmarSenha} onChange={handleConfirmarSenha} placeholder="Confirme sua senha" maxLength={254} tabIndex={15} name="confirmar_senha" />
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
                                    tabIndex={16}
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
                        <button
                            className={css.botaoCadastro}
                            type="submit"
                            disabled={carregando}
                            tabIndex={17}
                            name="btn-ir-representante"
                        >
                            {carregando ? 'Salvando...' : 'Ir para Representante'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}