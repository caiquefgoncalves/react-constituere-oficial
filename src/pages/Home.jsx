import Header from "../components/Header/Header.jsx";
import Banner from "../components/Banner/Banner.jsx";
import Beneficios from "../components/Beneficios/Beneficios.jsx";
import Chamada from "../components/Chamada/Chamada.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function Home() {
    return (
        <>
            <Header />
            <Banner />
            <Beneficios />
            <Chamada />
            <Footer />
        </>
    );
}