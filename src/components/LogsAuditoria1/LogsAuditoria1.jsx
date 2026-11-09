import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import MenuLateralAdvogado from '../MenuLateralAdvogado/MenuLateralAdvogado.jsx';
import css from './LogsAuditoria1.module.css';

function normalizarTabela(tabela) {
    return String(tabela || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');
}

function separarDataHora(data) {
    if (!data) return { data: '-', hora: '-' };

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
        return { data: '-', hora: '-' };
    }

    return {
        data: valor.toLocaleDateString('pt-BR'),
        hora: valor.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
}

function classeAcao(acao, tabela) {
    const base = css.tagAcao;

    if (
        normalizarTabela(tabela) === 'NOTIFICACOES' &&
        acao === 'INSERT'
    ) {
        return `${base} ${css.tagAlerta}`;
    }

    if (['INSERT', 'CRIAR'].includes(acao)) {
        return `${base} ${css.tagCriar}`;
    }

    if (['UPDATE', 'EDITAR'].includes(acao)) {
        return `${base} ${css.tagEditar}`;
    }

    if (['DELETE', 'EXCLUIR'].includes(acao)) {
        return `${base} ${css.tagExcluir}`;
    }

    return base;
}

function traduzirAcao(acao, tabelaAfetada) {
    const tabela = normalizarTabela(tabelaAfetada);

    const especiais = {
        MENSAGENS: { INSERT: 'enviou', UPDATE: 'editou', DELETE: 'excluiu' },
        CONVERSAS: { INSERT: 'iniciou', UPDATE: 'atualizou', DELETE: 'excluiu' },
        ESCRITORIOS: { INSERT: 'cadastrou', UPDATE: 'atualizou', DELETE: 'excluiu' },
        ATUALIZACOES: { INSERT: 'registrou', UPDATE: 'editou', DELETE: 'excluiu' },
        AGENDAMENTOS: { INSERT: 'marcou', UPDATE: 'atualizou', DELETE: 'excluiu' },
        ADVOGADO_ESCRITORIO: { INSERT: 'vinculou', UPDATE: 'alterou o vínculo de', DELETE: 'removeu o vínculo de' },
        GOOGLE_CALENDAR: { INSERT: 'conectou', UPDATE: 'atualizou', DELETE: 'desconectou' }
    };

    if (especiais[tabela]?.[acao]) {
        return especiais[tabela][acao];
    }

    if (['INSERT', 'CRIAR'].includes(acao)) return 'cadastrou';
    if (['UPDATE', 'EDITAR'].includes(acao)) return 'atualizou';
    if (['DELETE', 'EXCLUIR'].includes(acao)) return 'excluiu';

    return 'modificou';
}

function rotuloAcao(acao, tabelaAfetada) {
    const tabela = normalizarTabela(tabelaAfetada);

    const especiais = {
        MENSAGENS: { INSERT: 'Mensagem Enviada', UPDATE: 'Mensagem Editada', DELETE: 'Mensagem Excluída' },
        CONVERSAS: { INSERT: 'Nova Conversa', UPDATE: 'Conversa Atualizada', DELETE: 'Conversa Excluída' },
        ESCRITORIOS: { INSERT: 'Escritório Cadastrado', UPDATE: 'Escritório Atualizado', DELETE: 'Escritório Excluído' },
        ATUALIZACOES: { INSERT: 'Atualização Registrada', UPDATE: 'Atualização Editada', DELETE: 'Atualização Excluída' },
        AGENDAMENTOS: { INSERT: 'Agendamento Criado', UPDATE: 'Agendamento Atualizado', DELETE: 'Agendamento Excluído' },
        ADVOGADO_ESCRITORIO: { INSERT: 'Advogado Vinculado', UPDATE: 'Vínculo Atualizado', DELETE: 'Vínculo Removido' },
        LANCAMENTOS_FINANCEIROS: { INSERT: 'Novo Lançamento', UPDATE: 'Lançamento Atualizado', DELETE: 'Lançamento Excluído' },
        GOOGLE_CALENDAR: { INSERT: 'Google Conectado', UPDATE: 'Integração Atualizada', DELETE: 'Google Desconectado' }
    };

    if (especiais[tabela]?.[acao]) {
        return especiais[tabela][acao];
    }

    if (['INSERT', 'CRIAR'].includes(acao)) return 'Novo Cadastro';
    if (['DELETE', 'EXCLUIR'].includes(acao)) return 'Exclusão';
    if (acao === 'LIDO') return 'Lido';
    if (acao === 'NAO_LIDO') return 'Não Lida';

    return 'Atualização';
}

function rotuloObjeto(tabelaAfetada) {
    const tabela = normalizarTabela(tabelaAfetada);

    const objetos = {
        MENSAGENS: 'a mensagem',
        CONVERSAS: 'a conversa',
        ESCRITORIOS: 'o escritório',
        ATUALIZACOES: 'a atualização do processo',
        AGENDAMENTOS: 'o agendamento',
        ADVOGADO_ESCRITORIO: 'o advogado',
        LANCAMENTOS_FINANCEIROS: 'o lançamento financeiro',
        GOOGLE_CALENDAR: 'a integração do Google Agenda',
        NOTIFICACOES: 'a notificação',
        DOCUMENTOS_GERADOS: 'o documento',
        MODELOS_DOCUMENTOS: 'o modelo',
        PARTE_CONTRARIA: 'a parte contrária',
        PROCESSOS: 'o processo',
        PAGAMENTOS: 'o pagamento',
        PARCELAS: 'a parcela',
        PAGAMENTO_EXITO: 'o honorário de êxito',
        PARCELAS_EXITO: 'a parcela de êxito'
    };

    return objetos[tabela] || 'o cadastro de';
}

function nomeRegistroExibicao(log, resumo = false) {
    const tabela = normalizarTabela(log.tabela_afetada);
    const nome = String(log.nome_registro_afetado || '').trim();

    if (tabela === 'MENSAGENS') {
        const conversa = nome.match(/\(\s*conversa com\s+(.+?)\s*\)/i);
        if (conversa) {
            return resumo ? `da conversa com ${conversa[1].trim()}` : `Conversa com ${conversa[1].trim()}`;
        }
        return resumo ? '' : 'Mensagem';
    }

    if (tabela === 'CONVERSAS') {
        const participantes = nome.match(/\((.+?)\)/);
        if (participantes) {
            const pessoas = participantes[1].replace(/\s+x\s+/i, ' e ').trim();
            return resumo ? `entre ${pessoas}` : `Conversa entre ${pessoas}`;
        }
        return resumo ? '' : 'Conversa';
    }

    if (tabela === 'LANCAMENTOS_FINANCEIROS') {
        const mudanca = (log.mudancas || []).find(
            item => String(item.campo || '').toUpperCase() === 'DESCRICAO'
        );

        const descricao = String(
            mudanca?.depois && mudanca.depois !== '(Vazio)' ? mudanca.depois : mudanca?.antes || ''
        ).trim();

        const identificacao = (nome && nome !== 'Lançamento financeiro' ? nome.replace(/^lançamento financeiro\s*:\s*/i, '') : descricao);

        return identificacao ? (resumo ? `“${identificacao}”` : identificacao) : (resumo ? '' : 'Lançamento financeiro');
    }

    if (tabela === 'GOOGLE_CALENDAR') {
        return resumo ? '' : 'Google Agenda';
    }

    if (tabela === 'ATUALIZACOES' || tabela === 'AGENDAMENTOS') {
        return nome ? (resumo ? `“${nome}”` : nome) : (tabela === 'ATUALIZACOES' ? 'Atualização de processo' : 'Agendamento');
    }

    if (tabela === 'ESCRITORIOS') {
        return nome || 'Escritório';
    }

    if (tabela === 'ADVOGADO_ESCRITORIO') {
        return nome || 'Advogado';
    }

    return nome || 'Registro não identificado';
}

function rotuloRegistroAfetado(tabelaAfetada) {
    const tabela = normalizarTabela(tabelaAfetada);

    const rotulos = {
        MENSAGENS: 'Mensagem afetada',
        CONVERSAS: 'Conversa afetada',
        ESCRITORIOS: 'Escritório afetado',
        ATUALIZACOES: 'Atualização afetada',
        AGENDAMENTOS: 'Agendamento afetado',
        ADVOGADO_ESCRITORIO: 'Advogado vinculado',
        LANCAMENTOS_FINANCEIROS: 'Lançamento financeiro',
        GOOGLE_CALENDAR: 'Integração afetada'
    };

    return rotulos[tabela] || 'Quem foi alterado';
}

function formatarCampo(campo, tabelaAfetada) {
    const tabela = normalizarTabela(tabelaAfetada);
    const chave = String(campo || '').trim().toUpperCase();

    const especificos = {
        ESCRITORIOS: {
            RAZAO_SOCIAL: 'Razão social', NOME_FANTASIA: 'Nome fantasia', REGISTRO_OAB: 'Registro OAB', UF_OAB: 'UF da OAB',
            TELEFONE: 'Telefone', EMAIL: 'E-mail', CNPJ: 'CNPJ', CEP: 'CEP', LOGRADOURO: 'Endereço', NUMERO: 'Número',
            COMPLEMENTO: 'Complemento', BAIRRO: 'Bairro', CIDADE: 'Cidade', ESTADO: 'Estado', CREDENCIAL: 'Senha do escritório'
        },
        ATUALIZACOES: { TITULO: 'Título da atualização', DESCRICAO: 'Descrição', DATA: 'Data da atualização', PROCESSO_CONCLUIDO: 'Processo concluído' },
        AGENDAMENTOS: {
            CLIENTE: 'Cliente', ASSUNTO: 'Assunto', DATA: 'Data do agendamento', HORARIO: 'Horário', DURACAO: 'Duração em minutos',
            STATUS: 'Situação do agendamento', MOTIVO: 'Motivo', CONFIRMADO_ADVOGADO_1: 'Confirmação do primeiro advogado',
            CONFIRMADO_ADVOGADO_2: 'Confirmação do segundo advogado', RECUSADO_ADVOGADO_1: 'Recusa do primeiro advogado',
            RECUSADO_ADVOGADO_2: 'Recusa do segundo advogado'
        },
        ADVOGADO_ESCRITORIO: { STATUS: 'Cargo no escritório', ATIVO: 'Vínculo ativo' },
        LANCAMENTOS_FINANCEIROS: { TIPO: 'Tipo de lançamento', DESCRICAO: 'Descrição', VALOR: 'Valor', DATA: 'Data do lançamento', STATUS: 'Situação do lançamento', FORMA_PAGAMENTO: 'Forma de pagamento', ATIVO: 'Lançamento ativo' },
        GOOGLE_CALENDAR: { GOOGLE_EMAIL: 'Conta Google', CONTA_GOOGLE: 'Conta Google', CONEXAO: 'Conexão com Google', CREDENCIAL: 'Credencial de acesso', ATIVO: 'Integração ativa' }
    };

    if (especificos[tabela]?.[chave]) {
        return especificos[tabela][chave];
    }

    const gerais = {
        TIPO: 'Tipo de pessoa', EMAIL: 'E-mail', CPF: 'CPF', CNPJ: 'CNPJ', TELEFONE: 'Telefone', NOME: 'Nome', RG: 'RG',
        CEP: 'CEP', LOGRADOURO: 'Endereço', NUMERO: 'Número', BAIRRO: 'Bairro', CIDADE: 'Cidade', ESTADO: 'Estado',
        ATIVO: 'Status', NOME_COMPLETO: 'Nome completo', NUM_PROCESSO: 'Número do processo', TIPO_PROCESSO: 'Tipo de processo',
        AREA: 'Área', COMARCA: 'Comarca', VARA: 'Vara', INSTANCIA: 'Instância', DATA_INICIO: 'Data de início', STATUS: 'Status',
        LIDA: 'Status de leitura', DESCRICAO: 'Descrição', NOME_ARQUIVO: 'Nome do arquivo', DATA_ATUALIZACAO: 'Data de atualização',
        PROFISSAO: 'Profissão', SEXO: 'Sexo', ORGAO_EXPEDIDOR: 'Órgão expedidor', NACIONALIDADE: 'Nacionalidade',
        ESTADO_CIVIL: 'Estado civil', DATA_CADASTRO: 'Data de cadastro', MENSAGEM: 'Mensagem', ULTIMA_MENSAGEM: 'Última mensagem'
    };

    return gerais[chave] || String(campo || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
}

function formatarValor(campo, valor, tabelaAfetada) {
    const chave = String(campo || '').trim().toUpperCase();
    const tabela = normalizarTabela(tabelaAfetada);

    if (valor === null || valor === undefined || valor === '' || valor === '(Vazio)' || String(valor).trim().toUpperCase() === 'NULL') {
        return 'Não existia';
    }

    const texto = String(valor).trim();

    if (tabela === 'ESCRITORIOS' && chave === 'CREDENCIAL') return texto;
    if (tabela === 'ATUALIZACOES' && chave === 'PROCESSO_CONCLUIDO') return ['1', 'TRUE', 'SIM'].includes(texto.toUpperCase()) ? 'Sim' : 'Não';

    if (tabela === 'AGENDAMENTOS') {
        if (/^(CONFIRMADO|RECUSADO)_ADVOGADO_[12]$/.test(chave)) return ['1', 'TRUE', 'SIM'].includes(texto.toUpperCase()) ? 'Sim' : 'Não';
        if (chave === 'STATUS') {
            const status = { a_confirmar: 'A confirmar', confirmado: 'Confirmado', recusado: 'Recusado', cancelado: 'Cancelado' };
            return status[texto.toLowerCase()] || texto.replace(/_/g, ' ');
        }
    }

    if (tabela === 'GOOGLE_CALENDAR') {
        if (chave === 'ATIVO') return ['1', 'TRUE', 'SIM'].includes(texto.toUpperCase()) ? 'Conectado' : 'Desconectado';
        if (chave === 'CREDENCIAL') return texto;
    }

    if (tabela === 'LANCAMENTOS_FINANCEIROS') {
        if (chave === 'TIPO') {
            if (texto.toLowerCase() === 'receita') return 'Receita';
            if (texto.toLowerCase() === 'despesa') return 'Despesa';
        }
        if (chave === 'STATUS') {
            const status = { recebida: 'Recebida', recebido: 'Recebido', pago: 'Pago', paga: 'Paga', a_pagar: 'A pagar', a_receber: 'A receber', pendente: 'Pendente', atrasado: 'Atrasado', atrasada: 'Atrasada' };
            return status[texto.toLowerCase()] || texto;
        }
    }

    if (chave === 'VALOR' || chave.startsWith('VALOR_') || chave.includes('SALARIO')) {
        let numero = texto.replace(/R\$\s?/g, '').replace(/\s/g, '');
        if (numero.includes(',') && numero.includes('.')) {
            numero = numero.lastIndexOf(',') > numero.lastIndexOf('.') ? numero.replace(/\./g, '').replace(',', '.') : numero.replace(/,/g, '');
        } else if (numero.includes(',')) {
            numero = numero.replace(',', '.');
        } else if (/^\d{1,3}(\.\d{3})+$/.test(numero)) {
            numero = numero.replace(/\./g, '');
        }
        const resultado = Number(numero);
        if (Number.isFinite(resultado)) {
            return resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    if (chave === 'DATA' || chave.startsWith('DATA_') || chave.includes('NASCIMENTO')) {
        const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }

    if (chave === 'ATIVO') return ['1', 'TRUE', 'SIM'].includes(texto.toUpperCase()) ? 'Ativo' : 'Inativo';
    if (chave === 'LIDA') return ['1', 'TRUE'].includes(texto.toUpperCase()) ? 'Lido' : 'Não lido';

    if (chave === 'TIPO' && tabela === 'USUARIOS') {
        const tipos = { '0': 'Advogado', '1': 'Escritório', '2': 'Cliente (Pessoa Física)', '3': 'Cliente (Pessoa Jurídica)' };
        return tipos[texto] || texto;
    }

    if (chave === 'MENSAGEM' || chave === 'ULTIMA_MENSAGEM') {
        return texto.length > 280 ? texto.slice(0, 280).trimEnd() + '…' : texto;
    }

    const traducoes = {
        PROPRIETARIO: 'Proprietário', PARCEIRO: 'Parceiro', ASSOCIADO: 'Associado', FISICA: 'Pessoa Física', JURIDICA: 'Pessoa Jurídica',
        PENDENTE: 'Pendente', PAGA: 'Paga', PAGO: 'Pago', RECEBIDO: 'Recebido', A_PAGAR: 'A pagar', A_RECEBER: 'A receber'
    };

    return traducoes[texto.toUpperCase()] || texto;
}

function mudancasVisiveis(log) {
    const protegidos = new Set(['SENHA', 'REFRESH_TOKEN', 'ACCESS_TOKEN', 'CLIENT_SECRET', 'ID_TOKEN', 'TOKEN', 'GOOGLE_EVENT_ID']);

    return (Array.isArray(log.mudancas) ? log.mudancas : []).filter(mudanca => {
        const campo = String(mudanca.campo || '').trim().toUpperCase();
        return !protegidos.has(campo) && !campo.startsWith('ID_');
    });
}

function resumoAcao(log) {
    const tabela = normalizarTabela(log.tabela_afetada);
    const nome = nomeRegistroExibicao(log, true);
    const autor = log.nome_usuario || 'Usuário';
    const verbo = traduzirAcao(log.acao, log.tabela_afetada);

    if (tabela === 'ADVOGADO_ESCRITORIO' && log.acao !== 'INSERT') {
        return `${autor} ${verbo} ${nomeRegistroExibicao(log)}.`;
    }

    return `${autor} ${verbo} ${rotuloObjeto(log.tabela_afetada)}${nome ? ` ${nome}` : ''}.`;
}

export default function LogsAuditoria1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || 'http://10.92.11.19:5000';

    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [detalheAberto, setDetalheAberto] = useState(null);
    const [menuColapsado, setMenuColapsado] = useState(false);
    const [idEscritorio, setIdEscritorio] = useState(null);
    const [escritorios, setEscritorios] = useState([]);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [inicioAplicado, setInicioAplicado] = useState('');
    const [fimAplicado, setFimAplicado] = useState('');

    useEffect(() => {
        function aplicarEstadoMenu(evento) {
            setMenuColapsado(evento?.detail?.colapsado ?? false);
        }

        aplicarEstadoMenu({
            detail: {
                colapsado: localStorage.getItem('menu_colapsado') === 'true'
            }
        });

        window.addEventListener('menu-lateral-toggle', aplicarEstadoMenu);

        return () => {
            window.removeEventListener('menu-lateral-toggle', aplicarEstadoMenu);
        };
    }, []);

    const carregarLogs = useCallback(async idEsc => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        setCarregando(true);
        setErro('');

        try {
            const resposta = await fetch(
                `${API_URL}/escritorio/${idEsc}/logs`,
                {
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.error || 'Não foi possível carregar o histórico.'
                );
            }

            setLogs(Array.isArray(dados.logs) ? dados.logs : []);
        } catch (error) {
            setErro(
                error.message || 'Erro ao consultar os registros.'
            );
            setLogs([]);
        } finally {
            setCarregando(false);
        }
    }, [API_URL, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        async function iniciar() {
            setCarregando(true);
            setErro('');

            try {
                const resposta = await fetch(
                    `${API_URL}/meus_escritorios`,
                    {
                        credentials: 'include',
                        headers: {
                            'X-Access-Token': token
                        }
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.error || 'Erro ao consultar escritórios.'
                    );
                }

                const lista = (dados.escritorios || []).filter(item =>
                    (item.ativo === 1 || item.ativo === true) &&
                    String(item.status || '').toUpperCase() === 'PROPRIETARIO'
                );

                if (!lista.length) {
                    throw new Error(
                        'Nenhum escritório próprio ativo encontrado.'
                    );
                }

                setEscritorios(lista);

                const escritorio = lista[0].id;

                setIdEscritorio(escritorio);

                await carregarLogs(escritorio);
            } catch (error) {
                setErro(
                    error.message || 'Erro ao carregar escritórios.'
                );
                setCarregando(false);
            }
        }

        iniciar();
    }, [API_URL, carregarLogs, navigate]);

    const logsFiltrados = useMemo(() => {
        return logs.filter(log => {
            const data = String(log.data_hora || '').slice(0, 10);

            if (inicioAplicado && (!data || data < inicioAplicado)) {
                return false;
            }

            if (fimAplicado && (!data || data > fimAplicado)) {
                return false;
            }

            return true;
        });
    }, [logs, inicioAplicado, fimAplicado]);

    const alteracoesDetalhes = useMemo(
        () => detalheAberto ? mudancasVisiveis(detalheAberto) : [],
        [detalheAberto]
    );

    function aplicarFiltros() {
        if (dataInicio && dataFim && dataInicio > dataFim) {
            setErro('A data inicial não pode ser maior que a data final.');
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

    async function baixarPdf() {
        const token = localStorage.getItem('token');

        if (!token || !idEscritorio) return;

        if (dataInicio && dataFim && dataInicio > dataFim) {
            setErro('A data inicial não pode ser maior que a data final.');
            return;
        }

        try {
            const resposta = await fetch(
                `${API_URL}/escritorio/${idEscritorio}/logs/pdf`,
                {
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    }
                }
            );

            if (!resposta.ok) {
                let dados = {};
                try {
                    dados = await resposta.json();
                } catch {
                    dados = {};
                }
                throw new Error(dados.error || 'Não foi possível gerar o PDF.');
            }

            const url = URL.createObjectURL(
                await resposta.blob()
            );

            const link = document.createElement('a');

            link.href = url;
            link.download = 'historico-alteracoes.pdf';
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            setErro(error.message);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div
                    className={`${css.menuLateralContainer} ${
                        menuColapsado ? css.menuLateralColapsado : ''
                    }`}
                >
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <main className={css.conteudoPrincipal}>
                    <div className={css.topoPagina}>
                        <div>
                            <h1 className={css.tituloPagina}>
                                Histórico de Alterações
                            </h1>

                            <p className={css.subtituloPagina}>
                                Acompanhe as alterações realizadas nos registros do escritório.
                            </p>
                        </div>
                    </div>

                    {erro && (
                        <div
                            className={`${css.mensagemFiltroContainer} ${css.mensagemFiltroErro}`}
                            role="alert"
                        >
                            {erro}
                        </div>
                    )}

                    <div className={css.areaFiltros}>
                        {escritorios.length > 1 && (
                            <label>
                                Escritório

                                <select
                                    value={idEscritorio || ''}
                                    onChange={e => {
                                        const novoId = Number(e.target.value);

                                        setIdEscritorio(novoId);
                                        carregarLogs(novoId);
                                    }}
                                >
                                    {escritorios.map(item => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.nome_fantasia ||
                                                item.razao_social ||
                                                `Escritório ${item.id}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <label>
                            Data inicial

                            <input
                                type="date"
                                value={dataInicio}
                                onChange={e =>
                                    setDataInicio(e.target.value)
                                }
                            />
                        </label>

                        <label>
                            Data final

                            <input
                                type="date"
                                min={dataInicio || undefined}
                                value={dataFim}
                                onChange={e =>
                                    setDataFim(e.target.value)
                                }
                            />
                        </label>

                        <button
                            className={css.botaoFiltrar}
                            type="button"
                            onClick={aplicarFiltros}
                        >
                            Filtrar
                        </button>

                        <button
                            className={css.botaoLimpar}
                            type="button"
                            onClick={limparFiltros}
                        >
                            Limpar filtros
                        </button>

                        <button
                            className={css.botaoFiltrar}
                            type="button"
                            disabled={carregando || !idEscritorio}
                            onClick={() => carregarLogs(idEscritorio)}
                        >
                            Atualizar
                        </button>

                        <button
                            className={css.botaoLimpar}
                            type="button"
                            disabled={carregando || !idEscritorio}
                            onClick={baixarPdf}
                        >
                            Baixar PDF
                        </button>
                    </div>

                    {carregando && (
                        <p className={css.estado}>
                            Carregando histórico...
                        </p>
                    )}

                    {!carregando &&
                        !erro &&
                        logsFiltrados.length === 0 && (
                            <p className={css.estado}>
                                Nenhuma alteração encontrada para este período.
                            </p>
                        )}

                    {!carregando &&
                        !erro &&
                        logsFiltrados.length > 0 && (
                            <div className={css.cardsArea}>
                                {logsFiltrados.map(log => {
                                    const { data, hora } = separarDataHora(
                                        log.data_hora
                                    );

                                    return (
                                        <article
                                            key={log.id_log}
                                            className={css.card}
                                        >
                                            {log.alerta_banco && (
                                                <div
                                                    style={{
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        marginBottom: '8px'
                                                    }}
                                                >
                                                    ALTERAÇÃO DIRETA NO BANCO DE DADOS
                                                </div>
                                            )}

                                            <header className={css.cardHeader}>
                                                <div className={css.cardUsuario}>
                                                    <strong
                                                        style={{
                                                            color: log.alerta_banco
                                                                ? '#991b1b'
                                                                : '#0f172a'
                                                        }}
                                                    >
                                                        {log.nome_usuario}
                                                    </strong>

                                                    <span className={css.cargo}>
                                                        {log.cargo || log.maquina}
                                                    </span>
                                                </div>

                                                <span
                                                    className={classeAcao(
                                                        log.acao,
                                                        log.tabela_afetada
                                                    )}
                                                >
                                                    {rotuloAcao(
                                                        log.acao,
                                                        log.tabela_afetada
                                                    )}
                                                </span>
                                            </header>

                                            <p
                                                className={css.cardResumo}
                                                style={{
                                                    fontSize: '0.95rem',
                                                    color: '#334155',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                {resumoAcao(log)}
                                            </p>

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
                                                    <span>Meio</span>
                                                    <strong>
                                                        {log.alerta_banco
                                                            ? 'Banco de Dados'
                                                            : 'Sistema'}
                                                    </strong>
                                                </div>
                                            </div>

                                            <footer className={css.cardFooter}>
                                                <button
                                                    type="button"
                                                    className={css.botaoDetalhes}
                                                    onClick={() =>
                                                        setDetalheAberto(log)
                                                    }
                                                >
                                                    Ver detalhes
                                                </button>
                                            </footer>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                </main>
            </div>

            {detalheAberto && (
                <div
                    className={css.fundoModal}
                    onMouseDown={() => setDetalheAberto(null)}
                >
                    <section
                        className={css.modal}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={css.fechar}
                            onClick={() => setDetalheAberto(null)}
                        >
                            &times;
                        </button>

                        <h2>Detalhes da Ação</h2>

                        {detalheAberto.alerta_banco && (
                            <div
                                style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    marginBottom: '15px'
                                }}
                            >
                                Esta alteração não foi feita pelo sistema.
                                Alguém modificou o banco de dados diretamente.
                            </div>
                        )}

                        <p
                            className={css.resumoTexto}
                            style={{
                                marginBottom: '1.5rem',
                                fontSize: '1rem',
                                color: '#334155'
                            }}
                        >
                            {resumoAcao(detalheAberto)}
                        </p>

                        <div className={css.resumoAcao}>
                            <div>
                                <span>Quem realizou</span>

                                <strong
                                    style={{
                                        color: detalheAberto.alerta_banco
                                            ? '#991b1b'
                                            : '#0f172a'
                                    }}
                                >
                                    {detalheAberto.nome_usuario}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    {rotuloRegistroAfetado(
                                        detalheAberto.tabela_afetada
                                    )}
                                </span>

                                <strong>
                                    {nomeRegistroExibicao(detalheAberto)}
                                </strong>
                            </div>

                            <div>
                                <span>Origem</span>

                                <strong>
                                    {detalheAberto.alerta_banco
                                        ? 'Banco de dados'
                                        : 'Sistema'}
                                </strong>
                            </div>

                            <div>
                                <span>Data e Hora</span>

                                <strong>
                                    {separarDataHora(
                                        detalheAberto.data_hora
                                    ).data}{' '}
                                    às{' '}
                                    {separarDataHora(
                                        detalheAberto.data_hora
                                    ).hora}
                                </strong>
                            </div>

                            <div>
                                <span>Origem / IP</span>

                                <strong>
                                    {detalheAberto.ip_origem || '-'}{' '}
                                    ({detalheAberto.maquina || '-'})
                                </strong>
                            </div>
                        </div>

                        {alteracoesDetalhes.length > 0 ? (
                            <div className={css.secaoAlteracao}>
                                <h3 className={css.tituloSecao}>
                                    O que mudou?
                                </h3>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.2rem',
                                        marginTop: '10px'
                                    }}
                                >
                                    {alteracoesDetalhes.map(
                                        (mudanca, index) => (
                                            <div
                                                key={`${mudanca.campo}-${index}`}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px'
                                                }}
                                            >
                                                <strong
                                                    style={{
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {formatarCampo(
                                                        mudanca.campo,
                                                        detalheAberto.tabela_afetada
                                                    )}
                                                </strong>

                                                <div
                                                    className={
                                                        css.alteracaoGrid
                                                    }
                                                >
                                                    <div
                                                        className={`${css.alteracaoCard} ${css.alteracaoAntes}`}
                                                    >
                                                        <span
                                                            className={
                                                                css.alteracaoLabel
                                                            }
                                                        >
                                                            Antes
                                                        </span>

                                                        <p
                                                            className={
                                                                css.alteracaoValor
                                                            }
                                                        >
                                                            {formatarValor(
                                                                mudanca.campo,
                                                                mudanca.antes,
                                                                detalheAberto.tabela_afetada
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`${css.alteracaoCard} ${css.alteracaoDepois}`}
                                                    >
                                                        <span
                                                            className={
                                                                css.alteracaoLabel
                                                            }
                                                        >
                                                            Depois
                                                        </span>

                                                        <p
                                                            className={
                                                                css.alteracaoValor
                                                            }
                                                        >
                                                            {formatarValor(
                                                                mudanca.campo,
                                                                mudanca.depois,
                                                                detalheAberto.tabela_afetada
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p
                                className={css.semInformacoes}
                                style={{ marginTop: '1rem' }}
                            >
                                Nenhuma informação detalhada foi registrada nesta alteração.
                            </p>
                        )}
                    </section>
                </div>
            )}

            <Footer />
        </div>
    );
}