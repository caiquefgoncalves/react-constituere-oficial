import css from './Chamada.module.css';

export default function Chamada() {
    return (
        <section className={css.chamada} id="clientes">
            <div className={css.container}>


                <div className={css.textoArea}>
                    <h2 className={css.titulo}>Venha ser nosso cliente!</h2>
                    <p className={css.paragrafo}>
                        Junte-se a nós e tenha um controle de clientes, processos, parcerias e financeiro em um só lugar!
                    </p>
                    <button className={css.botaoChamada}>Acesse o site</button>
                </div>


                <div className={css.imagemArea}>
                    <div className={css.quadroAzul}>

                        <img src="/estatua-justica.png" alt="Estátua da Justiça" className={css.estatuaSaindo} />
                    </div>
                </div>

            </div>
        </section>
    );
}