import { useNavigate } from "react-router-dom";
import css from './MenuLateralAdvogado.module.css'

export default function MenuLateralAdvogado({ api }) {
    const navigate = useNavigate();

    function fazerLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        navigate('/');
    }

    return (
        <div className={css.container}>
            <div className={css.funcoes} onClick={() => navigate('/dashboardAdvogado')}>
                <img src={'/perfil.png'} alt="Perfil"/>
                <h2 className={css.desktop}>Perfil</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/advogados')}>
                <img src={'/advogados.png'} alt="Advogados"/>
                <h2 className={css.desktop}>Advogados</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/clientes')}>
                <img src={'/cliente.png'} alt="Clientes"/>
                <h2 className={css.desktop}>Clientes</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/processos')}>
                <img src={'/processo.png'} alt="Processos"/>
                <h2 className={css.desktop}>Processos</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/agendamentos')}>
                <img src={'/agendamento.png'} alt="Agendamentos"/>
                <h2 className={css.desktop}>Agendamentos</h2>
            </div>
            <div className={css.funcoes} onClick={() => navigate('/pagamentos')}>
                <img src={'/pagamento.png'} alt="Pagamentos"/>
                <h2 className={css.desktop}>Pagamentos</h2>
            </div>

            <div className={css.funcoes} onClick={fazerLogout} style={{ marginTop: '2rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem', textAlign: 'center' }}>
                <h2 className={css.desktop} style={{ color: '#d32f2f' }}>Sair</h2>
            </div>
        </div>
    )
}