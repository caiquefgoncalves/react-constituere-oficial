import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './AdvogadosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function AdvogadosLista1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://192.168.0.123:5000';

    const [advogados, setAdvogados] = useState([]);
    const [escritorios, setEscritorios] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [quantidade, setQuantidade] = useState(0);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroEscritorio, setFiltroEscritorio] = useState('todos');
    const [filtroCargo, setFiltroCargo] = useState('todos');
    const [carregando, setCarregando] = useState(true);
    const [carregandoAcao, setCarregandoAcao] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    function mostrarMensagem(texto, tipo = 'sucesso') {
        setMensagem(texto);
        setTipoMensagem(tipo);
        setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 3000);
    }

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        navigate('/login');
    }

    async function buscarEscritorios() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/filtro_escritorios_advogados`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setEscritorios(data.escritorios || []);
                return;
            }
            if (response.status === 401) {
                deslogar();
                return;
            }
            mostrarMensagem(data.error || 'Erro ao carregar escritórios.', 'erro');
        } catch (error) {
            mostrarMensagem('Erro de conexão ao carregar escritórios.', 'erro');
        }
    }

    async function buscarCargos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/filtro_cargos_advogados`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setCargos(data.cargos || []);
                return;
            }
            if (response.status === 401) {
                deslogar();
                return;
            }
            mostrarMensagem(data.error || 'Erro ao carregar cargos.', 'erro');
        } catch (error) {
            mostrarMensagem('Erro de conexão ao carregar cargos.', 'erro');
        }
    }

    async function buscarAdvogados() {
        try {
            setCarregando(true);
            const token = localStorage.getItem('token');
            const parametros = new URLSearchParams();
            if (filtroEscritorio !== 'todos') parametros.append('id_escritorio', filtroEscritorio);
            if (filtroCargo !== 'todos') parametros.append('status', filtroCargo);
            let url = `${API_URL}/listar_advogados`;
            if (parametros.toString()) url += `?${parametros.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setAdvogados(data.advogados || []);
                setQuantidade(data.quantidade || 0);
                return;
            }
            if (response.status === 401) {
                deslogar();
                return;
            }
            setAdvogados([]);
            setQuantidade(0);
            mostrarMensagem(data.error || 'Erro ao carregar advogados.', 'erro');
        } catch (error) {
            setAdvogados([]);
            setQuantidade(0);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tipo = localStorage.getItem('tipo');
        if (!token || tipo === null) {
            navigate('/login');
            return;
        }
        buscarEscritorios();
        buscarCargos();
    }, [API_URL, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        buscarAdvogados();
    }, [API_URL, filtroEscritorio, filtroCargo]);

    async function alterarCargo(idAdvogado, idEscritorio, novoStatus) {
        try {
            setCarregandoAcao(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/alterar_cargo_advogado/${idAdvogado}/${idEscritorio}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({ status: novoStatus })
            });
            const data = await response.json();
            if (response.ok) {
                mostrarMensagem(data.mensagem || 'Cargo alterado com sucesso!', 'sucesso');
                await buscarAdvogados();
                return;
            }
            if (response.status === 401) {
                deslogar();
                return;
            }
            mostrarMensagem(data.error || 'Erro ao alterar cargo.', 'erro');
        } catch (error) {
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setCarregandoAcao(false);
        }
    }

    async function retirarDoEscritorio(idAdvogado, idEscritorio, nomeAdvogado, nomeEscritorio) {
        const confirmar = window.confirm(`Deseja retirar ${nomeAdvogado} do escritório ${nomeEscritorio}?`);
        if (!confirmar) return;
        try {
            setCarregandoAcao(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/advogado_escritorio/${idAdvogado}/${idEscritorio}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            const data = await response.json();
            if (response.ok) {
                mostrarMensagem(data.mensagem || 'Advogado retirado do escritório com sucesso!', 'sucesso');
                await buscarAdvogados();
                return;
            }
            if (response.status === 401) {
                deslogar();
                return;
            }
            mostrarMensagem(data.error || 'Erro ao retirar advogado do escritório.', 'erro');
        } catch (error) {
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setCarregandoAcao(false);
        }
    }

    const advogadosFiltrados = advogados.filter(advogado => {
        if (!filtroNome.trim()) return true;
        return advogado.nome?.toLowerCase().includes(filtroNome.toLowerCase());
    });

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />
            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>
                <div className={css.conteudoPrincipal}>
                    <div className={css.topoSaudacao}>
                        <h1 className={css.tituloPagina}>Advogados</h1>
                    </div>

                    {mensagem && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: tipoMensagem === 'erro' ? '#f8d7da' : '#d4edda',
                            color: tipoMensagem === 'erro' ? '#721c24' : '#155724',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.gradeEstatisticas}>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Advogados encontrados</span>
                            <span className={css.numeroEstatistica}>{quantidade}</span>
                        </div>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Escritórios</span>
                            <span className={css.numeroEstatistica}>{escritorios.length}</span>
                        </div>
                    </div>

                    <div className={css.areaFiltros}>
                        <div className={css.buscaContainer}>
                            <input
                                type="text"
                                className={css.inputBusca}
                                placeholder="Pesquisar por nome do advogado..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                            />
                            <svg className={css.iconeBusca} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <div className={css.filtrosOpcoes}>
                            <select className={css.selectFiltro} value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}>
                                <option value="todos">Filtrar por: Posição</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.valor} value={cargo.valor}>{cargo.nome}</option>
                                ))}
                            </select>
                            <select className={css.selectFiltro} value={filtroEscritorio} onChange={(e) => setFiltroEscritorio(e.target.value)}>
                                <option value="todos">Filtrar por: Escritório</option>
                                {escritorios.map(escritorio => (
                                    <option key={escritorio.id} value={escritorio.id}>{escritorio.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={css.tabelaContainer}>
                        {carregando ? (
                            <p>Carregando advogados...</p>
                        ) : advogadosFiltrados.length === 0 ? (
                            <p>Nenhum advogado encontrado.</p>
                        ) : (
                            <table className={css.tabela}>
                                <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Nº da OAB</th>
                                    <th>E-mail</th>
                                    <th className={css.colunaEscritorios}>Escritório / Posição</th>
                                    <th className={css.colunaAcoes}>Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {advogadosFiltrados.map(advogado => (
                                    <tr key={advogado.id}>
                                        <td>{advogado.nome}</td>
                                        <td>{advogado.oab}</td>
                                        <td>{advogado.email}</td>
                                        <td className={css.colunaEscritorios}>
                                            <div className={css.gridVinculos}>
                                                {advogado.escritorios.map((esc) => (
                                                    <div key={esc.id} className={css.itemGrid}>
                                                        <span className={css.nomeEscritorio}>{esc.nome}</span>
                                                        <span className={`${css.statusBadge} ${esc.status === 'PROPRIETARIO' ? css.proprietario : css.parceiro}`}>
                                                            {esc.status === 'PROPRIETARIO' ? 'Proprietário' : 'Parceiro'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className={css.colunaAcoes}>
                                            <div className={css.gridAcoes}>
                                                {advogado.escritorios.map((esc) => (
                                                    <div key={esc.id} className={css.itemAcaoGrid}>
                                                        {esc.pode_gerenciar ? (
                                                            <>
                                                                {esc.status === 'PARCEIRO' ? (
                                                                    <button
                                                                        className={css.botaoVer}
                                                                        disabled={carregandoAcao}
                                                                        onClick={() => alterarCargo(advogado.id, esc.id, 'PROPRIETARIO')}
                                                                    >
                                                                        Promover
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className={css.botaoVer}
                                                                        disabled={carregandoAcao}
                                                                        onClick={() => alterarCargo(advogado.id, esc.id, 'PARCEIRO')}
                                                                    >
                                                                        Regredir
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className={css.botaoInativar}
                                                                    disabled={carregandoAcao}
                                                                    onClick={() => retirarDoEscritorio(advogado.id, esc.id, advogado.nome, esc.nome)}
                                                                >
                                                                    Retirar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={css.semAcao}>Sem Ações</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}