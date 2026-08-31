import { useState, useRef, useEffect } from 'react';
import css from './CadastroClienteFisico1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";

export default function CadastroClienteFisico1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);

    const [nomeCompleto, setNomeCompleto] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpf, setCpf] = useState('');
    const [sexo, setSexo] = useState('');
    const [rg, setRg] = useState('');
    const [orgaoExpedidor, setOrgaoExpedidor] = useState('');
    const [carteiraTrabalho, setCarteiraTrabalho] = useState('');
    const [serieCarteira, setSerieCarteira] = useState('');
    const [profissao, setProfissao] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [nacionalidade, setNacionalidade] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const [isFisico, setIsFisico] = useState(true);

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

    function handleNome(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) setNomeCompleto(capitalizarNome(valor));
    }

    function handleDataNascimento(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 8) valor = valor.slice(0, 8);
        if (valor.length <= 2) setDataNascimento(valor);
        else if (valor.length <= 4) setDataNascimento(`${valor.slice(0,2)}/${valor.slice(2)}`);
        else setDataNascimento(`${valor.slice(0,2)}/${valor.slice(2,4)}/${valor.slice(4,8)}`);
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
        if (valor.length <= 20) setOrgaoExpedidor(valor);
    }

    function handleCarteiraTrabalho(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 7) valor = valor.slice(0, 7);
        setCarteiraTrabalho(valor);
    }

    function handleSerieCarteira(e) {
        let valor = apenasNumeros(e.target.value);
        if (valor.length > 4) valor = valor.slice(0, 4);
        setSerieCarteira(valor);
    }

    function handleProfissao(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 254) setProfissao(capitalizarNome(valor));
    }

    function handleNacionalidade(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 50) setNacionalidade(capitalizarNome(valor));
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
        let timerAviso = null;
        if (exibirCarregamento) {
            timerAviso = setTimeout(() => setAvisoInternetLenta(true), 15000);
        } else {
            setAvisoInternetLenta(false);
        }
        return () => { if (timerAviso) clearTimeout(timerAviso); };
    }, [exibirCarregamento]);

    async function handleCadastro(e) {
        e.preventDefault();
        if (carregando) return;
        setCarregando(true);
        setExibirCarregamento(true);
        setAvisoInternetLenta(false);
        setMensagem('');
        setTipoMensagem('');

        let camposFaltando = [];
        if (!nomeCompleto.trim()) camposFaltando.push('Nome completo');
        if (!dataNascimento.trim()) camposFaltando.push('Data de nascimento');
        if (!cpf.trim()) camposFaltando.push('CPF');
        if (!sexo.trim()) camposFaltando.push('Sexo');
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

        const cpfNumeros = apenasNumeros(cpf);
        if (cpfNumeros.length !== 11) {
            mostrarErro('CPF incompleto. Digite os 11 números do CPF.');
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


        function converterDataParaBanco(data) {
            if (!data) return null;
            const dataLimpa = data.replace(/[\/\-]/g, '/');
            const partes = dataLimpa.split('/');
            if (partes.length === 3) {
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
            return data;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                mostrarErro('Você precisa estar logado para cadastrar um cliente.');
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('nome', nomeCompleto);
            formData.append('cpf_cnpj', cpfNumeros);
            formData.append('telefone', telefoneNumeros);
            formData.append('email', email);
            formData.append('senha', senha);
            formData.append('confirmar_senha', confirmarSenha);
            formData.append('tipo', 2);
            formData.append('data_nascimento', converterDataParaBanco(dataNascimento));
            formData.append('sexo', sexo);
            formData.append('rg', rg);
            formData.append('orgao_expedidor', orgaoExpedidor);
            formData.append('carteira_trabalho', carteiraTrabalho);
            formData.append('serie_carteira', serieCarteira);
            formData.append('profissao', profissao);
            formData.append('estado_civil', estadoCivil);
            formData.append('nacionalidade', nacionalidade);
            formData.append('cep', cepNumeros);
            formData.append('logradouro', logradouro);
            formData.append('numero', numero);
            formData.append('complemento', complemento);
            formData.append('bairro', bairro);
            formData.append('cidade', cidade);
            formData.append('estado', uf);
            if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

            const resposta = await fetch(`${API_URL}/criar_usuarios`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-Access-Token': token },
                body: formData
            });

            const dados = await resposta.json();
            setExibirCarregamento(false);

            if (resposta.ok) {
                setMensagem('Cliente cadastrado com sucesso!');
                setTipoMensagem('sucesso');
                setCarregando(false);
                agendarLimpezaMensagem();
                setTimeout(() => navigate('/clientes'), 2000);
            } else {
                setMensagem(dados.error || 'Erro ao cadastrar cliente.');
                setTipoMensagem('erro');
                setCarregando(false);
                agendarLimpezaMensagem();
            }
        } catch (erro) {
            console.error('Erro ao cadastrar cliente:', erro);
            setExibirCarregamento(false);
            setMensagem(erro.message || 'Erro ao cadastrar cliente. Tente novamente.');
            setTipoMensagem('erro');
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
                            Cadastrando seu cliente...
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
                    <h1 className={css.titulo}>Cadastre seu cliente</h1>
                </div>

                {mensagem && (
                    <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                        {mensagem}
                    </div>
                )}

                <BotaoAlternar fisico={isFisico} onToggle={setIsFisico} />

                <form className={css.formulario} onSubmit={handleCadastro}>
                    <div className={css.linha}>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Nome completo *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o nome completo"
                                value={nomeCompleto}
                                onChange={handleNome}
                                maxLength={254}
                                tabIndex={1}
                                name="nome_completo"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Data de nascimento *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="DD/MM/AAAA"
                                value={dataNascimento}
                                onChange={handleDataNascimento}
                                maxLength={10}
                                tabIndex={2}
                                name="data_nascimento"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>CPF *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o CPF"
                                value={cpf}
                                onChange={handleCpf}
                                maxLength={14}
                                tabIndex={3}
                                name="cpf"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Sexo *</label>
                            <select
                                className={css.input}
                                value={sexo}
                                onChange={(e) => setSexo(e.target.value)}
                                tabIndex={4}
                                name="sexo"
                            >
                                <option value="" disabled>Selecione o sexo</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Prefiro não informar">Prefiro não informar</option>
                            </select>
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>RG</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o RG"
                                value={rg}
                                onChange={handleRg}
                                maxLength={15}
                                tabIndex={5}
                                name="rg"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Órgão expedidor</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o órgão expedidor"
                                value={orgaoExpedidor}
                                onChange={handleOrgaoExpedidor}
                                maxLength={20}
                                tabIndex={6}
                                name="orgao_expedidor"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Número da carteira de trabalho</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o número da carteira"
                                value={carteiraTrabalho}
                                onChange={handleCarteiraTrabalho}
                                maxLength={7}
                                tabIndex={7}
                                name="carteira_trabalho"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Série da carteira de trabalho</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite a série"
                                value={serieCarteira}
                                onChange={handleSerieCarteira}
                                maxLength={4}
                                tabIndex={8}
                                name="serie_carteira"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Profissão</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite a profissão"
                                value={profissao}
                                onChange={handleProfissao}
                                maxLength={254}
                                tabIndex={9}
                                name="profissao"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Estado civil</label>
                            <select
                                className={css.input}
                                value={estadoCivil}
                                onChange={(e) => setEstadoCivil(e.target.value)}
                                tabIndex={10}
                                name="estado_civil"
                            >
                                <option value="" disabled>Selecione o estado civil</option>
                                <option value="Solteiro(a)">Solteiro(a)</option>
                                <option value="Casado(a)">Casado(a)</option>
                                <option value="Divorciado(a)">Divorciado(a)</option>
                                <option value="Viúvo(a)">Viúvo(a)</option>
                                <option value="União Estável">União Estável</option>
                            </select>
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Nacionalidade</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Ex: Brasileira"
                                value={nacionalidade}
                                onChange={handleNacionalidade}
                                maxLength={50}
                                tabIndex={11}
                                name="nacionalidade"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>CEP *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className={css.input}
                                    value={cep}
                                    onChange={handleCep}
                                    placeholder="Digite seu CEP"
                                    maxLength={9}
                                    tabIndex={12}
                                    name="cep"
                                />
                                {buscandoCep && (
                                    <span style={{
                                        position: 'absolute',
                                        right: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '0.9rem',
                                        color: '#666'
                                    }}>
                                        Buscando...
                                    </span>
                                )}
                            </div>
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Logradouro *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={logradouro}
                                onChange={(e) => setLogradouro(e.target.value)}
                                placeholder="Digite seu logradouro"
                                maxLength={254}
                                tabIndex={13}
                                name="logradouro"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Número *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={numero}
                                onChange={handleNumero}
                                placeholder="Digite seu número"
                                maxLength={20}
                                tabIndex={14}
                                name="numero"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Complemento</label>
                            <input
                                type="text"
                                className={css.input}
                                value={complemento}
                                onChange={(e) => setComplemento(e.target.value)}
                                placeholder="Digite o complemento"
                                maxLength={100}
                                tabIndex={15}
                                name="complemento"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Bairro *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={bairro}
                                onChange={(e) => setBairro(e.target.value)}
                                placeholder="Digite seu bairro"
                                maxLength={100}
                                tabIndex={16}
                                name="bairro"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Cidade *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                placeholder="Digite sua cidade"
                                maxLength={100}
                                tabIndex={17}
                                name="cidade"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Estado *</label>
                            <select
                                className={css.input}
                                value={uf}
                                onChange={(e) => setUf(e.target.value)}
                                tabIndex={18}
                                name="uf"
                            >
                                <option value="" disabled>Selecione a UF</option>
                                {ufs.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>Telefone *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={telefone}
                                onChange={handleTelefone}
                                placeholder="Digite seu telefone"
                                maxLength={15}
                                tabIndex={19}
                                name="telefone"
                            />
                        </div>


                        <div className={css.campoMetade}>
                            <label className={css.label}>E-mail *</label>
                            <input
                                type="text"
                                className={css.input}
                                value={email}
                                onChange={handleEmail}
                                placeholder="Digite seu e-mail"
                                maxLength={254}
                                tabIndex={20}
                                name="email"
                            />
                        </div>


                        <div className={css.campoMetade} style={{ gap: '1.5rem', marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Senha *</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    value={senha}
                                    onChange={handleSenha}
                                    placeholder="Digite sua senha"
                                    maxLength={254}
                                    tabIndex={21}
                                    name="senha"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label className={css.label}>Confirmar senha *</label>
                                <input
                                    type="password"
                                    className={css.input}
                                    value={confirmarSenha}
                                    onChange={handleConfirmarSenha}
                                    placeholder="Confirme sua senha"
                                    maxLength={254}
                                    tabIndex={22}
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
                                    tabIndex={23}
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
                            tabIndex={24}
                            name="btn-cadastrar"
                        >
                            {carregando ? 'Cadastrando...' : 'Cadastrar Cliente'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}