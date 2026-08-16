import css from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={css.footerBg}>
            <div className={css.container}>


                <div className={css.grid}>


                    <div className={css.colunaEsquerda}>
                        <div className={css.logoContainer}>
                            <img src="/logo-grande.png" alt="Constituere" className={css.logoFooter} />
                        </div>

                        <h4 className={css.tituloSobre}>Sobre à Constituere</h4>

                        <p className={css.descricao}>
                            A Constituere oferece assessoria jurídica com ética, excelência e compromisso, proporcionando soluções seguras e personalizadas para atender às necessidades de seus clientes.
                        </p>
                    </div>


                    <div className={css.colunaDireita}>
                        <h4 className={css.tituloLinks}>Explore</h4>

                        <ul className={css.listaLinks}>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#beneficios">Benefícios</a></li>
                            <li><a href="#clientes">Venha ser nosso cliente!</a></li>
                        </ul>

                        <button className={css.botaoFooter}>
                            Venha usar o Constituere!
                        </button>
                    </div>

                </div>


                <div className={css.divider}></div>


                <div className={css.copyright}>
                    <p>&copy; 2026 JurScript. Todos os direitos reservados.</p>
                </div>

            </div>
        </footer>
    );
}