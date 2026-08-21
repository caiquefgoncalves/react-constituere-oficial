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

    const API_URL = api || ' http://192.168.0.133:5000';

    useEffect(() => {
        const tokenLocal = localStorage.getItem('token');
        if (tokenLocal) {
            try {
                const payload = JSON.parse(atob(tokenLocal.split('.')[1]));
                setToken(tokenLocal);
                setTipoUsuario(payload.tipo);
                setIdUsuario(payload.id_usuarios);
            } catch (error) {
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
        // Se recebeu uma foto por prop (escritório), usa ela
        if (fotoPerfil) {
            return fotoPerfil;
        }
        // Senão usa a foto do usuário logado
        if (idUsuario) {
            return `${API_URL}/uploads/Usuarios/${idUsuario}.jpeg`;
        }
        return '/perfil-padrao.png';
    }

    function fazerLogout() {
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
        if (tipoUsuario === 0) navigate('/dashboard_advogado');
        else if (tipoUsuario === 1) navigate('/dashboard_escritorio');
        else if (tipoUsuario === 2) navigate('/dashboard_cliente');
        else navigate('/dashboard');
    }

    return (
        <header className={css.headerContainer}>
            <div className={css.headerContent}>

                <Link to="/" className={css.logoLink}>
                    <img src="/logo-header.png" alt="Constituere" className={css.logo} />
                </Link>

                <nav className={css.desktopNav}>
                    <ul className={css.navList}>
                        <li><Link to="/" className={css.link}>Home</Link></li>
                        <li>
                            <HashLink smooth to="/#beneficios" className={css.link}>
                                Benefícios
                            </HashLink>
                        </li>
                        <li>
                            <HashLink smooth to="/#clientes" className={css.link}>
                                Venha ser nosso cliente!
                            </HashLink>
                        </li>
                    </ul>
                </nav>

                <div className={css.divbotoes}>
                    {token ? (
                        <>
                            <button className={css.iconeBtn} type="button" name="btn-notificacoes">
                                <img src="/sino.png" alt="Notificações" className={css.iconeImg} />
                            </button>

                            <button className={css.iconeBtn} onClick={irParaPerfil} type="button" name="btn-perfil">
                                <img
                                    src={getFotoPerfil()}
                                    alt="Perfil"
                                    className={css.fotoPerfil}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/perfil-padrao.png';
                                    }}
                                />
                            </button>

                        </>
                    ) : (
                        <>
                            <Link to="/cadastro">
                                <button className={css.cadastro} name="btn-cadastro">Cadastro</button>
                            </Link>
                            <Link to="/login">
                                <button className={css.login} name="btn-login">Login</button>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}