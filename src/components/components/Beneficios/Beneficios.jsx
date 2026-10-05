import css from './Beneficios.module.css';
import Card from '../Card/Card.jsx';
import {Link} from 'react-router-dom';

export default function Beneficios() {
    return (
        <section className={css.secao} id="beneficios">
            <div className={css.container}>
                <h2 className={css.titulo}>Benefícios</h2>

                <div className={css.cardsContainer}>

                    <Card
                        titulo="Agendamento de consultas"
                        paragrafo="Seus clientes podem agendar consultas de acordo com horários pré-definidos e já reservando também o espaço físico."
                    />


                    <Card
                        titulo="Processo inteligente"
                        paragrafo="Registre prazos, histórico de reuniões e decisões, além de gerar documentos iniciais em um clique."
                    />


                    <Card
                        titulo="Gerenciamento financeiro"
                        paragrafo="Acompanhe seus honorários, defina datas de pagamento, recebendo notificações e renegociando parcelas, se necessário."
                    />
                </div>


                <Link to='/cadastro' className={css.botaoContainer}>
                    <p className={css.botaoAmbar}>Seja nosso cliente!</p>
                </Link>

            </div>
        </section>
    );
}