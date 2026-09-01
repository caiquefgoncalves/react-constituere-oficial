import { useNavigate } from 'react-router-dom';
import css from './BotaoAlternar.module.css';

export default function BotaoAlternar({ fisico = true, onToggle, parteContraria = false }) {
    const navigate = useNavigate();

    function handleFisico() {
        if (onToggle) onToggle(true);

        const rota = parteContraria
            ? '/cadastro_parte_contraria_fisica'
            : '/cadastro_cliente_fisico';

        navigate(rota);
    }

    function handleJuridico() {
        if (onToggle) onToggle(false);

        const rota = parteContraria
            ? '/cadastro_parte_contraria_juridica'
            : '/cadastro_cliente_juridico';

        navigate(rota);
    }

    return (
        <div className={css.container}>
            <button
                className={`${css.botao} ${fisico ? css.ativoFisico : ''}`}
                onClick={handleFisico}
                type="button"
                name="btn-fisico"
            >
                Pessoa Física
            </button>

            <button
                className={`${css.botao} ${!fisico ? css.ativoJuridico : ''}`}
                onClick={handleJuridico}
                type="button"
                name="btn-juridico"
            >
                Pessoa Jurídica
            </button>
        </div>
    );
}
