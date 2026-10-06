import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import css from "./DashboardFinanceiroEscritorio1.module.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";
import AdicionarLancamento1 from "../AdicionarLancamento1/AdicionarLancamento1.jsx";

const ITENS_POR_PAGINA = 20;

function capitalizarFrase(texto) {
    if (texto === null || texto === undefined) return "--";
    const valor = String(texto).trim();
    if (!valor) return "--";
    const minusculo = valor.toLowerCase();
    return minusculo.charAt(0).toUpperCase() + minusculo.slice(1);
}

function DashboardFinanceiroEscritorio1({ api }) {
    const navigate = useNavigate();
    const { id } = useParams();

    const API_URL = api || "http://10.92.11.25:5000";

    const [menuColapsado, setMenuColapsado] = useState(false);
    const [periodo, setPeriodo] = useState("mes");
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    const [nomeFantasia, setNomeFantasia] = useState("Carregando...");
    const [fotoPerfil, setFotoPerfil] = useState("");

    const [lancamentos, setLancamentos] = useState([]);
    const [carregandoResumo, setCarregandoResumo] = useState(true);
    const [tipoLancamento, setTipoLancamento] = useState("todos");
    const [modalAberto, setModalAberto] = useState(false);
    const [paginaLancamentos, setPaginaLancamentos] = useState(1);

    const [resumo, setResumo] = useState({
        receita_recebida: 0,
        receita_a_receber: 0,
        receita_pendente: 0,
        receita_atrasada: 0,
        total_receitas: 0,
        despesas: 0,
        saldo: 0,
        lucro: 0,
        prejuizo: 0,
        resultado: "neutro",
        percentual_recebido: 0,
        situacao: "Atenção"
    });

    useEffect(() => {
        function aplicarEstadoMenu(e) {
            const colapsado = e?.detail?.colapsado ?? false;
            setMenuColapsado(colapsado);
        }

        aplicarEstadoMenu({
            detail: {
                colapsado: localStorage.getItem("menu_colapsado") === "true"
            }
        });

        window.addEventListener("menu-lateral-toggle", aplicarEstadoMenu);

        return () => {
            window.removeEventListener("menu-lateral-toggle", aplicarEstadoMenu);
        };
    }, []);

    useEffect(() => {
        async function buscarEscritorio() {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/escritorio/${id}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "X-Access-Token": token }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNomeFantasia(data.escritorio?.nome_fantasia || "Escritório");

                    if (data.escritorio?.id) {
                        setFotoPerfil(
                            `${API_URL}/uploads/Escritorios/escritorio_${data.escritorio.id}.jpeg`
                        );
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar escritório:", error);
            }
        }

        if (id) buscarEscritorio();
    }, [API_URL, id]);

    async function buscarDados() {
        const token = localStorage.getItem("token");
        if (!token || !id) return;

        setCarregandoResumo(true);

        try {
            let query = `periodo=${periodo}&tipo=${tipoLancamento}`;

            if (periodo === "personalizado" && dataInicial && dataFinal) {
                query += `&data_inicial=${dataInicial}&data_final=${dataFinal}`;
            }

            const [respLanc, respResumo] = await Promise.all([
                fetch(`${API_URL}/escritorio/${id}/financeiro/lancamentos?${query}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "X-Access-Token": token }
                }),
                fetch(`${API_URL}/escritorio/${id}/financeiro/resumo?${query}`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "X-Access-Token": token }
                })
            ]);

            if (respLanc.ok) {
                const dataLanc = await respLanc.json();
                setLancamentos(dataLanc.lancamentos || []);
                setPaginaLancamentos(1);
            }

            if (respResumo.ok) {
                const dataResumo = await respResumo.json();
                setResumo(dataResumo);
            }
        } catch (error) {
            console.error("Erro ao buscar dados financeiros:", error);
        } finally {
            setCarregandoResumo(false);
        }
    }

    useEffect(() => {
        buscarDados();
    }, [API_URL, id, periodo, dataInicial, dataFinal, tipoLancamento]);

    function abrirModal() {
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
    }

    function handleLancamentoSucesso() {
        buscarDados();
    }

    const receitaRecebida = resumo.receita_recebida || 0;
    const receitaAReceber = resumo.receita_a_receber || 0;
    const receitaPendente = resumo.receita_pendente || 0;
    const receitaAtrasada = resumo.receita_atrasada || 0;
    const despesas = resumo.despesas || 0;
    const saldo = resumo.saldo || 0;
    const totalReceitas = resumo.total_receitas || 0;
    const percentualArredondado = resumo.percentual_recebido || 0;
    const situacao = resumo.situacao || "Atenção";

    const lucro = resumo.lucro || 0;
    const prejuizo = resumo.prejuizo || 0;
    const resultado = resumo.resultado || "neutro";

    const maiorValor = Math.max(receitaRecebida, receitaAReceber, despesas, 1);

    const alturaRecebida = (receitaRecebida / maiorValor) * 100;
    const alturaAReceber = (receitaAReceber / maiorValor) * 100;
    const alturaDespesas = (despesas / maiorValor) * 100;

    const totalPaginas = Math.max(1, Math.ceil(lancamentos.length / ITENS_POR_PAGINA));
    const inicio = (paginaLancamentos - 1) * ITENS_POR_PAGINA;
    const lancamentosPaginados = lancamentos.slice(inicio, inicio + ITENS_POR_PAGINA);

    function irParaPagina(novaPagina) {
        if (novaPagina < 1 || novaPagina > totalPaginas) return;
        setPaginaLancamentos(novaPagina);
    }

    function dinheiro(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(valor) {
        if (!valor) return "--";
        const partes = String(valor).split("-");
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return valor;
    }

    function classeCardSituacao(nome) {
        return `${css.situacaoCard} ${
            situacao === nome ? css.situacaoCardAtiva : ""
        }`;
    }

    function classeStatusBadge(status) {
        if (status === "recebida" || status === "pago") return css.badgePago;
        if (status === "atrasado") return css.badgeAtrasado;
        return css.badgePendente;
    }

    function voltarParaDashboardEscritorio() {
        navigate(`/escritorio/${id}`);
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} fotoPerfil={fotoPerfil} />

            <div className={css.layoutDashboard}>
                <div
                    className={`${css.menuLateralContainer} ${
                        menuColapsado ? css.menuLateralColapsado : ""
                    }`}
                >
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>
                    <div className={css.topArea}>
                        <button
                            className={css.botaoVoltar}
                            onClick={voltarParaDashboardEscritorio}
                            tabIndex={-1}
                            name="btn-voltar"
                            type="button"
                            aria-label="Voltar"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M15 18L9 12L15 6"
                                    stroke="#0047ab"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        <div className={css.topoSaudacao}>
                            <div className={css.saudacaoTexto}>
                                <p className={css.subtitulo}>FINANCEIRO DO ESCRITÓRIO</p>
                                <h1 className={css.tituloPagina}>Saúde financeira</h1>
                                <p className={css.descricao}>{nomeFantasia}</p>
                            </div>

                            <button
                                type="button"
                                className={css.botaoNovoLancamento}
                                onClick={abrirModal}
                                name="btn-novo-lancamento"
                            >
                                + Novo lançamento
                            </button>
                        </div>
                    </div>

                    <section className={css.blocoSaude}>
                        <div className={css.saudeTexto}>
                            <p className={css.subtituloSaude}>INDICADOR DA SAÚDE FINANCEIRA</p>
                            <h2>{situacao}</h2>
                            <p>
                                {situacao === "Boa" &&
                                    "O escritório apresenta saldo positivo e uma boa proporção de receitas recebidas."}
                                {situacao === "Atenção" &&
                                    "É importante acompanhar as receitas a receber e as despesas do escritório."}
                                {situacao === "Crítica" &&
                                    "As despesas estão comprometendo o resultado financeiro do escritório."}
                            </p>
                        </div>

                        <div className={css.percentualContainer}>
                            <div
                                className={css.percentual}
                                style={{ "--pct": `${percentualArredondado}%` }}
                            >
                                <span>{percentualArredondado}%</span>
                            </div>
                            <span className={css.percentualLabel}>
                                das receitas recebidas
                            </span>
                        </div>
                    </section>

                    <section
                        className={`${css.blocoResultado} ${
                            resultado === "lucro"
                                ? css.blocoLucro
                                : resultado === "prejuizo"
                                    ? css.blocoPrejuizo
                                    : css.blocoNeutro
                        }`}
                    >
                        <div className={css.resultadoIcone}>
                            {resultado === "lucro" && "▲"}
                            {resultado === "prejuizo" && "▼"}
                            {resultado === "neutro" && "■"}
                        </div>

                        <div className={css.resultadoTexto}>
                            <p className={css.resultadoSubtitulo}>RESULTADO DO PERÍODO</p>
                            {resultado === "lucro" && (
                                <>
                                    <h2>Você teve lucro</h2>
                                    <p>
                                        O escritório fechou o período com um resultado positivo de{" "}
                                        <strong>{dinheiro(lucro)}</strong>.
                                    </p>
                                </>
                            )}
                            {resultado === "prejuizo" && (
                                <>
                                    <h2>Você teve prejuízo</h2>
                                    <p>
                                        O escritório fechou o período com um resultado negativo de{" "}
                                        <strong>{dinheiro(prejuizo)}</strong>.
                                    </p>
                                </>
                            )}
                            {resultado === "neutro" && (
                                <>
                                    <h2>Resultado neutro</h2>
                                    <p>
                                        O escritório não teve lucro nem prejuízo neste período.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className={css.resultadoValor}>
                            <span className={css.resultadoValorLabel}>
                                {resultado === "prejuizo" ? "Prejuízo" : "Lucro"}
                            </span>
                            <span className={css.resultadoValorNumero}>
                                {resultado === "prejuizo"
                                    ? dinheiro(prejuizo)
                                    : dinheiro(lucro)}
                            </span>
                        </div>
                    </section>

                    <section className={css.bloco}>
                        <div className={css.tituloBloco}>
                            <h2>Resumo financeiro</h2>
                        </div>

                        <div className={css.resumo}>
                            <div className={css.linha}>
                                <span>Total de receitas previstas</span>
                                <strong>{dinheiro(totalReceitas)}</strong>
                            </div>

                            <div className={css.linha}>
                                <span>Receita recebida</span>
                                <strong className={css.valorRecebido}>{dinheiro(receitaRecebida)}</strong>
                            </div>

                            <div className={css.linha}>
                                <span>Receita a receber (pendente)</span>
                                <strong className={css.valorPendente}>{dinheiro(receitaPendente)}</strong>
                            </div>

                            <div className={css.linha}>
                                <span>Receita atrasada</span>
                                <strong className={css.valorAtraso}>{dinheiro(receitaAtrasada)}</strong>
                            </div>

                            <div className={css.linha}>
                                <span>Total a receber</span>
                                <strong className={css.valorAReceber}>{dinheiro(receitaAReceber)}</strong>
                            </div>

                            <div className={css.linha}>
                                <span>Despesas</span>
                                <strong>{dinheiro(despesas)}</strong>
                            </div>

                            <div className={css.linhaFinal}>
                                <span>Saldo atual</span>
                                <strong>{dinheiro(saldo)}</strong>
                            </div>
                        </div>
                    </section>

                    <section className={css.filtroPeriodo}>
                        <div className={css.filtroTitulo}>
                            <h2>Filtrar período</h2>
                            <p>Selecione o período das informações financeiras.</p>
                        </div>

                        <div className={css.filtroControles}>
                            <div className={css.campoFiltro}>
                                <label>Período</label>
                                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                                    <option value="mes">Este mês</option>
                                    <option value="mesAnterior">Mês anterior</option>
                                    <option value="30dias">Últimos 30 dias</option>
                                    <option value="90dias">Últimos 90 dias</option>
                                    <option value="personalizado">Personalizado</option>
                                </select>
                            </div>

                            {periodo === "personalizado" && (
                                <>
                                    <div className={css.campoFiltro}>
                                        <label>Data inicial</label>
                                        <input
                                            type="date"
                                            value={dataInicial}
                                            onChange={(e) => setDataInicial(e.target.value)}
                                        />
                                    </div>

                                    <div className={css.campoFiltro}>
                                        <label>Data final</label>
                                        <input
                                            type="date"
                                            value={dataFinal}
                                            onChange={(e) => setDataFinal(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <section className={css.bloco}>
                        <div className={css.tituloBloco}>
                            <div>
                                <h2>Visão financeira</h2>
                                <p>Comparativo entre receitas e despesas</p>
                            </div>
                        </div>

                        <div className={css.legenda}>
                            <span className={css.legendaRecebido}>&#9632; Recebido</span>
                            <span className={css.legendaAReceber}>&#9632; A Receber</span>
                            <span className={css.legendaDespesas}>&#9632; Despesas</span>
                        </div>

                        <div className={css.grafico}>
                            <div className={css.coluna}>
                                <span className={css.valor}>{dinheiro(receitaRecebida)}</span>
                                <div className={css.areaBarra}>
                                    <div
                                        className={`${css.barra} ${css.barraRecebida}`}
                                        style={{ height: `${alturaRecebida}%` }}
                                    />
                                </div>
                                <span className={css.label}>Recebido</span>
                            </div>

                            <div className={css.coluna}>
                                <span className={css.valor}>{dinheiro(receitaAReceber)}</span>
                                <div className={css.areaBarra}>
                                    <div
                                        className={`${css.barra} ${css.barraAReceber}`}
                                        style={{ height: `${alturaAReceber}%` }}
                                    />
                                </div>
                                <span className={css.label}>A receber</span>
                            </div>

                            <div className={css.coluna}>
                                <span className={css.valor}>{dinheiro(despesas)}</span>
                                <div className={css.areaBarra}>
                                    <div
                                        className={`${css.barra} ${css.barraDespesas}`}
                                        style={{ height: `${alturaDespesas}%` }}
                                    />
                                </div>
                                <span className={css.label}>Despesas</span>
                            </div>
                        </div>

                        <div className={css.graficoTotais}>
                            <div className={css.totalItem}>
                                <span className={css.totalLabel}>Recebido</span>
                                <span className={css.totalValor}>{dinheiro(receitaRecebida)}</span>
                            </div>

                            <div className={css.totalItem}>
                                <span className={css.totalLabel}>A Receber</span>
                                <span className={css.totalValor}>{dinheiro(receitaAReceber)}</span>
                            </div>

                            <div className={css.totalItem}>
                                <span className={css.totalLabel}>Despesas</span>
                                <span className={css.totalValor}>{dinheiro(despesas)}</span>
                            </div>
                        </div>
                    </section>

                    <section className={css.bloco}>
                        <div className={css.tituloBloco}>
                            <div>
                                <h2>Situações da saúde financeira</h2>
                                <p>Entenda o significado de cada indicador.</p>
                            </div>
                        </div>

                        <div className={css.situacoes}>
                            <div className={classeCardSituacao("Boa")}>
                                <span className={css.ponto} />
                                <div>
                                    <h3>Boa</h3>
                                    <p>Saldo positivo e pelo menos 70% das receitas previstas já recebidas.</p>
                                </div>
                            </div>

                            <div className={classeCardSituacao("Atenção")}>
                                <span className={css.ponto} />
                                <div>
                                    <h3>Atenção</h3>
                                    <p>O escritório possui saldo positivo, mas precisa acompanhar os valores.</p>
                                </div>
                            </div>

                            <div className={classeCardSituacao("Crítica")}>
                                <span className={css.ponto} />
                                <div>
                                    <h3>Crítica</h3>
                                    <p>O resultado financeiro está negativo e exige atenção imediata.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={css.bloco}>
                        <div className={css.tituloBloco}>
                            <div>
                                <h2>Lançamentos</h2>
                                <p>Histórico de despesas e receitas do escritório.</p>
                            </div>

                            <div className={css.filtrosLancamentos}>
                                <button
                                    type="button"
                                    className={`${css.botaoFiltroTipo} ${tipoLancamento === "todos" ? css.botaoFiltroAtivo : ""}`}
                                    onClick={() => setTipoLancamento("todos")}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    className={`${css.botaoFiltroTipo} ${tipoLancamento === "receita" ? css.botaoFiltroAtivo : ""}`}
                                    onClick={() => setTipoLancamento("receita")}
                                >
                                    Receitas
                                </button>
                                <button
                                    type="button"
                                    className={`${css.botaoFiltroTipo} ${tipoLancamento === "despesa" ? css.botaoFiltroAtivo : ""}`}
                                    onClick={() => setTipoLancamento("despesa")}
                                >
                                    Despesas
                                </button>
                            </div>
                        </div>

                        <div className={css.tabelaContainer}>
                            {carregandoResumo ? (
                                <p className={css.textoVazio}>Carregando lançamentos...</p>
                            ) : lancamentos.length === 0 ? (
                                <p className={css.textoVazio}>Nenhum lançamento encontrado.</p>
                            ) : (
                                <>
                                    <table className={css.tabela}>
                                        <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Descrição</th>
                                            <th>Data</th>
                                            <th>Status</th>
                                            <th>Valor</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {lancamentosPaginados.map((lanc) => (
                                            <tr key={lanc.id}>
                                                <td>
                                                        <span
                                                            className={`${css.badgeStatus} ${
                                                                lanc.tipo === "receita"
                                                                    ? css.badgeReceita
                                                                    : css.badgeDespesa
                                                            }`}
                                                        >
                                                            {lanc.tipo === "receita" ? "Receita" : "Despesa"}
                                                        </span>
                                                </td>
                                                <td>{capitalizarFrase(lanc.descricao)}</td>
                                                <td>{formatarData(lanc.data)}</td>
                                                <td>
                                                        <span className={`${css.badgeStatusInfo} ${classeStatusBadge(lanc.status)}`}>
                                                            {lanc.status === "recebida" && "Recebido"}
                                                            {lanc.status === "a_receber" && "A receber"}
                                                            {lanc.status === "atrasado" && "Atrasado"}
                                                            {lanc.status === "pago" && "Pago"}
                                                            {lanc.status === "pendente" && "Pendente"}
                                                            {!["recebida", "a_receber", "atrasado", "pago", "pendente"].includes(lanc.status) && (lanc.status || "--")}
                                                        </span>
                                                </td>
                                                <td
                                                    className={
                                                        lanc.tipo === "receita"
                                                            ? css.valorReceitaCelula
                                                            : css.valorDespesaCelula
                                                    }
                                                >
                                                    {dinheiro(lanc.valor)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    <div className={css.paginacao}>
                                        <button
                                            type="button"
                                            className={css.botaoPagina}
                                            onClick={() => irParaPagina(paginaLancamentos - 1)}
                                            disabled={paginaLancamentos <= 1}
                                        >
                                            Anterior
                                        </button>

                                        <span className={css.infoPagina}>
                                            Página {paginaLancamentos} de {totalPaginas}
                                        </span>

                                        <button
                                            type="button"
                                            className={css.botaoPagina}
                                            onClick={() => irParaPagina(paginaLancamentos + 1)}
                                            disabled={paginaLancamentos >= totalPaginas}
                                        >
                                            Próxima
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <AdicionarLancamento1
                api={API_URL}
                idEscritorio={id}
                isOpen={modalAberto}
                onClose={fecharModal}
                onSucesso={handleLancamentoSucesso}
            />

            <Footer />
        </div>
    );
}

export default DashboardFinanceiroEscritorio1;