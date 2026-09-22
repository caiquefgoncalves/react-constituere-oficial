import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import css from './MenuLateralAdvogado.module.css';

export default function MenuLateralAdvogado({ api }) {
    const navigate = useNavigate();

    const [colapsado, setColapsado] = useState(() => {
        try {
            return localStorage.getItem('menu_colapsado') === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('menu_colapsado', colapsado ? 'true' : 'false');
        } catch {}

        window.dispatchEvent(
            new CustomEvent('menu-lateral-toggle', {
                detail: { colapsado }
            })
        );
    }, [colapsado]);

    function fazerLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('id_usuario');
        navigate('/');
    }

    function alternarMenu() {
        setColapsado(v => !v);
    }

    return (
        <div className={`${css.container} ${colapsado ? css.containerColapsado : ''}`}>
            <button
                type="button"
                className={css.botaoToggle}
                onClick={alternarMenu}
                aria-label={colapsado ? 'Expandir menu' : 'Colapsar menu'}
                name="menu-toggle"
            >
                <span className={`${css.iconeToggle} ${colapsado ? css.iconeToggleVirado : ''}`}>
                    &#10094;
                </span>
            </button>

            <div
                className={css.funcoes}
                onClick={() => navigate('/dashboard_advogado')}
                name="menu-perfil"
            >
                <img src={'/perfil.png'} alt="Perfil"/>
                <h2 className={css.desktop}>Perfil</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={() => navigate('/advogados')}
                name="menu-advogados"
            >
                <img src={'/advogados.png'} alt="Advogados"/>
                <h2 className={css.desktop}>Advogados</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={() => navigate('/clientes')}
                name="menu-clientes"
            >
                <img src={'/cliente.png'} alt="Clientes"/>
                <h2 className={css.desktop}>Clientes</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={() => navigate('/processos')}
                name="menu-processos"
            >
                <img src={'/processo.png'} alt="Processos"/>
                <h2 className={css.desktop}>Processos</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={() => navigate('/agendamentos')}
                name="menu-agendamentos"
            >
                <img src={'/agendamento.png'} alt="Agendamentos"/>
                <h2 className={css.desktop}>Agendamentos</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={() => navigate('/pagamentos_lista')}
                name="menu-pagamentos"
            >
                <img src={'/pagamento.png'} alt="Pagamentos"/>
                <h2 className={css.desktop}>Pagamentos</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={fazerLogout}
                style={{
                    marginTop: '2rem',
                    borderTop: '1px solid #e0e0e0',
                    paddingTop: '1rem',
                    textAlign: 'center',
                    justifyContent: 'center'
                }}
                name="menu-sair"
            >
                <svg
                    className={css.iconeSair}
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d32f2f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>

                <h2
                    className={css.desktop}
                    style={{ color: '#d32f2f' }}
                >
                    Sair
                </h2>
            </div>
        </div>
    );
}