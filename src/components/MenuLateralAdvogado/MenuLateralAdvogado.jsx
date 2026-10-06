import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import css from './MenuLateralAdvogado.module.css';

export default function MenuLateralAdvogado({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://localhost:5000';
    const [podeVerLog, setPodeVerLog] = useState(false);
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        async function verificarProprietario() {
            try {
                const resposta = await fetch(`${API_URL}/meu_escritorio`, {
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });
                const dados = await resposta.json();
                setPodeVerLog(Boolean(resposta.ok && dados.escritorio?.id));
            } catch {
                setPodeVerLog(false);
            }
        }

        verificarProprietario();
    }, [API_URL]);

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
                onClick={() =>
                    navigate(
                        '/documentos'
                    )
                }
                name="menu-documentos"
            >

                <svg
                    className={
                        css.iconeDocumento
                    }
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0047ab"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >

                    <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />

                    <polyline
                        points="14 2 14 8 20 8"
                    />

                    <line
                        x1="8"
                        y1="13"
                        x2="16"
                        y2="13"
                    />

                    <line
                        x1="8"
                        y1="17"
                        x2="16"
                        y2="17"
                    />

                </svg>


                <h2
                    className={
                        css.desktop
                    }
                >
                    Documentos
                </h2>

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

            {podeVerLog && (
                <div
                    className={css.funcoes}
                    onClick={() => navigate('/auditoria')}
                    name="menu-auditoria"
                >
                    <img src="/Log.png" alt="Log" />
                    <h2 className={css.desktop}>Log</h2>
                </div>
            )}

            <div
                className={css.funcoes}
                onClick={() => window.dispatchEvent(new CustomEvent('veritas:abrir'))}
                name="menu-veritas"
            >
                <img src={'/veritas.png'} alt="Veritas.AI"/>
                <h2 className={css.desktop}>Veritas.AI</h2>
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
