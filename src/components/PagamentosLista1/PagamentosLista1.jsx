import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './PagamentosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function PagamentosLista1({ api }) {
    const navigate = useNavigate();
    const [pagamentos, setPagamentos] = useState([]);
    const [totais, setTotais] = useState({ recebido: 0, a_pagar: 0, atrasado: 0 });
    const [primeiraCarga, setPrimeiraCarga] = useState(true);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [filtroNome, setFiltroNome] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const [pagina, setPagina] = useState(1);
    const [temMais, setTemMais] = useState(false);
    const limite = 10;

    const [modalBaixaAberto, setModalBaixaAberto] = useState(false);
    const [parcelaBaixar, setParcelaBaixar] = useState(null);
    const [baixando, setBaixando] = useState(false);

    const API_URL = api || 'http://10.92.11.34:5000';
    const debounceTimer = useRef(null);
    const totaisCarregados = useRef(false);

    const buscarTotais = useCallback(async () => {
        if (totaisCarregados.current) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const url = `${API_URL}/pagamentos?page=1&limit=1`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setTotais({
                    recebido: data.totais?.recebido ?? 0,
                    a_pagar: data.totais?.a_pagar ?? 0,
                    atrasado: data.totais?.atrasado ?? 0
                });
                totaisCarregados.current = true;
            }
        } catch (error) {
            console.error('Erro ao buscar totais:', error);
        }
    }, [API_URL]);

    const buscarPagamentos = useCallback(async (paginaAtual = 1) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            let url = `${API_URL}/pagamentos?page=${paginaAtual}&limit=${limite}`;
            if (filtroStatus !== 'todos') {
                url += `&status=${encodeURIComponent(filtroStatus)}`;
            }
            if (filtroNome.trim()) {
                url += `&cliente=${encodeURIComponent(filtroNome)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setPagamentos(data.pagamentos || []);
                setTemMais(data.tem_mais || false);
                setPagina(paginaAtual);
            } else if (response.status === 401) {
                localStorage.removeItem('nome');
                localStorage.removeItem('tipo');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                const data = await response.json();
                setMensagem(data.error || 'Erro ao carregar pagamentos.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setPrimeiraCarga(false);
        }
    }, [API_URL, navigate, filtroNome, filtroStatus, limite]);

    useEffect(() => {
        buscarTotais();
        buscarPagamentos(1);
    }, []);

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (primeiraCarga) return;

        debounceTimer.current = setTimeout(() => {
            setPagina(1);
            buscarPagamentos(1);
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [filtroNome, filtroStatus, buscarPagamentos, primeiraCarga]);

    const irParaPagina = (novaPagina) => {
        if (novaPagina < 1) return;
        if (novaPagina > pagina && !temMais) return;
        buscarPagamentos(novaPagina);
    };

    function formatarMoeda(valor) {
        if (valor === undefined || valor === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    function getStatusClass(status) {
        if (!status) return '';
        const statusMap = {
            'A pagar': 'apagar',
            'Paga': 'paga',
            'Atrasada': 'atrasada'
        };
        return statusMap[status] || status.toLowerCase().replace(' ', '');
    }

    function abrirModalBaixa(parcela) {
        setParcelaBaixar(parcela);
        setModalBaixaAberto(true);
    }

    function fecharModalBaixa() {
        setModalBaixaAberto(false);
        setParcelaBaixar(null);
        setBaixando(false);
    }

    async function confirmarBaixa() {
        if (!parcelaBaixar) return;

        setBaixando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/pagamentos/${parcelaBaixar.id}/baixar`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMensagem(data.mensagem || 'Pagamento confirmado com sucesso!');
                setTipoMensagem('sucesso');
                fecharModalBaixa();
                buscarPagamentos(pagina);
                totaisCarregados.current = false;
                buscarTotais();
            } else {
                setMensagem(data.error || 'Erro ao confirmar pagamento.');
                setTipoMensagem('erro');
                fecharModalBaixa();
            }
        } catch (error) {
            console.error('Erro ao dar baixa:', error);
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
            fecharModalBaixa();
        } finally {
            setBaixando(false);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>
                    <div className={css.topoSaudacao}>
                        <h1 className={css.tituloPagina}>Pagamentos</h1>
                    </div>

                    {mensagem && (
                        <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.gradeEstatisticas}>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Valor Total Recebido</span>
                            <span className={css.numeroEstatistica}>{formatarMoeda(totais.recebido)}</span>
                        </div>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Valor Total a Pagar</span>
                            <span className={css.numeroEstatistica}>{formatarMoeda(totais.a_pagar)}</span>
                        </div>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Valor Total em Atraso</span>
                            <span className={css.numeroEstatistica}>{formatarMoeda(totais.atrasado)}</span>
                        </div>
                    </div>

                    <div className={css.areaFiltros}>
                        <div className={css.buscaContainer}>
                            <input
                                type="text"
                                className={css.inputBusca}
                                placeholder="Pesquisar por nome do pagamento ou cliente..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                                name="filtro_nome"
                            />
                            <svg className={css.iconeBusca} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        <div className={css.filtrosOpcoes}>
                            <select className={css.selectFiltro} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} name="filtro_status">
                                <option value="todos">Filtrar por: Status</option>
                                <option value="A pagar">A pagar</option>
                                <option value="Paga">Paga</option>
                                <option value="Atrasada">Atrasada</option>
                            </select>
                        </div>
                    </div>

                    <div className={css.tabelaContainer}>
                        {primeiraCarga ? (
                            <p>Carregando pagamentos...</p>
                        ) : pagamentos.length === 0 ? (
                            <p>Nenhum pagamento encontrado.</p>
                        ) : (
                            <>
                                <table className={css.tabela}>
                                    <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Valor</th>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th>Pagamento</th>
                                        <th>Vencimento</th>
                                        <th className={css.colunaAcoes}>Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pagamentos.map(pag => (
                                        <tr key={pag.id}>
                                            <td>{pag.nome || '--'}</td>
                                            <td>{formatarMoeda(pag.valor)}</td>
                                            <td>{pag.cliente || '--'}</td>
                                            <td>
                                                <span className={`${css.statusBadge} ${css[getStatusClass(pag.status)]}`}>
                                                    {pag.status || '--'}
                                                </span>
                                            </td>
                                            <td>{pag.pagamento || '--'}</td>
                                            <td>{pag.vencimento || '--'}</td>
                                            <td className={css.colunaAcoes}>
                                                {pag.status !== 'Paga' && pag.status !== undefined && (
                                                    <button
                                                        className={css.botaoDarBaixa}
                                                        onClick={() => abrirModalBaixa(pag)}
                                                    >
                                                        Dar Baixa
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                <div className={css.paginacao}>
                                    <button
                                        className={css.botaoPagina}
                                        onClick={() => irParaPagina(pagina - 1)}
                                        disabled={pagina <= 1}
                                    >
                                        Anterior
                                    </button>
                                    <span className={css.infoPagina}>Página {pagina}</span>
                                    {temMais && (
                                        <button
                                            className={css.botaoPagina}
                                            onClick={() => irParaPagina(pagina + 1)}
                                        >
                                            Próxima
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {modalBaixaAberto && parcelaBaixar && (
                <div className={css.modalOverlay}>
                    <div className={css.modalBaixaContainer}>
                        <button
                            className={css.modalFecharIconeLeft}
                            onClick={fecharModalBaixa}
                            disabled={baixando}
                        >
                            ✕
                        </button>

                        <h2 className={css.tituloBaixa}>Confirmar pagamento</h2>
                        <p className={css.subtituloBaixa}>
                            Deseja confirmar o recebimento de <strong>{formatarMoeda(parcelaBaixar.valor)}</strong> referente a <strong>{parcelaBaixar.nome}</strong> do cliente <strong>{parcelaBaixar.cliente}</strong>?
                        </p>

                        <div className={css.botoesBaixa}>
                            <button
                                className={css.btnCancelarBaixa}
                                onClick={fecharModalBaixa}
                                disabled={baixando}
                            >
                                Cancelar
                            </button>
                            <button
                                className={css.btnConfirmarBaixa}
                                onClick={confirmarBaixa}
                                disabled={baixando}
                            >
                                {baixando ? 'Confirmando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}