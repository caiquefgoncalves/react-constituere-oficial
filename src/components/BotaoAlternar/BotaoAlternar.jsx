import { useNavigate } from "react-router-dom";
import css from './BotaoAlternar.module.css';

export default function BotaoAlternar({ fisico = true, onToggle }) {
    const navigate = useNavigate();

    function handleFisico() {
        if (onToggle) onToggle(true);
        navigate('/cadastro_cliente_fisico');
    }

    function handleJuridico() {
        if (onToggle) onToggle(false);
        navigate('/cadastro_cliente_juridico');
    }

    return (
        <div className={css.container}>
            <button
                className={`${css.botao} ${fisico === true ? css.ativoFisico : ""}`}
                onClick={handleFisico}
                type="button"
                name="btn-fisico"
            >
                Pessoa Física
            </button>
            <button
                className={`${css.botao} ${fisico === false ? css.ativoJuridico : ""}`}
                onClick={handleJuridico}
                type="button"
                name="btn-juridico"
            >
                Pessoa Jurídica
            </button>
        </div>
    );
}