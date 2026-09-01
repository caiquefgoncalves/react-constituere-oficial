import React, { useState, useRef, useEffect } from 'react';
import css from './CadastroProcesso1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate } from 'react-router-dom';

export default function CadastroProcesso1({ api }) {
    const navigate = useNavigate();
    const topoRef = useRef(null);

    const [numProcesso, setNumProcesso] = useState('');
    const [tipoProcesso, setTipoProcesso] = useState('');
    const [comarca, setComarca] = useState('');
    const [assunto, setAssunto] = useState('');
    const [area, setArea] = useState('');
    const [vara, setVara] = useState('');
    const [instancia, setInstancia] = useState('');
    const [data, setData] = useState('');
    const [cliente, setCliente] = useState('');

    const [clientes, setClientes] = useState([]);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [carregandoClientes, setCarregandoClientes] = useState(false);

    const API_URL = api || 'http://192.168.0.123:5000';

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) {
            clearTimeout(window.timeoutMensagem);
        }

        window.timeoutMensagem = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 7000);
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);

        if (topoRef.current) {
            topoRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        agendarLimpezaMensagem();
    }

    function capitalizar(texto) {
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

    function handleNumProcesso(e) {
        let valor = apenasNumeros(e.target.value);

        if (valor.length > 20) {
            valor = valor.slice(0, 20);
        }

        if (valor.length <= 7) {
            setNumProcesso(valor);

        } else if (valor.length <= 9) {
            setNumProcesso(
                `${valor.slice(0, 7)}-${valor.slice(7)}`
            );

        } else if (valor.length <= 13) {
            setNumProcesso(
                `${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9)}`
            );

        } else if (valor.length <= 14) {
            setNumProcesso(
                `${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13)}`
            );

        } else if (valor.length <= 16) {
            setNumProcesso(
                `${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13, 14)}.${valor.slice(14)}`
            );

        } else {
            setNumProcesso(
                `${valor.slice(0, 7)}-${valor.slice(7, 9)}.${valor.slice(9, 13)}.${valor.slice(13, 14)}.${valor.slice(14, 16)}.${valor.slice(16)}`
            );
        }
    }

    function handleAssunto(e) {
        const valor = e.target.value.replace(
            /[^a-zA-ZÀ-ÿ\s]/g,
            ''
        );

        if (valor.length <= 256) {
            setAssunto(
                capitalizar(valor)
            );
        }
    }

    function handleVara(e) {
        setVara(
            capitalizar(e.target.value)
        );
    }

    function handleData(e) {
        let valor = apenasNumeros(
            e.target.value
        );

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        if (valor.length <= 2) {
            setData(valor);

        } else if (valor.length <= 4) {
            setData(
                `${valor.slice(0, 2)}/${valor.slice(2)}`
            );

        } else {
            setData(
                `${valor.slice(0, 2)}/${valor.slice(2, 4)}/${valor.slice(4, 8)}`
            );
        }
    }

    function validarData(dataTexto) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataTexto)) {
            return false;
        }

        const [
            dia,
            mes,
            ano
        ] = dataTexto
            .split('/')
            .map(Number);

        const dataObjeto = new Date(
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

    function validarNumeroProcesso(numero) {
        const padrao =
            /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

        return padrao.test(numero);
    }

    function voltarParaProcesso() {
        navigate('/processos');
    }

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');

        navigate('/login');
    }

    async function buscarClientes() {
        setCarregandoClientes(true);

        try {
            const token =
                localStorage.getItem('token');

            const response = await fetch(
                `${API_URL}/clientes`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            const dados =
                await response.json();

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagem(
                    dados.error ||
                    'Erro ao carregar clientes.'
                );

                return;
            }

            const lista =
                dados.clientes || [];

            const clientesAtivos =
                lista.filter(
                    clienteItem =>
                        clienteItem.status === 'ativo'
                );

            setClientes(
                clientesAtivos
            );

        } catch (erro) {
            console.error(
                'Erro ao carregar clientes:',
                erro
            );

            mostrarMensagem(
                'Erro de conexão ao carregar clientes.'
            );

        } finally {
            setCarregandoClientes(false);
        }
    }

    useEffect(() => {
        const token =
            localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        buscarClientes();
    }, [API_URL]);

    function handleCadastro(e) {
        e.preventDefault();

        setCarregando(true);
        setMensagem('');
        setTipoMensagem('');

        const camposFaltando = [];

        if (!numProcesso.trim()) {
            camposFaltando.push(
                'Número do processo'
            );
        }

        if (!tipoProcesso.trim()) {
            camposFaltando.push(
                'Tipo do processo'
            );
        }

        if (!assunto.trim()) {
            camposFaltando.push(
                'Assunto'
            );
        }

        if (!area.trim()) {
            camposFaltando.push(
                'Área'
            );
        }

        if (!comarca.trim()) {
            camposFaltando.push(
                'Comarca'
            );
        }

        if (!vara.trim()) {
            camposFaltando.push(
                'Vara'
            );
        }

        if (!instancia) {
            camposFaltando.push(
                'Instância'
            );
        }

        if (!data.trim()) {
            camposFaltando.push(
                'Data de início'
            );
        }

        if (!cliente) {
            camposFaltando.push(
                'Cliente'
            );
        }

        if (camposFaltando.length > 0) {
            mostrarMensagem(
                `Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`
            );

            setCarregando(false);
            return;
        }

        if (
            !validarNumeroProcesso(
                numProcesso
            )
        ) {
            mostrarMensagem(
                'Número do processo inválido. Use o formato 0000000-00.0000.0.00.0000.'
            );

            setCarregando(false);
            return;
        }

        if (!validarData(data)) {
            mostrarMensagem(
                'Data de início inválida.'
            );

            setCarregando(false);
            return;
        }

        const dadosProcesso = {
            numero_processo:
                numProcesso.trim(),

            tipo_processo:
                tipoProcesso.trim(),

            assunto:
                assunto.trim(),

            area:
                area.trim(),

            comarca:
                comarca.trim(),

            vara:
                vara.trim(),

            instancia:
                Number(instancia),

            data_inicio:
            data,

            id_cliente:
                Number(cliente)
        };

        navigate(
            '/cadastro_parte_contraria_fisica',
            {
                state: {
                    processo:
                    dadosProcesso
                }
            }
        );

        setCarregando(false);
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <section
                className={css.containerSection}
                ref={topoRef}
            >
                <div className={css.topArea}>
                    <button
                        className={css.botaoVoltar}
                        onClick={voltarParaProcesso}
                        tabIndex={-1}
                        name="btn-voltar"
                        type="button"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
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

                    <h1 className={css.titulo}>
                        Cadastre o processo
                    </h1>
                </div>

                {mensagem && (
                    <div
                        style={{
                            padding:
                                '16px 24px',

                            margin:
                                '0 auto 25px auto',

                            maxWidth:
                                '700px',

                            borderRadius:
                                '10px',

                            textAlign:
                                'center',

                            fontFamily:
                                'Clear Sans, sans-serif',

                            fontWeight:
                                '700',

                            fontSize:
                                '1.05rem',

                            backgroundColor:
                                tipoMensagem === 'sucesso'
                                    ? '#d4edda'
                                    : '#fce8e6',

                            color:
                                tipoMensagem === 'sucesso'
                                    ? '#155724'
                                    : '#a94442',

                            border:
                                tipoMensagem === 'sucesso'
                                    ? '1px solid #c3e6cb'
                                    : '1px solid #f5c6cb',

                            boxShadow:
                                '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        {mensagem}
                    </div>
                )}

                <form
                    className={css.formulario}
                    onSubmit={handleCadastro}
                >
                    <div className={css.linha}>
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
                                Número do processo *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="0000000-00.0000.0.00.0000"
                                value={numProcesso}
                                onChange={
                                    handleNumProcesso
                                }
                                maxLength={25}
                                tabIndex={1}
                                name="numProcesso"
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
                                Tipo do processo *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o tipo do processo"
                                value={tipoProcesso}
                                onChange={(e) =>
                                    setTipoProcesso(
                                        e.target.value
                                    )
                                }
                                maxLength={256}
                                tabIndex={2}
                                name="tipoProcesso"
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
                                Assunto *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o assunto"
                                value={assunto}
                                onChange={
                                    handleAssunto
                                }
                                maxLength={256}
                                tabIndex={3}
                                name="assunto"
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
                                Área *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite a área do processo"
                                value={area}
                                onChange={(e) =>
                                    setArea(
                                        capitalizar(
                                            e.target.value
                                        )
                                    )
                                }
                                maxLength={256}
                                tabIndex={4}
                                name="area"
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
                                Comarca *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite a comarca"
                                value={comarca}
                                onChange={(e) =>
                                    setComarca(
                                        capitalizar(
                                            e.target.value
                                        )
                                    )
                                }
                                maxLength={256}
                                tabIndex={5}
                                name="comarca"
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
                                Vara *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="Ex: 3ª Vara Cível"
                                value={vara}
                                onChange={
                                    handleVara
                                }
                                maxLength={256}
                                tabIndex={6}
                                name="vara"
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
                                Instância *
                            </label>

                            <select
                                className={css.input}
                                value={instancia}
                                onChange={(e) =>
                                    setInstancia(
                                        e.target.value
                                    )
                                }
                                tabIndex={7}
                                name="instancia"
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    Selecionar instância
                                </option>

                                <option value="1">
                                    1ª instância
                                </option>

                                <option value="2">
                                    2ª instância
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
                                Data de início *
                            </label>

                            <input
                                type="text"
                                className={css.input}
                                placeholder="dd/mm/aaaa"
                                value={data}
                                onChange={
                                    handleData
                                }
                                tabIndex={8}
                                name="data"
                                maxLength={10}
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
                                Cliente *
                            </label>

                            <select
                                className={css.input}
                                value={cliente}
                                onChange={(e) =>
                                    setCliente(
                                        e.target.value
                                    )
                                }
                                tabIndex={9}
                                name="cliente"
                                disabled={
                                    carregandoClientes
                                }
                            >
                                <option
                                    value=""
                                    disabled
                                >
                                    {carregandoClientes
                                        ? 'Carregando clientes...'
                                        : 'Selecione o cliente'}
                                </option>

                                {clientes.map(
                                    clienteItem => (
                                        <option
                                            key={
                                                clienteItem.id
                                            }
                                            value={
                                                clienteItem.id
                                            }
                                        >
                                            {
                                                clienteItem.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {!carregandoClientes &&
                                clientes.length === 0 && (
                                    <small>
                                        Nenhum cliente ativo encontrado.
                                    </small>
                                )}
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
                                carregandoClientes
                            }
                            tabIndex={10}
                            name="btn-cadastrar"
                        >
                            {carregando
                                ? 'Carregando...'
                                : 'Parte Contrária ➝'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
        </div>
    );
}