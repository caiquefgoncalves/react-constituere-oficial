import css from './Banner.module.css';
import {Link} from 'react-router-dom';

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


                    <Link to="/cadastro" className={css.botaoBanner}>
                        Utilize no seu escritório!
                    </Link>
                </div>

            </div>
        </section>
    );
}