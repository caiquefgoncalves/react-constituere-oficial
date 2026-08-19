import { useNavigate } from "react-router-dom";
import css from './MenuLateralAdvogado.module.css'

export default function MenuLateralAdvogado({ api }) {
    const navigate = useNavigate();

    function fazerLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('id_usuario');
        navigate('/');
    }

    return (
        <div className={css.container}>
            <div
                className={css.funcoes}
                onClick={() => navigate('/dashboardAdvogado')}
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
                onClick={() => navigate('/pagamentos')}
                name="menu-pagamentos"
            >
                <img src={'/pagamento.png'} alt="Pagamentos"/>
                <h2 className={css.desktop}>Pagamentos</h2>
            </div>

            <div
                className={css.funcoes}
                onClick={fazerLogout}
                style={{ marginTop: '2rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem', textAlign: 'center' }}
                name="menu-sair"
            >
                <h2 className={css.desktop} style={{ color: '#d32f2f' }}>Sair</h2>
            </div>
        </div>
    )
}