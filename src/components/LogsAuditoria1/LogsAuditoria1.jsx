import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import MenuLateralAdvogado from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';
import css from './LogsAuditoria1.module.css';

function separarDataHora(data) {
    if (!data) return { data: '-', hora: '-' };
    const valor = new Date(data);
    return {
        data: valor.toLocaleDateString('pt-BR'),
        hora: valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
}

const CAMPOS_SIGILOSOS = ['senha', 'confirmar_senha', 'token', 'authorization', 'acess_token'];

const rotulos = {
    id_cliente: 'Cliente',
    id_advogado: 'Advogado',
    id_advogado_2: 'Advogado Parceiro',
    id_escritorio: 'Escritório',
    assunto: 'Assunto',
    cliente: 'Cliente',
    data: 'Data',
    horario: 'Horário',
    duracao: 'Duração',
    motivo: 'Motivo',
    status: 'Status',
    processo: 'Processo',
    parte_contraria: 'Parte Contrária',
    honorarios: 'Honorários',
    numero_processo: 'Número do Processo',
    tipo_processo: 'Tipo de Processo',
    area: 'Área',
    comarca: 'Comarca',
    vara: 'Vara',
    instancia: 'Instância',
    data_inicio: 'Data de Início',
    nome: 'Nome',
    email: 'E-mail',
    telefone: 'Telefone',
    valor: 'Valor',
    forma_pagamento: 'Forma de Pagamento',
    vencimento: 'Vencimento',
    metodo: 'Método HTTP',
    rota: 'Rota',
    dados: 'Dados Enviados',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    rg: 'RG',
    orgao_expedidor: 'Órgão Expedidor',
    nacionalidade: 'Nacionalidade',
    estado_civil: 'Estado Civil',
    data_nascimento: 'Data de Nascimento',
    sexo: 'Sexo',
    carteira_trabalho: 'Carteira de Trabalho',
    serie_carteira: 'Série da Carteira',
    pis: 'PIS',
    titulo_eleitor: 'Título de Eleitor',
    zona: 'Zona',
    secao: 'Seção',
    endereco: 'Endereço',
    numero: 'Número',
    complemento: 'Complemento',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    cep: 'CEP',
    descricao: 'Descrição',
    observacoes: 'Observações',
    observacao: 'Observação',
    categoria: 'Categoria',
    tipo: 'Tipo',
    prioridade: 'Prioridade',
    titulo: 'Título',
    conteudo: 'Conteúdo',
    mensagem: 'Mensagem'
};

const valoresCorrigidos = {
    'A VISTA': 'À vista',
    'AVISTA': 'À vista',
    'A_VISTA': 'À vista',
    'PIX': 'Pix',
    'CARTAO': 'Cartão',
    'CARTAO CREDITO': 'Cartão de Crédito',
    'CARTAO DEBITO': 'Cartão de Débito',
    'BOLETO': 'Boleto',
    'DINHEIRO': 'Dinheiro',
    'TRANSFERENCIA': 'Transferência',
    'TED': 'TED',
    'DOC': 'DOC',
    'CHEQUE': 'Cheque',
    'A PAGAR': 'A pagar',
    'A RECEBER': 'A receber',
    'PAGA': 'Paga',
    'PAGO': 'Pago',
    'PENDENTE': 'Pendente',
    'ATRASADA': 'Atrasada',
    'ATRASADO': 'Atrasado',
    'CANCELADA': 'Cancelada',
    'CANCELADO': 'Cancelado',
    'FISICA': 'Física',
    'JURIDICA': 'Jurídica',
    'MASCULINO': 'Masculino',
    'FEMININO': 'Feminino',
    'OUTRO': 'Outro',
    'SOLTEIRO': 'Solteiro',
    'CASADO': 'Casado',
    'DIVORCIADO': 'Divorciado',
    'VIUVO': 'Viúvo',
    'PROPRIETARIO': 'Proprietário',
    'ADVOGADO': 'Advogado',
    'SECRETARIO': 'Secretário',
    'ESTAGIARIO': 'Estagiário',
    'ATIVO': 'Ativo',
    'INATIVO': 'Inativo'
};

const titulosSecao = {
    dados: 'Dados Enviados',
    processo: 'Processo',
    parte_contraria: 'Parte Contrária',
    cliente: 'Cliente',
    agendamento: 'Agendamento',
    advogado: 'Advogado',
    honorarios: 'Honorários'
};

function tituloAmigavel(chave) {
    if (rotulos[chave]) return rotulos[chave];
    return String(chave)
        .replaceAll('_', ' ')
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

function corrigirValorTexto(texto) {
    if (!texto) return texto;
    const chave = String(texto).trim().toUpperCase();
    if (valoresCorrigidos[chave]) return valoresCorrigidos[chave];
    return texto;
}

function dadosLegiveis(detalhes) {
    try {
        const conteudo = JSON.parse(detalhes || '{}');
        return conteudo.dados && typeof conteudo.dados === 'object' ? conteudo.dados : conteudo;
    } catch {
        return { observacao: detalhes || 'Nenhuma informação adicional.' };
    }
}

function apenasDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function formatarCpf(valor) {
    const d = apenasDigitos(valor);
    if (d.length !== 11) return String(valor);
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatarCnpj(valor) {
    const d = apenasDigitos(valor);
    if (d.length !== 14) return String(valor);
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatarCep(valor) {
    const d = apenasDigitos(valor);
    if (d.length !== 8) return String(valor);
    return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function formatarTelefone(valor) {
    const d = apenasDigitos(valor);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return String(valor);
}

function formatarMoeda(valor) {
    const texto = String(valor).trim();
    if (texto.startsWith('R$')) return texto;
    const numero = typeof valor === 'number'
        ? valor
        : Number(texto.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numero)) return texto;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valor) {
    if (!valor) return '-';
    const texto = String(valor).trim();

    const isoMatch = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

    const brMatch = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) return texto;

    const d = apenasDigitos(texto);
    if (d.length === 8) {
        return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
    }

    return texto;
}

function ehCampoSigiloso(campo) {
    if (!campo) return false;
    return CAMPOS_SIGILOSOS.includes(String(campo).toLowerCase());
}

function valorLegivel(valor, campo = '') {
    if (valor === null || valor === undefined || valor === '') return '-';
    if (valor === true) return 'Sim';
    if (valor === false) return 'Não';

    if (ehCampoSigiloso(campo)) return '••••••••';

    const chave = String(campo).toLowerCase();
    const texto = String(valor);

    if (chave.includes('cpf')) return formatarCpf(texto);
    if (chave.includes('cnpj')) return formatarCnpj(texto);
    if (chave.includes('cep')) return formatarCep(texto);
    if (chave.includes('telefone') || chave.includes('celular')) return formatarTelefone(texto);
    if (chave.includes('valor') || chave.includes('honorario') || chave.includes('salario')) return formatarMoeda(texto);
    if (chave.includes('data')) return formatarData(texto);

    return corrigirValorTexto(texto);
}

function ehObjeto(valor) {
    return valor && typeof valor === 'object' && !Array.isArray(valor);
}

function SecaoDetalhes({ titulo, dados, aninhado = false }) {
    if (!ehObjeto(dados)) return null;

    const entradas = Object.entries(dados).filter(([, v]) => v !== null && v !== undefined && v !== '');

    if (entradas.length === 0) return null;

    return (
        <section className={aninhado ? css.subSecaoDetalhes : css.secaoDetalhes}>
            <h3 className={css.tituloSecao}>{titulo}:</h3>
            <div className={css.cardDetalhe}>
                {entradas.map(([chave, valor]) => (
                    ehObjeto(valor) ? (
                        <SecaoDetalhes
                            key={chave}
                            titulo={tituloAmigavel(chave)}
                            dados={valor}
                            aninhado
                        />
                    ) : (
                        <div className={css.linhaDetalhe} key={chave}>
                            <strong>{tituloAmigavel(chave)}:</strong>
                            <span>{valorLegivel(valor, chave)}</span>
                        </div>
                    )
                ))}
            </div>
        </section>
    );
}

function DetalhesDoLog({ dados }) {
    if (!ehObjeto(dados) || Object.keys(dados).length === 0) {
        return (
            <p className={css.semInformacoes}>
                Nenhuma informação adicional foi registrada nesta ação.
            </p>
        );
    }

    const secoesConhecidas = ['processo', 'parte_contraria', 'cliente', 'agendamento', 'advogado', 'honorarios'];
    const chaves = Object.keys(dados);

    const secoes = chaves.filter(chave => secoesConhecidas.includes(chave) && ehObjeto(dados[chave]));
    const camposSimples = chaves.filter(chave => !secoesConhecidas.includes(chave) || !ehObjeto(dados[chave]));

    const dadosSimples = {};
    camposSimples.forEach(chave => { dadosSimples[chave] = dados[chave]; });

    const semSecoes = secoes.length === 0;
    const semSimples = Object.keys(dadosSimples).length === 0;

    if (semSecoes && semSimples) {
        return (
            <p className={css.semInformacoes}>
                Nenhuma informação adicional foi registrada nesta ação.
            </p>
        );
    }

    return (
        <div className={css.detalhesWrapper}>
            {secoes.map(chave => (
                <SecaoDetalhes
                    key={chave}
                    titulo={titulosSecao[chave] || tituloAmigavel(chave)}
                    dados={dados[chave]}
                />
            ))}

            {!semSimples && (
                <SecaoDetalhes
                    titulo={semSecoes ? 'Informações' : 'Informações Gerais'}
                    dados={dadosSimples}
                />
            )}
        </div>
    );
}

function temAlteracaoAntesDepois(log) {
    if (!log) return false;
    if (log.acao !== 'EDITAR' && log.acao !== 'ATIVAR' && log.acao !== 'INATIVAR') return false;
    if (!log.campo || log.campo.toUpperCase() === 'REGISTRO') return false;
    if (ehCampoSigiloso(log.campo)) return false;
    if ((log.valor_antigo === null || log.valor_antigo === undefined || log.valor_antigo === '') &&
        (log.valor_novo === null || log.valor_novo === undefined || log.valor_novo === '')) {
        return false;
    }
    return true;
}

function BlocoAlteracao({ log }) {
    if (!temAlteracaoAntesDepois(log)) return null;

    const campoLegivel = tituloAmigavel(log.campo);

    return (
        <section className={css.secaoAlteracao}>
            <h3 className={css.tituloSecao}>Alteração em {campoLegivel}:</h3>
            <div className={css.alteracaoGrid}>
                <div className={`${css.alteracaoCard} ${css.alteracaoAntes}`}>
                    <span className={css.alteracaoLabel}>Antes</span>
                    <p className={css.alteracaoValor}>
                        {valorLegivel(log.valor_antigo, log.campo)}
                    </p>
                </div>
                <div className={`${css.alteracaoCard} ${css.alteracaoDepois}`}>
                    <span className={css.alteracaoLabel}>Depois</span>
                    <p className={css.alteracaoValor}>
                        {valorLegivel(log.valor_novo, log.campo)}
                    </p>
                </div>
            </div>
        </section>
    );
}

function classeAcao(acao) {
    const base = css.tagAcao;
    if (acao === 'CRIAR') return `${base} ${css.tagCriar}`;
    if (acao === 'EDITAR') return `${base} ${css.tagEditar}`;
    if (acao === 'EXCLUIR') return `${base} ${css.tagExcluir}`;
    if (acao === 'CONFIRMAR' || acao === 'CONCLUIR' || acao === 'ATIVAR') return `${base} ${css.tagSucesso}`;
    if (acao === 'RECUSAR' || acao === 'CANCELAR' || acao === 'INATIVAR') return `${base} ${css.tagAlerta}`;
    return base;
}

function extrairLista(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (resposta && Array.isArray(resposta.logs)) return resposta.logs;
    return [];
}

export default function LogsAuditoria1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://10.92.11.25:5000';

    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [detalheAberto, setDetalheAberto] = useState(null);
    const [menuColapsado, setMenuColapsado] = useState(false);

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [advogado, setAdvogado] = useState('');

    const [idEscritorio, setIdEscritorio] = useState(null);
    const [advogados, setAdvogados] = useState([]);

    const [paginaLogs, setPaginaLogs] = useState(1);
    const [totalPaginasLogs, setTotalPaginasLogs] = useState(1);
    const [porPaginaLogs] = useState(6);

    useEffect(() => {
        const aplicarEstadoMenu = evento => setMenuColapsado(evento?.detail?.colapsado ?? false);
        aplicarEstadoMenu({ detail: { colapsado: localStorage.getItem('menu_colapsado') === 'true' } });
        window.addEventListener('menu-lateral-toggle', aplicarEstadoMenu);
        return () => window.removeEventListener('menu-lateral-toggle', aplicarEstadoMenu);
    }, []);

    const carregarLogs = useCallback(async (idEsc, page, filtros) => {
        const token = localStorage.getItem('token');
        if (!token || !idEsc) return;

        const params = new URLSearchParams();
        params.set('limite', 500);
        params.set('page', page);
        params.set('por_pagina', porPaginaLogs);
        if (filtros.dataInicio) params.set('data_inicio', filtros.dataInicio);
        if (filtros.dataFim) params.set('data_fim', filtros.dataFim);
        if (filtros.advogado) params.set('advogado', filtros.advogado);

        const resposta = await fetch(
            `${API_URL}/escritorio/${idEsc}/logs?${params.toString()}`,
            {
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            }
        );
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.error || 'Não foi possível carregar o Log.');

        const lista = extrairLista(dados);

        setLogs(lista);
        setTotalPaginasLogs(dados?.total_paginas || 1);
        setPaginaLogs(dados?.pagina || 1);

        return lista;
    }, [API_URL, porPaginaLogs]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        async function carregar() {
            try {
                const headers = { 'X-Access-Token': token };

                const respostaEscritorio = await fetch(`${API_URL}/meu_escritorio`, {
                    credentials: 'include',
                    headers
                });
                const dadosEscritorio = await respostaEscritorio.json();

                if (!respostaEscritorio.ok || !dadosEscritorio.escritorio?.id) {
                    navigate('/dashboard_advogado');
                    return;
                }

                setIdEscritorio(dadosEscritorio.escritorio.id);

                const paramsTodos = new URLSearchParams();
                paramsTodos.set('limite', 500);
                paramsTodos.set('page', 1);
                paramsTodos.set('por_pagina', 500);

                const respostaTodos = await fetch(
                    `${API_URL}/escritorio/${dadosEscritorio.escritorio.id}/logs?${paramsTodos.toString()}`,
                    { credentials: 'include', headers }
                );
                const dadosTodos = await respostaTodos.json();
                const listaTodos = extrairLista(dadosTodos);

                const nomes = [...new Set(listaTodos.map(l => l.nome_usuario).filter(Boolean))]
                    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
                setAdvogados(nomes);

                await carregarLogs(dadosEscritorio.escritorio.id, 1, {
                    dataInicio: '',
                    dataFim: '',
                    advogado: ''
                });
            } catch (e) {
                setErro(e.message || 'Não foi possível carregar o Log.');
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [API_URL, navigate, carregarLogs]);

    function aplicarFiltros() {
        if (!idEscritorio) return;
        setPaginaLogs(1);
        carregarLogs(idEscritorio, 1, { dataInicio, dataFim, advogado });
    }

    function limparFiltros() {
        setDataInicio('');
        setDataFim('');
        setAdvogado('');
        if (!idEscritorio) return;
        setPaginaLogs(1);
        carregarLogs(idEscritorio, 1, { dataInicio: '', dataFim: '', advogado: '' });
    }

    function irParaPagina(novaPagina) {
        if (!idEscritorio) return;
        if (novaPagina < 1 || novaPagina > totalPaginasLogs) return;
        carregarLogs(idEscritorio, novaPagina, { dataInicio, dataFim, advogado });
    }

    async function baixarPdf() {
        const token = localStorage.getItem('token');
        if (!token || !idEscritorio) return;
        const parametros = new URLSearchParams();
        if (dataInicio) parametros.set('data_inicio', dataInicio);
        if (dataFim) parametros.set('data_fim', dataFim);
        if (advogado) parametros.set('advogado', advogado);

        try {
            const resposta = await fetch(
                `${API_URL}/escritorio/${idEscritorio}/logs/pdf?${parametros}`,
                {
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                }
            );
            if (!resposta.ok) throw new Error('Não foi possível gerar o PDF.');
            const arquivo = URL.createObjectURL(await resposta.blob());
            const link = document.createElement('a');
            link.href = arquivo;
            link.download = 'log-escritorio.pdf';
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
                            <h1 className={css.tituloPagina}>Log de Auditoria</h1>
                            <p className={css.subtituloPagina}>
                                Acompanhe todas as ações realizadas pelos advogados do escritório.
                            </p>
                        </div>
                    </div>

                    {carregando && <p className={css.estado}>Carregando log...</p>}
                    {erro && <p className={`${css.estado} ${css.erro}`}>{erro}</p>}

                    {!carregando && !erro && (
                        <>
                            <div className={css.areaFiltros}>
                                <label>
                                    Data inicial
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={e => setDataInicio(e.target.value)}
                                    />
                                </label>
                                <label>
                                    Data final
                                    <input
                                        type="date"
                                        min={dataInicio || undefined}
                                        value={dataFim}
                                        onChange={e => setDataFim(e.target.value)}
                                    />
                                </label>
                                <label>
                                    Advogado
                                    <select value={advogado} onChange={e => setAdvogado(e.target.value)}>
                                        <option value="">Todos os advogados</option>
                                        {advogados.map(nome => (
                                            <option key={nome} value={nome}>{nome}</option>
                                        ))}
                                    </select>
                                </label>
                                <button className={css.botaoFiltrar} type="button" onClick={aplicarFiltros}>
                                    Filtrar
                                </button>
                                <button className={css.botaoLimpar} type="button" onClick={limparFiltros}>
                                    Limpar filtros
                                </button>
                                <button className={css.botaoPdf} type="button" onClick={baixarPdf}>
                                    Baixar PDF
                                </button>
                            </div>

                            {logs.length === 0 ? (
                                <p className={css.estado}>Nenhum registro encontrado com estes filtros.</p>
                            ) : (
                                <>
                                    <div className={css.cardsArea}>
                                        {logs.map(log => {
                                            const { data, hora } = separarDataHora(log.data_hora);
                                            const mostrarAlteracao = temAlteracaoAntesDepois(log);
                                            return (
                                                <article className={css.card} key={log.id_log}>
                                                    <header className={css.cardHeader}>
                                                        <div className={css.cardUsuario}>
                                                            <strong>{log.nome_usuario || 'Sistema'}</strong>
                                                            {log.cargo && (
                                                                <span className={css.cargo}>{log.cargo}</span>
                                                            )}
                                                        </div>
                                                        <span className={classeAcao(log.acao)}>{log.acao}</span>
                                                    </header>

                                                    <p className={css.cardResumo}>
                                                        {log.descricao_humana || 'Ação registrada no sistema.'}
                                                    </p>

                                                    {mostrarAlteracao && (
                                                        <div className={css.cardAlteracao}>
                                                            <div className={css.cardAlteracaoLinha}>
                                                                <span className={css.cardAlteracaoLabel}>Antes</span>
                                                                <span className={css.cardAlteracaoAntes}>
                                                                    {valorLegivel(log.valor_antigo, log.campo)}
                                                                </span>
                                                            </div>
                                                            <div className={css.cardAlteracaoLinha}>
                                                                <span className={css.cardAlteracaoLabel}>Depois</span>
                                                                <span className={css.cardAlteracaoDepois}>
                                                                    {valorLegivel(log.valor_novo, log.campo)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={css.cardMeta}>
                                                        <div>
                                                            <span>Data</span>
                                                            <strong>{data}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Hora</span>
                                                            <strong>{hora}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Ação</span>
                                                            <strong>{log.acao || '-'}</strong>
                                                        </div>
                                                    </div>

                                                    <footer className={css.cardFooter}>
                                                        <button
                                                            type="button"
                                                            className={css.botaoDetalhes}
                                                            onClick={() => setDetalheAberto(log)}
                                                        >
                                                            Ver detalhes
                                                        </button>
                                                    </footer>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    <div className={css.paginacao}>
                                        <button
                                            type="button"
                                            className={css.botaoPagina}
                                            onClick={() => irParaPagina(paginaLogs - 1)}
                                            disabled={paginaLogs <= 1}
                                        >
                                            Anterior
                                        </button>

                                        <span className={css.infoPagina}>
                                            Página {paginaLogs} de {totalPaginasLogs}
                                        </span>

                                        <button
                                            type="button"
                                            className={css.botaoPagina}
                                            onClick={() => irParaPagina(paginaLogs + 1)}
                                            disabled={paginaLogs >= totalPaginasLogs}
                                        >
                                            Próxima
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>

            {detalheAberto && (
                <div className={css.fundoModal} onMouseDown={() => setDetalheAberto(null)}>
                    <section className={css.modal} onMouseDown={e => e.stopPropagation()}>
                        <button
                            type="button"
                            className={css.fechar}
                            aria-label="Fechar detalhes"
                            onClick={() => setDetalheAberto(null)}
                        >
                            &times;
                        </button>

                        <h2>Detalhes da Ação</h2>

                        <p className={css.resumoTexto}>
                            {detalheAberto.descricao_humana || 'Ação registrada no sistema.'}
                        </p>

                        <div className={css.resumoAcao}>
                            <div><span>Nome</span><strong>{detalheAberto.nome_usuario || 'Sistema'}</strong></div>
                            <div><span>Cargo</span><strong>{detalheAberto.cargo || '-'}</strong></div>
                            <div><span>Data</span><strong>{separarDataHora(detalheAberto.data_hora).data}</strong></div>
                            <div><span>Hora</span><strong>{separarDataHora(detalheAberto.data_hora).hora}</strong></div>
                            <div><span>Origem</span><strong>{detalheAberto.maquina || '-'}</strong></div>
                        </div>

                        <BlocoAlteracao log={detalheAberto} />

                        <h3 className={css.subtitulo}>Informações Adicionais</h3>
                        <DetalhesDoLog dados={dadosLegiveis(detalheAberto.detalhes)} />
                    </section>
                </div>
            )}

            <Footer />
        </div>
    );
}