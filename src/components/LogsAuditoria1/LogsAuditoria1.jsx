import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import MenuLateralAdvogado from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';
import css from './LogsAuditoria1.module.css';

function separarDataHora(data) {
    if (!data) return { data: '-', hora: '-' };
    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return { data: '-', hora: '-' };
    return {
        data: valor.toLocaleDateString('pt-BR'),
        hora: valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
}

function classeAcao(acao) {
    const base = css.tagAcao;
    if (acao === 'CRIAR' || acao === 'INSERT') return `${base} ${css.tagCriar}`;
    if (acao === 'EDITAR' || acao === 'UPDATE') return `${base} ${css.tagEditar}`;
    if (acao === 'EXCLUIR' || acao === 'DELETE') return `${base} ${css.tagExcluir}`;
    return base;
}

function traduzirAcao(acao) {
    if (acao === 'INSERT' || acao === 'CRIAR') return 'cadastrou';
    if (acao === 'UPDATE' || acao === 'EDITAR') return 'atualizou';
    if (acao === 'DELETE' || acao === 'EXCLUIR') return 'excluiu';
    return 'modificou';
}

function formatarCampo(campo) {
    const termos = {
        'EMAIL': 'E-mail', 'CPF': 'CPF', 'CNPJ': 'CNPJ', 'TELEFONE': 'Telefone',
        'NOME': 'Nome', 'RG': 'RG', 'CEP': 'CEP', 'LOGRADOURO': 'Rua/Logradouro',
        'NUMERO': 'Número', 'BAIRRO': 'Bairro', 'CIDADE': 'Cidade', 'ESTADO': 'Estado',
        'SENHA': 'Senha', 'ATIVO': 'Status do Cadastro', 'TIPO': 'Tipo de Pessoa'
    };
    const campoLimpo = String(campo || '').toUpperCase();
    if (termos[campoLimpo]) return termos[campoLimpo];
    return String(campo || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
}

export default function LogsAuditoria1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://192.168.0.131:5000';

    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [detalheAberto, setDetalheAberto] = useState(null);
    const [menuColapsado, setMenuColapsado] = useState(false);
    const [idEscritorio, setIdEscritorio] = useState(null);

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [inicioAplicado, setInicioAplicado] = useState('');
    const [fimAplicado, setFimAplicado] = useState('');

    useEffect(() => {
        const aplicarEstadoMenu = evento => setMenuColapsado(evento?.detail?.colapsado ?? false);
        aplicarEstadoMenu({ detail: { colapsado: localStorage.getItem('menu_colapsado') === 'true' } });
        window.addEventListener('menu-lateral-toggle', aplicarEstadoMenu);
        return () => window.removeEventListener('menu-lateral-toggle', aplicarEstadoMenu);
    }, []);

    const carregarLogs = useCallback(async (idEsc) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setCarregando(true);
        setErro('');

        try {
            const resposta = await fetch(`${API_URL}/escritorio/${idEsc}/logs`, {
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados.error || 'Não foi possível carregar os logs.');
            setLogs(Array.isArray(dados.logs) ? dados.logs : []);

        } catch (error) {
            setErro(error.message || 'Erro ao consultar os registros.');
            setLogs([]);
        } finally {
            setCarregando(false);
        }
    }, [API_URL, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        async function carregarEscritorio() {
            setCarregando(true);
            setErro('');
            try {
                const resposta = await fetch(`${API_URL}/meu_escritorio`, {
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });
                const dados = await resposta.json();
                if (!resposta.ok) throw new Error(dados.error || 'Não foi possível consultar o escritório.');

                const id = dados.escritorio?.id;
                if (!id) throw new Error('Nenhum escritório foi encontrado.');

                setIdEscritorio(id);
                await carregarLogs(id);
            } catch (error) {
                setErro(error.message || 'Erro ao carregar o escritório.');
                setCarregando(false);
            }
        }
        carregarEscritorio();
    }, [API_URL, navigate, carregarLogs]);

    const logsFiltrados = useMemo(() => {
        return logs.filter(log => {
            if (!log.data_hora) return !inicioAplicado && !fimAplicado;
            const dataLog = log.data_hora.split('T')[0];
            if (inicioAplicado && dataLog < inicioAplicado) return false;
            if (fimAplicado && dataLog > fimAplicado) return false;
            return true;
        });
    }, [logs, inicioAplicado, fimAplicado]);

    function aplicarFiltros() {
        if (dataInicio && dataFim && dataInicio > dataFim) {
            setErro('A data inicial não pode ser posterior à data final.');
            return;
        }
        setErro('');
        setInicioAplicado(dataInicio);
        setFimAplicado(dataFim);
    }

    function limparFiltros() {
        setDataInicio('');
        setDataFim('');
        setInicioAplicado('');
        setFimAplicado('');
        setErro('');
    }

    function atualizarLogs() {
        if (idEscritorio) carregarLogs(idEscritorio);
    }

    async function baixarPdf() {
        const token = localStorage.getItem('token');
        if (!token || !idEscritorio) return;

        try {
            const resposta = await fetch(`${API_URL}/escritorio/${idEscritorio}/logs/pdf`, {
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (!resposta.ok) throw new Error('Não foi possível gerar o PDF.');

            const arquivo = URL.createObjectURL(await resposta.blob());
            const link = document.createElement('a');
            link.href = arquivo;
            link.download = 'historico-alteracoes.pdf';
            link.click();
            URL.revokeObjectURL(arquivo);
        } catch (e) {
            setErro(e.message);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div className={`${css.menuLateralContainer} ${menuColapsado ? css.menuLateralColapsado : ''}`}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <main className={css.conteudoPrincipal}>
                    <div className={css.topoPagina}>
                        <div>
                            <h1 className={css.tituloPagina}>Histórico de Alterações</h1>
                            <p className={css.subtituloPagina}>Acompanhe quem alterou os cadastros do escritório e o que foi modificado.</p>
                        </div>
                    </div>

                    <div className={css.areaFiltros}>
                        <label>Data inicial<input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></label>
                        <label>Data final<input type="date" min={dataInicio || undefined} value={dataFim} onChange={e => setDataFim(e.target.value)} /></label>

                        <button className={css.botaoFiltrar} type="button" onClick={aplicarFiltros}>Filtrar</button>
                        <button className={css.botaoLimpar} type="button" onClick={limparFiltros}>Limpar filtros</button>

                        <button className={css.botaoFiltrar} type="button" onClick={atualizarLogs} disabled={carregando || !idEscritorio}>
                            Atualizar
                        </button>

                        <button className={css.botaoLimpar} type="button" onClick={baixarPdf} disabled={carregando || !idEscritorio}>
                            Baixar PDF
                        </button>
                    </div>

                    {carregando && <p className={css.estado}>Carregando histórico...</p>}
                    {erro && <p className={`${css.estado} ${css.erro}`}>{erro}</p>}

                    {!carregando && !erro && logsFiltrados.length === 0 && (
                        <p className={css.estado}>Nenhuma alteração encontrada para este período.</p>
                    )}

                    {!carregando && !erro && logsFiltrados.length > 0 && (
                        <div className={css.cardsArea}>
                            {logsFiltrados.map(log => {
                                const { data, hora } = separarDataHora(log.data_hora);
                                return (
                                    <article className={css.card} key={log.id_log}>
                                        {log.alerta_banco && (
                                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                                ALTERAÇÃO DIRETA NO BANCO DE DADOS
                                            </div>
                                        )}

                                        <header className={css.cardHeader}>
                                            <div className={css.cardUsuario}>
                                                <strong style={{ color: log.alerta_banco ? '#991b1b' : '#0f172a' }}>{log.nome_usuario}</strong>
                                                <span className={css.cargo}>{log.cargo || log.maquina}</span>
                                            </div>
                                            <span className={classeAcao(log.acao)}>
                                                {log.acao === 'INSERT' ? 'Novo Cadastro' : log.acao === 'DELETE' ? 'Exclusão' : 'Atualização'}
                                            </span>
                                        </header>

                                        <p className={css.cardResumo} style={{ fontSize: '0.95rem', color: '#334155', marginTop: '8px' }}>
                                            {log.nome_usuario} <strong>{traduzirAcao(log.acao)}</strong> o cadastro de <strong>{log.nome_registro_afetado}</strong>.
                                        </p>

                                        <div className={css.cardMeta}>
                                            <div><span>Data</span><strong>{data}</strong></div>
                                            <div><span>Hora</span><strong>{hora}</strong></div>
                                            <div><span>Meio</span><strong>{log.alerta_banco ? 'Banco de Dados' : 'Sistema'}</strong></div>
                                        </div>

                                        <footer className={css.cardFooter}>
                                            <button type="button" className={css.botaoDetalhes} onClick={() => setDetalheAberto(log)}>Ver detalhes</button>
                                        </footer>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {detalheAberto && (
                <div className={css.fundoModal} onMouseDown={() => setDetalheAberto(null)}>
                    <section className={css.modal} onMouseDown={e => e.stopPropagation()}>
                        <button type="button" className={css.fechar} onClick={() => setDetalheAberto(null)}>&times;</button>

                        <h2>Detalhes da Ação</h2>

                        {detalheAberto.alerta_banco && (
                            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px' }}>
                                Esta alteração não foi feita pelo sistema. Alguém modificou o banco de dados diretamente.
                            </div>
                        )}

                        <p className={css.resumoTexto} style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#334155' }}>
                            <strong>{detalheAberto.nome_usuario}</strong> {traduzirAcao(detalheAberto.acao)} o cadastro de <strong>{detalheAberto.nome_registro_afetado}</strong>.
                        </p>

                        <div className={css.resumoAcao}>
                            <div>
                                <span>Quem realizou</span>
                                <strong style={{ color: detalheAberto.alerta_banco ? '#991b1b' : '#0f172a' }}>{detalheAberto.nome_usuario}</strong>
                            </div>
                            <div>
                                <span>Quem foi alterado</span>
                                <strong>{detalheAberto.nome_registro_afetado}</strong>
                            </div>
                            <div>
                                <span>Origem</span>
                                <strong>{detalheAberto.alerta_banco ? 'Banco de dados' : 'Sistema'}</strong>
                            </div>
                            <div>
                                <span>Data e Hora</span>
                                <strong>{separarDataHora(detalheAberto.data_hora).data} às {separarDataHora(detalheAberto.data_hora).hora}</strong>
                            </div>
                            <div>
                                <span>Origem / IP</span>
                                <strong>{detalheAberto.ip_origem} ({detalheAberto.maquina})</strong>
                            </div>
                        </div>

                        {detalheAberto.mudancas?.length > 0 ? (
                            <div className={css.secaoAlteracao}>
                                <h3 className={css.tituloSecao}>O que mudou?</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '10px' }}>
                                    {detalheAberto.mudancas.map((mudanca, index) => (
                                        <div key={`${mudanca.campo}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <strong style={{ color: '#1e293b', textTransform: 'capitalize', fontSize: '1rem' }}>
                                                {formatarCampo(mudanca.campo)}
                                            </strong>
                                            <div className={css.alteracaoGrid}>
                                                <div className={`${css.alteracaoCard} ${css.alteracaoAntes}`}>
                                                    <span className={css.alteracaoLabel}>Antes</span>
                                                    <p className={css.alteracaoValor}>{mudanca.antes}</p>
                                                </div>
                                                <div className={`${css.alteracaoCard} ${css.alteracaoDepois}`}>
                                                    <span className={css.alteracaoLabel}>Depois</span>
                                                    <p className={css.alteracaoValor}>{mudanca.depois}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className={css.semInformacoes} style={{ marginTop: '1rem' }}>
                                {String(detalheAberto.campo || '').toUpperCase().includes('SENHA')
                                    ? 'A senha deste usuário foi modificada com sucesso.'
                                    : 'Nenhuma informação detalhada foi registrada nesta alteração.'}
                            </p>
                        )}
                    </section>
                </div>
            )}

            <Footer />
        </div>
    );
}