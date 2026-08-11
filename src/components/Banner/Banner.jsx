import css from './Banner.module.css';

export default function Banner() {
    return (
        <section className={css.banner}>
            <div className={css.container}>


                <div className={css.textoArea}>

                    <div className={css.logoContainer}>
                        <img src="/logo-constituere.png" alt="Constituere" className={css.logoGrande} />
                    </div>


                    <p className={css.subtitulo}>
                        Transforme a gestão jurídica e encontre a segurança que o seu direito exige!
                    </p>


                    <button className={css.botaoBanner}>
                        Utilize no seu escritório!
                    </button>
                </div>

            </div>
        </section>
    );
}