import React, { useEffect, useState } from 'react';
import css from './Header.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

export default function Header({ api, fotoPerfil }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [idUsuario, setIdUsuario] = useState(null);

    const API_URL = api || 'http://10.92.11.62:5000';

    useEffect(() => {
        const tokenLocal = localStorage.getItem('token');

        if (tokenLocal) {
            try {
                const payload = JSON.parse(atob(tokenLocal.split('.')[1]));

                setToken(tokenLocal);
                setTipoUsuario(payload.tipo);
                setIdUsuario(payload.id_usuarios);
            } catch (error) {
                console.error('Erro ao decodificar token:', error);

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
        const offcanvasElement = document.getElementById('menuLateral');

        if (offcanvasElement && window.bootstrap) {
            const bsOffcanvas =
                window.bootstrap.Offcanvas.getInstance(offcanvasElement);

            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
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
                                    onClick={() => navigate('/dashboard_advogado')}
                                    name="menu-perfil"
                                >
                                    <img src={'/perfil.png'} alt="Perfil"/>
                                    <p>Perfil</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => navigate('/advogados')}
                                    name="menu-advogados"
                                >
                                    <img src={'/advogados.png'} alt="Advogados"/>
                                    <p>Advogados</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => navigate('/clientes')}
                                    name="menu-clientes"
                                >
                                    <img src={'/cliente.png'} alt="Clientes"/>
                                    <p>Clientes</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => navigate('/processos')}
                                    name="menu-processos"
                                >
                                    <img src={'/processo.png'} alt="Processos"/>
                                    <p>Processos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => navigate('/agendamentos')}
                                    name="menu-agendamentos"
                                >
                                    <img src={'/agendamento.png'} alt="Agendamentos"/>
                                    <p>Agendamentos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={() => navigate('/pagamentos_lista')}
                                    name="menu-pagamentos"
                                >
                                    <img src={'/pagamento.png'} alt="Pagamentos"/>
                                    <p>Pagamentos</p>
                                </li>

                                <li
                                    className={css.funcoes}
                                    onClick={fazerLogout}
                                    style={{ marginTop: '2rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem', textAlign: 'center' }}
                                    name="menu-sair"
                                >
                                    <p style={{ color: '#d32f2f' }}>Sair</p>
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

    return (
        <header className={css.headerContainer}>

            <div className={css.headerContent}>



                <Link to="/" className={css.logoLink}>
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



                <div
                    className={`d-none d-lg-flex ${css.divbotoes}`}
                >

                    {token ? (
                        <>
                            <button
                                className={css.iconeBtn}
                                type="button"
                                name="btn-notificacoes"
                            >
                                <img
                                    src="/sino.png"
                                    alt="Notificações"
                                    className={css.iconeImg}
                                />
                            </button>

                            <button
                                className={css.iconeBtn}
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
                        <>
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
                        </>
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

            </div>

        </header>
    );
}