import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import DashboardAdvogado from "./pages/DashboardAdvogado.jsx";


const API_URL = 'http://127.0.0.1:5000';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home api={API_URL} />} />
                <Route path="/cadastro" element={<Cadastro api={API_URL} />} />
                <Route path="/login" element={<Login api={API_URL} />} />
                <Route path="/dashboard_advogado" element={<DashboardAdvogado api={API_URL} />} />
            </Routes>
        </Router>
    );
}

export default App;