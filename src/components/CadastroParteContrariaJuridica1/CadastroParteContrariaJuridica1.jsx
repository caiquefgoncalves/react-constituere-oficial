import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import css from './CadastroParteContrariaJuridica1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import BotaoAlternar from "../BotaoAlternar/BotaoAlternar.jsx";

export default function CadastroParteContrariaJuridica1({ api }) {
    const navigate = useNavigate();
    const location = useLocation();
    const topoRef = useRef(null);

    const processo = location.state?.processo;

    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [cnpj, setCnpj] = useState('');

    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');

    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');

    const [isFisico, setIsFisico] = useState(false);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const API_URL =
        api || 'http://192.168.0.123:5000';

    const ufs = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
        'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
        'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
        'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) {
            clearTimeout(
                window.timeoutMensagem
            );
        }

        window.timeoutMensagem =
            setTimeout(() => {
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
        if (!texto) {
            return '';
        }

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

    function handleRazaoSocial(e) {
        const valor =
            e.target.value.replace(
                /[^a-zA-ZÀ-ÿ\s0-9&.\-]/g,
                ''
            );

        if (valor.length <= 254) {
            setRazaoSocial(
                capitalizarNome(valor)
            );
        }
    }

    function handleNomeFantasia(e) {
        const valor =
            e.target.value.replace(
                /[^a-zA-ZÀ-ÿ\s0-9&.\-]/g,
                ''
            );

        if (valor.length <= 254) {
            setNomeFantasia(
                capitalizarNome(valor)
            );
        }
    }

    function handleCnpj(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 14) {
            valor =
                valor.slice(0, 14);
        }

        if (valor.length <= 2) {
            setCnpj(valor);

        } else if (
            valor.length <= 5
        ) {
            setCnpj(
                `${valor.slice(0, 2)}.${valor.slice(2)}`
            );

        } else if (
            valor.length <= 8
        ) {
            setCnpj(
                `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5)}`
            );

        } else if (
            valor.length <= 12
        ) {
            setCnpj(
                `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8)}`
            );

        } else {
            setCnpj(
                `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12, 14)}`
            );
        }
    }

    function handleTelefone(e) {
        let valor =
            apenasNumeros(
                e.target.value
            );

        if (valor.length > 11) {
            valor =
                valor.slice(0, 11);
        }

        if (valor.length === 0) {
            setTelefone('');

        } else if (
            valor.length <= 2
        ) {
            setTelefone(
                `(${valor}`
            );

        } else if (
            valor.length <= 7
        ) {
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
            valor =
                valor.slice(0, 8);
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

            setMensagem('');
            setTipoMensagem('');

        } catch (erro) {
            console.error(
                'Erro ao consultar CEP:',
                erro
            );

            mostrarErro(
                'Não foi possível consultar o CEP. Verifique sua conexão com a internet.'
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

        if (novoFisico) {
            navigate(
                '/cadastro_processo_parte_contraria',
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

        if (!razaoSocial.trim()) {
            camposFaltando.push(
                'Razão social'
            );
        }

        if (!cnpj.trim()) {
            camposFaltando.push(
                'CNPJ'
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

        const cnpjNumeros =
            apenasNumeros(cnpj);

        if (
            cnpjNumeros.length !== 14
        ) {
            mostrarErro(
                'CNPJ incompleto. Digite os 14 números do CNPJ.'
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

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {
            mostrarErro(
                'Digite um e-mail válido.'
            );

            return;
        }

        const parteContraria = {
            /*
                Pessoa jurídica:
                CPF e campos exclusivamente
                físicos ficam nulos.
            */
            nome: null,

            cpf: null,

            rg: null,

            orgao_expedidor:
                null,

            nacionalidade:
                null,

            estado_civil:
                null,

            data_nascimento:
                null,

            sexo:
                null,

            carteira_trabalho:
                null,

            serie_carteira:
                null,

            profissao:
                null,

            /*
                Dados jurídicos
            */
            cnpj:
            cnpjNumeros,

            razao_social:
                razaoSocial.trim(),

            nome_fantasia:
                nomeFantasia.trim()
                    ? nomeFantasia.trim()
                    : null,

            /*
                Endereço
            */
            cep:
            cepNumeros,

            logradouro:
                logradouro.trim(),

            numero:
                numero.trim(),

            complemento:
                complemento.trim()
                    ? complemento.trim()
                    : null,

            bairro:
                bairro.trim(),

            cidade:
                cidade.trim(),

            estado:
            uf,

            /*
                Contato
            */
            telefone:
                telefoneNumeros ||
                null,

            email:
                email.trim()
                    ? email.trim()
                    : null
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
            <Header
                api={API_URL}
            />

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
                        onClick={
                            voltar
                        }
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
                        style={{
                            color:
                                '#0047ab'
                        }}
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
                    fisico={
                        isFisico
                    }
                    onToggle={
                        trocarTipoPessoa
                    }
                    parteContraria={
                        true
                    }
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
                                Razão social *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite a razão social"
                                value={
                                    razaoSocial
                                }
                                onChange={
                                    handleRazaoSocial
                                }
                                maxLength={
                                    254
                                }
                                tabIndex={
                                    1
                                }
                                name="razao_social"
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
                                Nome fantasia
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o nome fantasia"
                                value={
                                    nomeFantasia
                                }
                                onChange={
                                    handleNomeFantasia
                                }
                                maxLength={
                                    254
                                }
                                tabIndex={
                                    2
                                }
                                name="nome_fantasia"
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
                                CNPJ *
                            </label>

                            <input
                                type="text"
                                className={
                                    css.input
                                }
                                placeholder="Digite o CNPJ"
                                value={
                                    cnpj
                                }
                                onChange={
                                    handleCnpj
                                }
                                maxLength={
                                    18
                                }
                                tabIndex={
                                    3
                                }
                                name="cnpj"
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
                                    value={
                                        cep
                                    }
                                    onChange={
                                        handleCep
                                    }
                                    placeholder="Digite o CEP"
                                    maxLength={
                                        9
                                    }
                                    tabIndex={
                                        4
                                    }
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
                                maxLength={
                                    254
                                }
                                tabIndex={
                                    5
                                }
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
                                value={
                                    numero
                                }
                                onChange={
                                    handleNumero
                                }
                                placeholder="Digite o número"
                                maxLength={
                                    20
                                }
                                tabIndex={
                                    6
                                }
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
                                maxLength={
                                    100
                                }
                                tabIndex={
                                    7
                                }
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
                                value={
                                    bairro
                                }
                                onChange={(e) =>
                                    setBairro(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite o bairro"
                                maxLength={
                                    100
                                }
                                tabIndex={
                                    8
                                }
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
                                value={
                                    cidade
                                }
                                onChange={(e) =>
                                    setCidade(
                                        e.target.value
                                    )
                                }
                                placeholder="Digite a cidade"
                                maxLength={
                                    100
                                }
                                tabIndex={
                                    9
                                }
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
                                UF *
                            </label>

                            <select
                                className={
                                    css.input
                                }
                                value={
                                    uf
                                }
                                onChange={(e) =>
                                    setUf(
                                        e.target.value
                                    )
                                }
                                tabIndex={
                                    10
                                }
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
                                maxLength={
                                    15
                                }
                                tabIndex={
                                    11
                                }
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
                                value={
                                    email
                                }
                                onChange={
                                    handleEmail
                                }
                                placeholder="Digite o e-mail"
                                maxLength={
                                    254
                                }
                                tabIndex={
                                    12
                                }
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
                            tabIndex={
                                13
                            }
                            name="btn-ir-pagamento"
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