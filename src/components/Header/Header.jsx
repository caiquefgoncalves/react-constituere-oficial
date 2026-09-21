import React, { useEffect, useState } from 'react';
import css from './Header.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { io } from 'socket.io-client';

export default function Header({ api, fotoPerfil }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [idUsuario, setIdUsuario] = useState(null);

    const [menuNotificacoes, setMenuNotificacoes] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);

    const API_URL = api || 'http://10.92.11.39:5000';

    useEffect(() => {
        const tokenLocal = localStorage.getItem('token');

        if (tokenLocal) {
            try {
                const payload = JSON.parse(
                    atob(tokenLocal.split('.')[1])
                );

                setToken(tokenLocal);
                setTipoUsuario(payload.tipo);
                setIdUsuario(payload.id_usuarios);
            } catch (error) {
                console.error(
                    'Erro ao decodificar token:',
                    error
                );

                setToken(null);
                setTipoUsuario(null);
                setIdUsuario(null);
            }
        } else {
            setToken(null);
            setTipoUsuario(null);
            setIdUsuario(null);
        }
    }, [location]);

    useEffect(() => {
        if (!token || !idUsuario) {
            return;
        }

        buscarNotificacoes();

        const socket = io(API_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            socket.emit('entrar_usuario', {
                id_usuario: idUsuario
            });
        });

        socket.on(
            'nova_notificacao',
            (novaNotificacao) => {
                setNotificacoes((anteriores) => {
                    const jaExiste = anteriores.some(
                        (notificacao) =>
                            notificacao.id === novaNotificacao.id
                    );

                    if (jaExiste) {
                        return anteriores;
                    }

                    return [
                        novaNotificacao,
                        ...anteriores
                    ];
                });
            }
        );

        socket.on('connect_error', (erro) => {
            console.error(
                'Erro ao conectar ao Socket.IO:',
                erro
            );
        });

        return () => {
            socket.emit('sair_usuario', {
                id_usuario: idUsuario
            });

            socket.off('nova_notificacao');
            socket.off('connect_error');
            socket.disconnect();
        };
    }, [token, idUsuario, API_URL]);

    async function buscarNotificacoes() {
        if (!token) {
            return;
        }

        try {
            setCarregandoNotificacoes(true);

            const response = await fetch(
                `${API_URL}/notificacoes`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': token
                    }
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                console.error(
                    dados.error ||
                    'Erro ao buscar notificações'
                );

                return;
            }

            setNotificacoes(
                dados.notificacoes || []
            );

        } catch (error) {
            console.error(
                'Erro ao buscar notificações:',
                error
            );

        } finally {
            setCarregandoNotificacoes(false);
        }
    }

    function getFotoPerfil() {
        if (fotoPerfil) {
            return fotoPerfil;
        }

        if (idUsuario) {
            return `${API_URL}/uploads/Usuarios/${idUsuario}.jpeg`;
        }

        return '/perfil-padrao.png';
    }

    function fecharMenuMobile() {
        const offcanvasElement =
            document.getElementById('menuLateral');

        if (
            offcanvasElement &&
            window.bootstrap
        ) {
            const bsOffcanvas =
                window.bootstrap.Offcanvas.getInstance(
                    offcanvasElement
                );

            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    }

    async function mostrarNotificacoes() {
        const vaiAbrir = !menuNotificacoes;

        setMenuNotificacoes(vaiAbrir);

        if (!vaiAbrir) {
            return;
        }

        const possuiNaoLidas = notificacoes.some(
            (notificacao) => !notificacao.lida
        );

        if (!possuiNaoLidas) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/notificacoes/marcar_todas_lidas`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Token': token
                    }
                }
            );

            const dados = await response.json();

            if (!response.ok) {
                console.error(
                    dados.error ||
                    'Erro ao marcar notificações como lidas'
                );

                return;
            }

            setNotificacoes((anteriores) =>
                anteriores.map((notificacao) => ({
                    ...notificacao,
                    lida: true
                }))
            );

        } catch (error) {
            console.error(
                'Erro ao marcar notificações como lidas:',
                error
            );
        }
    }

    function fazerLogout() {
        fecharMenuMobile();

        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('id_usuario');

        setToken(null);
        setTipoUsuario(null);
        setIdUsuario(null);
        setNotificacoes([]);
        setMenuNotificacoes(false);

        navigate('/');
    }

    function irParaPerfil() {
        fecharMenuMobile();

        if (tipoUsuario === 0) {
            navigate('/dashboard_advogado');
        } else if (tipoUsuario === 1) {
            navigate('/dashboard_escritorio');
        } else if (tipoUsuario === 2) {
            navigate('/dashboard_cliente');
        } else {
            navigate('/dashboard');
        }
    }

    function formatarData(data) {
        if (!data) {
            return '';
        }

        const dataObjeto = new Date(data);

        if (
            Number.isNaN(
                dataObjeto.getTime()
            )
        ) {
            return '';
        }

        return dataObjeto.toLocaleDateString(
            'pt-BR',
            {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }
        );
    }

    function ListaNotificacoes() {
        if (carregandoNotificacoes) {
            return (
                <div className={css.listaNotificacoes}>
                    <div className={css.notificacao}>
                        <p
                            className={
                                css.notificacaoDescricao
                            }
                        >
                            Carregando notificações...
                        </p>
                    </div>
                </div>
            );
        }

        if (notificacoes.length === 0) {
            return (
                <div className={css.listaNotificacoes}>
                    <div className={css.notificacao}>
                        <p
                            className={
                                css.notificacaoDescricao
                            }
                        >
                            Nenhuma notificação.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className={css.listaNotificacoes}>
                {notificacoes.map(
                    (notificacao) => (
                        <div
                            className={css.notificacao}
                            key={notificacao.id}
                        >
                            <div
                                className={
                                    css.notificacaoTopo
                                }
                            >
                                <p
                                    className={
                                        css.notificacaoTitulo
                                    }
                                >
                                    {notificacao.titulo}
                                </p>

                                <p
                                    className={
                                        css.notificacaoData
                                    }
                                >
                                    {formatarData(
                                        notificacao.data_criacao ||
                                        notificacao.data
                                    )}
                                </p>
                            </div>

                            <p
                                className={
                                    css.notificacaoDescricao
                                }
                            >
                                {notificacao.mensagem}
                            </p>
                        </div>
                    )
                )}
            </div>
        );
    }

    function MenuMobile() {
        return (
            <div
                className={`offcanvas offcanvas-end ${css.offcanvasCustom}`}
                tabIndex="-1"
                id="menuLateral"
            >
                <div className={css.offcanvasHeaderCustom}>
                    <button
                        type="button"
                        className={css.actionBtn}
                        data-bs-dismiss="offcanvas"
                        aria-label="Fechar menu"
                    >
                        <svg
                            width="35"
                            height="25"
                            viewBox="0 0 35 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <line
                                x1="5"
                                y1="2"
                                x2="30"
                                y2="23"
                                stroke="#d9d9d9"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />

                            <line
                                x1="30"
                                y1="2"
                                x2="5"
                                y2="23"
                                stroke="#d9d9d9"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className={css.offcanvasBodyCustom}>
                    <ul className={css.navListMobile}>
                        {token ? (
                            <>
                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/dashboard_advogado');
                                    }}
                                    name="menu-perfil"
                                >
                                    <img
                                        src="/perfil.png"
                                        alt="Perfil"
                                    />
                                    <p>Perfil</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/advogados');
                                    }}
                                    name="menu-advogados"
                                >
                                    <img
                                        src="/advogados.png"
                                        alt="Advogados"
                                    />
                                    <p>Advogados</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/clientes');
                                    }}
                                    name="menu-clientes"
                                >
                                    <img
                                        src="/cliente.png"
                                        alt="Clientes"
                                    />
                                    <p>Clientes</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/processos');
                                    }}
                                    name="menu-processos"
                                >
                                    <img
                                        src="/processo.png"
                                        alt="Processos"
                                    />
                                    <p>Processos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/agendamentos');
                                    }}
                                    name="menu-agendamentos"
                                >
                                    <img
                                        src="/agendamento.png"
                                        alt="Agendamentos"
                                    />
                                    <p>Agendamentos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => {
                                        fecharMenuMobile();
                                        navigate('/pagamentos_lista');
                                    }}
                                    name="menu-pagamentos"
                                >
                                    <img
                                        src="/pagamento.png"
                                        alt="Pagamentos"
                                    />
                                    <p>Pagamentos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={fazerLogout}
                                    style={{
                                        marginTop: '2rem',
                                        borderTop: '1px solid #e0e0e0',
                                        paddingTop: '1rem',
                                        textAlign: 'center'
                                    }}
                                    name="menu-sair"
                                >
                                    <p
                                        style={{
                                            color: '#d32f2f'
                                        }}
                                    >
                                        Sair
                                    </p>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        to="/"
                                        className={css.linkMobile}
                                        onClick={fecharMenuMobile}
                                    >
                                        Home
                                    </Link>
                                </li>

                                <li>
                                    <HashLink
                                        smooth
                                        to="/#beneficios"
                                        className={css.linkMobile}
                                        onClick={fecharMenuMobile}
                                    >
                                        Benefícios
                                    </HashLink>
                                </li>

                                <li>
                                    <HashLink
                                        smooth
                                        to="/#clientes"
                                        className={css.linkMobile}
                                        onClick={fecharMenuMobile}
                                    >
                                        Venha ser nosso cliente!
                                    </HashLink>
                                </li>

                                <li className="mt-4">
                                    <Link
                                        to="/cadastro"
                                        className={css.linkMobile}
                                        onClick={fecharMenuMobile}
                                    >
                                        Cadastro
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/login"
                                        className={css.linkMobile}
                                        onClick={fecharMenuMobile}
                                    >
                                        Login
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        );
    }

    const quantidadeNaoLidas =
        notificacoes.filter(
            (notificacao) =>
                notificacao.lida === false
        ).length;

    return (
        <header className={css.headerContainer}>
            <div className={css.headerContent}>
                <Link
                    to="/"
                    className={css.logoLink}
                >
                    <img
                        src="/logo-header.png"
                        alt="Constituere"
                        className={css.logo}
                    />
                </Link>

                <nav
                    className={`d-none d-lg-flex ${css.desktopNav}`}
                >
                    <ul className={css.navList}>
                        <li>
                            <Link
                                to="/"
                                className={css.link}
                            >
                                Home
                            </Link>
                        </li>

                        <li>
                            <HashLink
                                smooth
                                to="/#beneficios"
                                className={css.link}
                            >
                                Benefícios
                            </HashLink>
                        </li>

                        <li>
                            <HashLink
                                smooth
                                to="/#clientes"
                                className={css.link}
                            >
                                Venha ser nosso cliente!
                            </HashLink>
                        </li>
                    </ul>
                </nav>

                <div className={css.divbotoes}>
                    {token ? (
                        <>
                            <div
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <button
                                    className={css.iconeBtn}
                                    type="button"
                                    name="btn-notificacoes"
                                    onClick={mostrarNotificacoes}
                                >
                                    <img
                                        src="/sino.png"
                                        alt="Notificações"
                                        className={css.iconeImg}
                                    />
                                </button>

                                {quantidadeNaoLidas > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            backgroundColor: '#d32f2f',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            minWidth: '18px',
                                            height: '18px',
                                            padding: '0 5px',
                                            fontSize: '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        {
                                            quantidadeNaoLidas > 99
                                                ? '99+'
                                                : quantidadeNaoLidas
                                        }
                                    </span>
                                )}
                            </div>

                            <button
                                className={`${css.iconeBtn} d-none d-lg-flex`}
                                onClick={irParaPerfil}
                                type="button"
                                name="btn-perfil"
                            >
                                <img
                                    src={getFotoPerfil()}
                                    alt="Perfil"
                                    className={css.fotoPerfil}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            '/perfil-padrao.png';
                                    }}
                                />
                            </button>
                        </>
                    ) : (
                        <div className="d-none d-lg-flex">
                            <Link to="/cadastro">
                                <button
                                    className={css.cadastro}
                                    name="btn-cadastro"
                                    type="button"
                                >
                                    Cadastro
                                </button>
                            </Link>

                            <Link to="/login">
                                <button
                                    className={css.login}
                                    name="btn-login"
                                    type="button"
                                >
                                    Login
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className={`d-lg-none ${css.actionBtn}`}
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#menuLateral"
                    aria-controls="menuLateral"
                    aria-label="Abrir menu"
                >
                    <svg
                        width="25"
                        height="25"
                        viewBox="0 0 35 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1="2"
                            y1="2"
                            x2="33"
                            y2="2"
                            stroke="#d9d9d9"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        <line
                            x1="2"
                            y1="12"
                            x2="33"
                            y2="12"
                            stroke="#d9d9d9"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        <line
                            x1="2"
                            y1="22"
                            x2="33"
                            y2="22"
                            stroke="#d9d9d9"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                <MenuMobile />

                {menuNotificacoes && (
                    <ListaNotificacoes />
                )}
            </div>
        </header>
    );
}