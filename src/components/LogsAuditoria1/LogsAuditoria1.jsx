import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import MenuLateralAdvogado from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';
import css from './LogsAuditoria1.module.css';

const formatarData = data => data ? new Date(data).toLocaleString('pt-BR') : '-';
function separarDataHora(data) {
    if (!data) return { data: '-', hora: '-' };
    const valor = new Date(data);
    return {
        data: valor.toLocaleDateString('pt-BR'),
        hora: valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
}

const rotulos = {
    id_cliente: 'Cliente', id_advogado: 'Advogado', id_advogado_2: 'Advogado parceiro',
    id_escritorio: 'Escritorio', assunto: 'Assunto', cliente: 'Cliente', data: 'Data',
    horario: 'Horario', duracao: 'Duracao', motivo: 'Motivo', status: 'Status',
    processo: 'Processo', parte_contraria: 'Parte contraria', honorarios: 'Honorarios',
    numero_processo: 'Numero do processo', tipo_processo: 'Tipo de processo',
    area: 'Area', comarca: 'Comarca', vara: 'Vara', instancia: 'Instancia',
    data_inicio: 'Data de inicio', nome: 'Nome', email: 'E-mail', telefone: 'Telefone',
    valor: 'Valor', forma_pagamento: 'Forma de pagamento', vencimento: 'Vencimento'
};

function dadosLegiveis(detalhes) {
    try {
        const conteudo = JSON.parse(detalhes || '{}');
        return conteudo.dados && typeof conteudo.dados === 'object' ? conteudo.dados : conteudo;
    } catch { return { observacao: detalhes || 'Nenhuma informacao adicional.' }; }
}

function valorLegivel(valor, campo = '') {
    if (valor === null || valor === undefined || valor === '') return '-';
    if (valor === true) return 'Sim';
    if (valor === false) return 'Nao';
    const texto = String(valor);
    if (campo.toLowerCase().includes('data') && /^\d{4}-\d{2}-\d{2}/.test(texto)) {
        const [ano, mes, dia] = texto.slice(0, 10).split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return texto;
}

function CamposDetalhes({ dados, nivel = 0 }) {
    if (!dados || typeof dados !== 'object') return <span>{valorLegivel(dados)}</span>;
    return <div className={nivel ? css.grupoDetalhes : css.listaDetalhes}>
        {Object.entries(dados).map(([chave, valor]) => (
            <div className={css.linhaDetalhe} key={chave}>
                <strong>{rotulos[chave] || chave.replaceAll('_', ' ')}:</strong>
                {typeof valor === 'object' && valor !== null
                    ? <CamposDetalhes dados={valor} nivel={nivel + 1} />
                    : <span>{valorLegivel(valor, chave)}</span>}
            </div>
        ))}
    </div>;
}

export default function LogsAuditoria1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://localhost:5000';
    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [detalheAberto, setDetalheAberto] = useState(null);
    const [menuColapsado, setMenuColapsado] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [advogado, setAdvogado] = useState('');
    const [idEscritorio, setIdEscritorio] = useState(null);

    useEffect(() => {
        const aplicarEstadoMenu = evento => setMenuColapsado(evento?.detail?.colapsado ?? false);
        aplicarEstadoMenu({ detail: { colapsado: localStorage.getItem('menu_colapsado') === 'true' } });
        window.addEventListener('menu-lateral-toggle', aplicarEstadoMenu);
        return () => window.removeEventListener('menu-lateral-toggle', aplicarEstadoMenu);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        async function carregar() {
            try {
                const headers = { 'X-Access-Token': token };
                const respostaEscritorio = await fetch(`${API_URL}/meu_escritorio`, { credentials: 'include', headers });
                const dadosEscritorio = await respostaEscritorio.json();
                if (!respostaEscritorio.ok || !dadosEscritorio.escritorio?.id) { navigate('/dashboard_advogado'); return; }
                setIdEscritorio(dadosEscritorio.escritorio.id);
                const respostaLogs = await fetch(`${API_URL}/escritorio/${dadosEscritorio.escritorio.id}/logs?limite=200`, { credentials: 'include', headers });
                const dadosLogs = await respostaLogs.json();
                if (!respostaLogs.ok) throw new Error(dadosLogs.error || 'Nao foi possivel carregar o Log.');
                setLogs(dadosLogs.logs || []);
            } catch (e) { setErro(e.message || 'Nao foi possivel carregar o Log.'); }
            finally { setCarregando(false); }
        }
        carregar();
    }, [API_URL, navigate]);

    const advogados = [...new Set(logs.map(log => log.nome_usuario).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const logsFiltrados = logs.filter(log => {
        const dataLog = String(log.data_hora || '').slice(0, 10);
        return (!dataInicio || dataLog >= dataInicio)
            && (!dataFim || dataLog <= dataFim)
            && (!advogado || log.nome_usuario === advogado);
    });

    function limparFiltros() {
        setDataInicio('');
        setDataFim('');
        setAdvogado('');
    }

    async function baixarPdf() {
        const token = localStorage.getItem('token');
        if (!token || !idEscritorio) return;
        const parametros = new URLSearchParams();
        if (dataInicio) parametros.set('data_inicio', dataInicio);
        if (dataFim) parametros.set('data_fim', dataFim);
        if (advogado) parametros.set('advogado', advogado);
        try {
            const resposta = await fetch(`${API_URL}/escritorio/${idEscritorio}/logs/pdf?${parametros}`, {
                credentials: 'include', headers: { 'X-Access-Token': token }
            });
            if (!resposta.ok) throw new Error('Nao foi possivel gerar o PDF.');
            const arquivo = URL.createObjectURL(await resposta.blob());
            const link = document.createElement('a');
            link.href = arquivo;
            link.download = 'log-escritorio.pdf';
            link.click();
            URL.revokeObjectURL(arquivo);
        } catch (e) { setErro(e.message); }
    }

    return <div className={css.paginaCompleta}>
        <Header api={API_URL} />
        <div className={css.layoutDashboard}>
            <div className={`${css.menuLateralContainer} ${menuColapsado ? css.menuLateralColapsado : ''}`}><MenuLateralAdvogado api={API_URL} /></div>
            <main className={css.conteudoPrincipal}>
                <div className={css.topoPagina}><h1 className={css.tituloPagina}>Log</h1></div>
                {carregando && <p className={css.estado}>Carregando log...</p>}
                {erro && <p className={`${css.estado} ${css.erro}`}>{erro}</p>}
                {!carregando && !erro && logs.length === 0 && <p className={css.estado}>Nenhuma acao registrada para este escritorio.</p>}
                {!carregando && !erro && logs.length > 0 && <>
                    <div className={css.areaFiltros}>
                        <label>Data inicial<input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></label>
                        <label>Data final<input type="date" min={dataInicio || undefined} value={dataFim} onChange={e => setDataFim(e.target.value)} /></label>
                        <label>Advogado<select value={advogado} onChange={e => setAdvogado(e.target.value)}><option value="">Todos os advogados</option>{advogados.map(nome => <option key={nome} value={nome}>{nome}</option>)}</select></label>
                        <button className={css.botaoLimpar} type="button" onClick={limparFiltros}>Limpar filtros</button>
                        <button className={css.botaoPdf} type="button" onClick={baixarPdf}>Baixar PDF</button>
                    </div>
                    {logsFiltrados.length === 0 ? <p className={css.estado}>Nenhum registro encontrado com estes filtros.</p> : <div className={css.tabelaArea}><table>
                    <thead><tr><th>Nome</th><th>Ação</th><th>Data</th><th>Hora</th><th>Tabela</th><th>Campo</th><th>Antigo</th><th>Novo</th><th>Maquina</th><th>Acoes</th></tr></thead>
                    <tbody>{logsFiltrados.map(log => <tr key={log.id_log}>
                        <td>{log.nome_usuario || 'Sistema'}</td><td><span className={css.acao}>{log.acao}</span></td>
                        <td>{separarDataHora(log.data_hora).data}</td><td>{separarDataHora(log.data_hora).hora}</td>
                        <td>{log.tabela_afetada}{log.id_registro_afetado ? ` #${log.id_registro_afetado}` : ''}</td>
                        <td>{log.campo || '-'}</td><td>{log.valor_antigo || '-'}</td><td>{log.valor_novo || '-'}</td><td>{log.maquina || '-'}</td>
                        <td><button type="button" onClick={() => setDetalheAberto(log)}>Ver detalhes</button></td>
                    </tr>)}</tbody>
                    </table></div>}</>}
            </main>
        </div>
        {detalheAberto && <div className={css.fundoModal} onMouseDown={() => setDetalheAberto(null)}><section className={css.modal} onMouseDown={e => e.stopPropagation()}>
            <button type="button" className={css.fechar} aria-label="Fechar detalhes" onClick={() => setDetalheAberto(null)}>&times;</button><h2>Detalhes da Ação</h2>
            <div className={css.resumoAcao}>
                <div><span>Nome</span><strong>{detalheAberto.nome_usuario || 'Sistema'}</strong></div>
                <div><span>Ação</span><strong>{detalheAberto.acao || '-'}</strong></div>
                <div><span>Data</span><strong>{separarDataHora(detalheAberto.data_hora).data}</strong></div>
                <div><span>Hora</span><strong>{separarDataHora(detalheAberto.data_hora).hora}</strong></div>
                <div><span>Tabela</span><strong>{detalheAberto.tabela_afetada || '-'}</strong></div>
                <div><span>Campo alterado</span><strong>{detalheAberto.campo || '-'}</strong></div>
                <div><span>Valor antigo</span><strong>{valorLegivel(detalheAberto.valor_antigo, detalheAberto.campo)}</strong></div>
                <div><span>Valor novo</span><strong>{valorLegivel(detalheAberto.valor_novo, detalheAberto.campo)}</strong></div>
                <div><span>Maquina</span><strong>{detalheAberto.maquina || '-'}</strong></div>
            </div>
            <h3 className={css.subtitulo}>Informacoes adicionais</h3>
            <CamposDetalhes dados={dadosLegiveis(detalheAberto.detalhes)} />
        </section></div>}
        <Footer />
    </div>;
}
