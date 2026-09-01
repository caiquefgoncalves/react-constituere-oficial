import { useState, useRef } from 'react';
import css from './CadastroParteContrariaFisica1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate, useLocation } from 'react-router-dom';
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";

export default function CadastroParteContrariaFisica1({ api }) {
    const navigate = useNavigate();
    const location = useLocation();
    const topoRef = useRef(null);

    const processo = location.state?.processo;

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

    const [isFisico, setIsFisico] = useState(true);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const API_URL = api || 'http://192.168.0.123:5000';

    const ufs = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES',
        'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
        'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
        'SP', 'SE', 'TO'
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

    function mostrarErro(texto) {
        setMensagem(texto);
        setTipoMensagem('erro');
        setCarregando(false);

        if (topoRef.current) {
            topoRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        agendarLimpezaMensagem();
    }

    function capitalizarNome(texto) {
        if (!texto) return '';

        return texto
            .split(' ')
            .map(
                palavra =>
                    palavra.charAt(0).toUpperCase() +
                    palavra.slice(1).toLowerCase()
            )
            .join(' ');
    }

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, '');
    }

    function handleNome(e) {
        const valor = e.target.value.replace(
            /[^a-zA-ZÀ-ÿ\s]/g,
            ''
        );

        if (valor.length <= 254) {
            setNomeCompleto(
                capitalizarNome(valor)
            );
        }
    }

    function handleDataNascimento(e) {
        let valor = apenasNumeros(
            e.target.value
        );

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        if (valor.length <= 2) {
            setDataNascimento(valor);

        } else if (valor.length <= 4) {
            setDataNascimento(
                `${valor.slice(0, 2)}/${valor.slice(2)}`
            );

        } else {
            setDataNascimento(
                `${valor.slice(0, 2)}/${valor.slice(2, 4)}/${valor.slice(4, 8)}`
            );
        }
    }

    function validarData(dataTexto) {
        if (!dataTexto) {
            return true;
        }

        if (
            !/^\d{2}\/\d{2}\/\d{4}$/.test(
                dataTexto
            )
        ) {
            return false;
        }

        const [dia, mes, ano] =
            dataTexto
                .split('/')
                .map(Number);

        const dataObjeto =
            new Date(
                ano,
                mes - 1,
                dia
            );

        return (
            dataObjeto.getFullYear() === ano &&
            dataObjeto.getMonth() === mes - 1 &&
            dataObjeto.getDate() === dia
        );
    }

    function handleCpf(e) {
        let valor = apenasNumeros(
            e.target.value
        );

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        if (valor.length <= 3) {
            setCpf(valor);

        } else if (valor.length <= 6) {
            setCpf(
                `${valor.slice(0, 3)}.${valor.slice(3)}`
            );

        } else if (valor.length <= 9) {
            setCpf(
                `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`
            );

        } else {
            setCpf(
                `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9, 11)}`
            );
        }
    }

    function handleRg(e) {
        let valor =
            e.target.value.replace(
                /[^0-9Xx]/g,
                ''
            );

        if (valor.length > 9) {
            valor = valor.slice(0, 9);
        }

        if (valor.length <= 2) {
            setRg(valor);

        } else if (valor.length <= 5) {
            setRg(
                `${valor.slice(0, 2)}.${valor.slice(2)}`
            );

        } else if (valor.length <= 8) {
            setRg(
                `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5)}`
            );

        } else {
            const ultimoChar =
                valor.slice(8).toUpperCase();

            setRg(
                `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}-${ultimoChar}`
            );
        }
    }

    function handleOrgaoExpedidor(e) {
        const valor =
            e.target.value.replace(
                /[^a-zA-Z0-9/]/g,
                ''
            );

        if (valor.length <= 20) {
            setOrgaoExpedidor(valor);
        }
    }

    function handleCarteiraTrabalho(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 7) {
            valor = valor.slice(0, 7);
        }

        setCarteiraTrabalho(valor);
    }

    function handleSerieCarteira(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 4) {
            valor = valor.slice(0, 4);
        }

        setSerieCarteira(valor);
    }

    function handleProfissao(e) {
        const valor =
            e.target.value.replace(
                /[^a-zA-ZÀ-ÿ\s]/g,
                ''
            );

        if (valor.length <= 254) {
            setProfissao(
                capitalizarNome(valor)
            );
        }
    }

    function handleNacionalidade(e) {
        const valor =
            e.target.value.replace(
                /[^a-zA-ZÀ-ÿ\s]/g,
                ''
            );

        if (valor.length <= 50) {
            setNacionalidade(
                capitalizarNome(valor)
            );
        }
    }

    function handleTelefone(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        if (valor.length === 0) {
            setTelefone('');

        } else if (valor.length <= 2) {
            setTelefone(
                `(${valor}`
            );

        } else if (valor.length <= 7) {
            setTelefone(
                `(${valor.slice(0, 2)}) ${valor.slice(2)}`
            );

        } else {
            setTelefone(
                `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`
            );
        }
    }

    function handleEmail(e) {
        const valor =
            e.target.value.replace(
                /\s/g,
                ''
            );

        if (valor.length <= 254) {
            setEmail(valor);
        }
    }

    function handleCep(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        if (valor.length <= 5) {
            setCep(valor);
        } else {
            setCep(
                `${valor.slice(0, 5)}-${valor.slice(5, 8)}`
            );
        }

        if (valor.length === 8) {
            buscarCep(valor);
        }

        if (valor.length < 8) {
            setLogradouro('');
            setBairro('');
            setCidade('');
            setUf('');
        }
    }

    async function buscarCep(
        cepInformado
    ) {
        const cepNumeros =
            apenasNumeros(
                cepInformado
            );

        if (
            cepNumeros.length !== 8
        ) {
            return;
        }

        setBuscandoCep(true);

        try {
            const resposta =
                await fetch(
                    `https://viacep.com.br/ws/${cepNumeros}/json/`
                );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível consultar o CEP.'
                );
            }

            const dados =
                await resposta.json();

            if (dados.erro) {
                setLogradouro('');
                setBairro('');
                setCidade('');
                setUf('');

                mostrarErro(
                    'CEP não encontrado. Verifique o número informado.'
                );

                return;
            }

            setLogradouro(
                dados.logradouro || ''
            );

            setBairro(
                dados.bairro || ''
            );

            setCidade(
                dados.localidade || ''
            );

            setUf(
                dados.uf || ''
            );

        } catch (erro) {
            console.error(
                'Erro ao consultar CEP:',
                erro
            );

            mostrarErro(
                'Não foi possível consultar o CEP.'
            );

        } finally {
            setBuscandoCep(false);
        }
    }

    function handleNumero(e) {
        const valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length <= 20) {
            setNumero(valor);
        }
    }

    function voltar() {
        navigate(-1);
    }

    function trocarTipoPessoa(
        novoFisico
    ) {
        setIsFisico(novoFisico);

        if (!novoFisico) {
            navigate(
                '/cadastro_parte_contraria_juridica',
                {
                    state: {
                        processo
                    }
                }
            );
        }
    }

    function handleCadastro(e) {
        e.preventDefault();

        if (carregando) {
            return;
        }

        setMensagem('');
        setTipoMensagem('');

        if (!processo) {
            mostrarErro(
                'Os dados do processo não foram encontrados. Volte para a primeira etapa.'
            );

            return;
        }

        const camposFaltando = [];

        if (!nomeCompleto.trim()) {
            camposFaltando.push(
                'Nome completo'
            );
        }

        if (!cpf.trim()) {
            camposFaltando.push(
                'CPF'
            );
        }

        if (!cep.trim()) {
            camposFaltando.push(
                'CEP'
            );
        }

        if (!logradouro.trim()) {
            camposFaltando.push(
                'Logradouro'
            );
        }

        if (!numero.trim()) {
            camposFaltando.push(
                'Número'
            );
        }

        if (!bairro.trim()) {
            camposFaltando.push(
                'Bairro'
            );
        }

        if (!cidade.trim()) {
            camposFaltando.push(
                'Cidade'
            );
        }

        if (!uf.trim()) {
            camposFaltando.push(
                'Estado'
            );
        }

        if (
            camposFaltando.length > 0
        ) {
            mostrarErro(
                `Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`
            );

            return;
        }

        const cpfNumeros =
            apenasNumeros(cpf);

        if (
            cpfNumeros.length !== 11
        ) {
            mostrarErro(
                'CPF incompleto. Digite os 11 números do CPF.'
            );

            return;
        }

        if (
            dataNascimento &&
            !validarData(
                dataNascimento
            )
        ) {
            mostrarErro(
                'Data de nascimento inválida. Use DD/MM/AAAA.'
            );

            return;
        }

        const cepNumeros =
            apenasNumeros(cep);

        if (
            cepNumeros.length !== 8
        ) {
            mostrarErro(
                'CEP incompleto. Digite os 8 números do CEP.'
            );

            return;
        }

        const telefoneNumeros =
            apenasNumeros(
                telefone
            );

        if (
            telefoneNumeros &&
            (
                telefoneNumeros.length < 10 ||
                telefoneNumeros.length > 11
            )
        ) {
            mostrarErro(
                'Telefone inválido. Digite DDD + número.'
            );

            return;
        }

        const parteContraria = {
            nome:
                nomeCompleto.trim(),

            cpf:
            cpfNumeros,

            cnpj:
                null,

            rg:
                rg
                    ? rg.trim()
                    : null,

            orgao_expedidor:
                orgaoExpedidor
                    ? orgaoExpedidor.trim()
                    : null,

            nacionalidade:
                nacionalidade
                    ? nacionalidade.trim()
                    : null,

            estado_civil:
                estadoCivil || null,

            data_nascimento:
                dataNascimento || null,

            sexo:
                sexo || null,

            carteira_trabalho:
                carteiraTrabalho || null,

            serie_carteira:
                serieCarteira || null,

            profissao:
                profissao
                    ? profissao.trim()
                    : null,

            cep:
            cepNumeros,

            logradouro:
                logradouro.trim(),

            numero:
                numero.trim(),

            complemento:
                complemento
                    ? complemento.trim()
                    : null,

            bairro:
                bairro.trim(),

            cidade:
                cidade.trim(),

            estado:
            uf,

            telefone:
                telefoneNumeros || null,

            email:
                email
                    ? email.trim()
                    : null,

            razao_social:
                null,

            nome_fantasia:
                null
        };

        setCarregando(true);

        navigate(
            '/cadastro_processo_pagamento',
            {
                state: {
                    processo:
                    processo,

                    parte_contraria:
                    parteContraria
                }
            }
        );

        setCarregando(false);
    }

    return (
        <div
            className={
                css.paginaCompleta
            }
        >
            <Header api={API_URL} />

            <section
                className={
                    css.containerSection
                }
                ref={topoRef}
            >
                <div
                    className={
                        css.topArea
                    }
                >
                    <button
                        className={
                            css.botaoVoltar
                        }
                        onClick={voltar}
                        tabIndex={-1}
                        type="button"
                        name="btn-voltar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <h1
                        className={
                            css.titulo
                        }
                    >
                        Cadastro da parte contrária
                    </h1>
                </div>

                {mensagem && (
                    <div
                        className={
                            `${css.mensagemContainer} ${
                                tipoMensagem ===
                                'sucesso'
                                    ? css.sucesso
                                    : css.erro
                            }`
                        }
                    >
                        {mensagem}
                    </div>
                )}

                <BotaoAlternar
                    fisico={isFisico}
                    onToggle={
                        trocarTipoPessoa
                    }
                    parteContraria={true}
                />

                <form
                    className={
                        css.formulario
                    }
                    onSubmit={
                        handleCadastro
                    }
                >
                    <div
                        className={
                            css.linha
                        }
                    >
                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Nome completo *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o nome completo"
                                value={
                                    nomeCompleto
                                }
                                onChange={
                                    handleNome
                                }
                                maxLength={254}
                                tabIndex={1}
                                name="nome_completo"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Data de nascimento
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="DD/MM/AAAA"
                                value={
                                    dataNascimento
                                }
                                onChange={
                                    handleDataNascimento
                                }
                                maxLength={10}
                                tabIndex={2}
                                name="data_nascimento"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                CPF *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o CPF"
                                value={cpf}
                                onChange={
                                    handleCpf
                                }
                                maxLength={14}
                                tabIndex={3}
                                name="cpf"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Sexo
                            </label>

                            <select
                                className={
                                    css.input
                                }
                                value={sexo}
                                onChange={(e) =>
                                    setSexo(
                                        e.target.value
                                    )
                                }
                                tabIndex={4}
                                name="sexo"
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Selecione o sexo
                                </option>

                                <option value="Feminino">
                                    Feminino
                                </option>

                                <option value="Masculino">
                                    Masculino
                                </option>

                                <option value="Prefiro não informar">
                                    Prefiro não informar
                                </option>
                            </select>
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                RG
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o RG"
                                value={rg}
                                onChange={
                                    handleRg
                                }
                                maxLength={15}
                                tabIndex={5}
                                name="rg"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Órgão expedidor
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o órgão expedidor"
                                value={
                                    orgaoExpedidor
                                }
                                onChange={
                                    handleOrgaoExpedidor
                                }
                                maxLength={20}
                                tabIndex={6}
                                name="orgao_expedidor"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Número da carteira de trabalho
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o número da carteira"
                                value={
                                    carteiraTrabalho
                                }
                                onChange={
                                    handleCarteiraTrabalho
                                }
                                maxLength={7}
                                tabIndex={7}
                                name="carteira_trabalho"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Série da carteira de trabalho
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite a série"
                                value={
                                    serieCarteira
                                }
                                onChange={
                                    handleSerieCarteira
                                }
                                maxLength={4}
                                tabIndex={8}
                                name="serie_carteira"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Profissão
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite a profissão"
                                value={
                                    profissao
                                }
                                onChange={
                                    handleProfissao
                                }
                                maxLength={254}
                                tabIndex={9}
                                name="profissao"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Estado civil
                            </label>

                            <select
                                className={
                                    css.input
                                }
                                value={
                                    estadoCivil
                                }
                                onChange={(e) =>
                                    setEstadoCivil(
                                        e.target.value
                                    )
                                }
                                tabIndex={10}
                                name="estado_civil"
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Selecione o estado civil
                                </option>

                                <option value="Solteiro(a)">
                                    Solteiro(a)
                                </option>

                                <option value="Casado(a)">
                                    Casado(a)
                                </option>

                                <option value="Divorciado(a)">
                                    Divorciado(a)
                                </option>

                                <option value="Viúvo(a)">
                                    Viúvo(a)
                                </option>

                                <option value="União Estável">
                                    União Estável
                                </option>
                            </select>
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Nacionalidade
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Ex: Brasileira"
                                value={
                                    nacionalidade
                                }
                                onChange={
                                    handleNacionalidade
                                }
                                maxLength={50}
                                tabIndex={11}
                                name="nacionalidade"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                CEP *
                            </label>

                            <div
                                style={{
                                    position:
                                        'relative'
                                }}
                            >
                                <input
                                    type="text"
                                    className={
                                        css.input
                                    }
                                    value={cep}
                                    onChange={
                                        handleCep
                                    }
                                    placeholder="Digite o CEP"
                                    maxLength={9}
                                    tabIndex={12}
                                    name="cep"
                                />

                                {buscandoCep && (
                                    <span
                                        style={{
                                            position:
                                                'absolute',
                                            right:
                                                '15px',
                                            top:
                                                '50%',
                                            transform:
                                                'translateY(-50%)',
                                            fontSize:
                                                '0.9rem',
                                            color:
                                                '#666'
                                        }}
                                    >
                                        Buscando...
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Logradouro *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={
                                    logradouro
                                }
                                onChange={(e) =>
                                    setLogradouro(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite o logradouro"
                                maxLength={254}
                                tabIndex={13}
                                name="logradouro"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Número *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={numero}
                                onChange={
                                    handleNumero
                                }
                                placeholder="Digite o número"
                                maxLength={20}
                                tabIndex={14}
                                name="numero"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Complemento
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={
                                    complemento
                                }
                                onChange={(e) =>
                                    setComplemento(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite o complemento"
                                maxLength={100}
                                tabIndex={15}
                                name="complemento"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Bairro *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={bairro}
                                onChange={(e) =>
                                    setBairro(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite o bairro"
                                maxLength={100}
                                tabIndex={16}
                                name="bairro"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Cidade *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={cidade}
                                onChange={(e) =>
                                    setCidade(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite a cidade"
                                maxLength={100}
                                tabIndex={17}
                                name="cidade"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Estado *
                            </label>

                            <select
                                className={
                                    css.input
                                }
                                value={uf}
                                onChange={(e) =>
                                    setUf(
                                        e.target.value
                                    )
                                }
                                tabIndex={18}
                                name="uf"
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Selecione a UF
                                </option>

                                {ufs.map(
                                    estado => (
                                        <option
                                            key={
                                                estado
                                            }
                                            value={
                                                estado
                                            }
                                        >
                                            {
                                                estado
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                Telefone
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                value={
                                    telefone
                                }
                                onChange={
                                    handleTelefone
                                }
                                placeholder="Digite o telefone"
                                maxLength={15}
                                tabIndex={19}
                                name="telefone"
                            />
                        </div>

                        <div
                            className={
                                css.campoMetade
                            }
                        >
                            <label
                                className={
                                    css.label
                                }
                            >
                                E-mail
                            </label>

                            <input
                                type="email"
                                className={
                                    css.input
                                }
                                value={email}
                                onChange={
                                    handleEmail
                                }
                                placeholder="Digite o e-mail"
                                maxLength={254}
                                tabIndex={20}
                                name="email"
                            />
                        </div>

                        <div
                            className={
                                css.campoInteiro
                            }
                            style={{
                                marginTop:
                                    '0.5rem'
                            }}
                        >
                            <p
                                className={
                                    css.obsCampos
                                }
                            >
                                * Campos obrigatórios
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            css.botaoContainer
                        }
                    >
                        <button
                            className={
                                css.botaoCadastro
                            }
                            type="submit"
                            disabled={
                                carregando ||
                                buscandoCep
                            }
                            tabIndex={21}
                            name="btn-cadastrar"
                        >
                            {carregando
                                ? 'Carregando...'
                                : 'Ir para configuração de pagamento'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
        </div>
    );
}