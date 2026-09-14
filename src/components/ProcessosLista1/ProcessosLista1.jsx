import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './ProcessosLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function ProcessosLista1({ api }) {
    const navigate = useNavigate();
    const API_URL = api || ' http://172.20.10.2:5000';

    const [processos, setProcessos] = useState([]);
    const [tiposProcessos, setTiposProcessos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    const [mensagemModal, setMensagemModal] = useState('');
    const [tipoMensagemModal, setTipoMensagemModal] = useState('');

    const [mensagemAtualizacao, setMensagemAtualizacao] = useState('');
    const [tipoMensagemAtualizacao, setTipoMensagemAtualizacao] = useState('');

    const [mensagemExito, setMensagemExito] = useState('');
    const [tipoMensagemExito, setTipoMensagemExito] = useState('');

    const [filtroNumero, setFiltroNumero] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [modalAberto, setModalAberto] = useState(false);
    const [processoSelecionado, setProcessoSelecionado] = useState(null);
    const [editando, setEditando] = useState(false);
    const [dadosEditados, setDadosEditados] = useState({});

    const [modalInativarAberto, setModalInativarAberto] = useState(false);
    const [processoInativar, setProcessoInativar] = useState(null);

    const [opcao, setOpcao] = useState("info");

    const [novaAtualizacao, setNovaAtualizacao] = useState(false);
    const [data, setData] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [concluido, setConcluido] = useState('');

    const [atualizacoes, setAtualizacoes] = useState([]);
    const [carregandoAtualizacoes, setCarregandoAtualizacoes] = useState(false);
    const [editandoAtualizacao, setEditandoAtualizacao] = useState(null);
    const [atualizacaoPendente, setAtualizacaoPendente] = useState(null);
    const [verificandoExito, setVerificandoExito] = useState(false);

    const [modalExitoAberto, setModalExitoAberto] = useState(false);
    const [processoExito, setProcessoExito] = useState(null);
    const [carregandoExito, setCarregandoExito] = useState(false);

    const [dadosExito, setDadosExito] = useState({
        tipo_pagamento: '',
        valor_exito: '',
        quantidade: '',
        valor_salario: '',
        valor_causa: '',
        distribuicao: '',
        valor_entrada: '',
        num_parcelas: '',
        dia_vencimento: '',
        mes_inicio: '',
        forma_pagamento: ''
    });

    const [salvandoExito, setSalvandoExito] = useState(false);

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');
        navigate('/login');
    }

    function limparTodasMensagens() {
        setMensagem('');
        setTipoMensagem('');
        setMensagemModal('');
        setTipoMensagemModal('');
        setMensagemAtualizacao('');
        setTipoMensagemAtualizacao('');
        setMensagemExito('');
        setTipoMensagemExito('');
    }

    function agendarLimpeza(setMsg, setTipo, refKey) {
        if (window[refKey]) clearTimeout(window[refKey]);
        window[refKey] = setTimeout(() => {
            setMsg('');
            setTipo('');
        }, 5000);
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);
        agendarLimpeza(setMensagem, setTipoMensagem, 'timeoutMensagem');
    }

    function mostrarMensagemModal(texto, tipo = 'erro') {
        setMensagemModal(texto);
        setTipoMensagemModal(tipo);
        agendarLimpeza(setMensagemModal, setTipoMensagemModal, 'timeoutMensagemModal');
    }

    function mostrarMensagemAtualizacao(texto, tipo = 'erro') {
        setMensagemAtualizacao(texto);
        setTipoMensagemAtualizacao(tipo);
        agendarLimpeza(setMensagemAtualizacao, setTipoMensagemAtualizacao, 'timeoutMensagemAtualizacao');
    }

    function mostrarMensagemExito(texto, tipo = 'erro') {
        setMensagemExito(texto);
        setTipoMensagemExito(tipo);
        agendarLimpeza(setMensagemExito, setTipoMensagemExito, 'timeoutMensagemExito');
    }

    function formatarStatus(status) {
        const map = {
            em_andamento: 'Em Andamento',
            concluido: 'Concluído',
            suspenso: 'Suspenso',
            inativo: 'Inativo'
        };

        return map[status] || status || '--';
    }

    function nomesClientes(processo) {
        if (Array.isArray(processo.clientes)) {
            return processo.clientes
                .map(c => c.nome || c)
                .join(', ');
        }

        return processo.clientes || '--';
    }

    function normalizarTexto(texto) {
        return (texto || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function apenasNumeros(valor) {
        return String(valor || '').replace(/\D/g, '');
    }

    function handleData(e) {
        let valor = apenasNumeros(e.target.value);

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        if (valor.length <= 2) {
            setData(valor);
        } else if (valor.length <= 4) {
            setData(`${valor.slice(0, 2)}/${valor.slice(2)}`);
        } else {
            setData(`${valor.slice(0, 2)}/${valor.slice(2, 4)}/${valor.slice(4, 8)}`);
        }
    }

    function capitalizarNome(texto) {
        if (!texto) {
            return '';
        }

        return texto
            .split(' ')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
            .join(' ');
    }

    function formatarDinheiro(valorTexto) {
        let numeros = apenasNumeros(valorTexto);
        numeros = numeros.replace(/^0+/, '');

        if (!numeros) {
            return '';
        }

        if (numeros.length > 20) {
            numeros = numeros.slice(0, 20);
        }

        while (numeros.length < 3) {
            numeros = '0' + numeros;
        }

        const reais = numeros.slice(0, -2);
        const centavos = numeros.slice(-2);
        const reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `R$ ${reaisFormatado},${centavos}`;
    }

    function formatarValorBanco(valor) {
        if (valor === null || valor === undefined || valor === '') {
            return '';
        }

        const numero = Number(valor);

        if (Number.isNaN(numero)) {
            return '';
        }

        return formatarDinheiro(String(Math.round(numero * 100)));
    }

    function converterDinheiro(valorTexto) {
        if (valorTexto === null || valorTexto === undefined || valorTexto === '') {
            return null;
        }

        if (typeof valorTexto === 'number') {
            return valorTexto;
        }

        const texto = String(valorTexto);

        if (!texto.includes('R$') && !texto.includes(',')) {
            const numero = Number(texto);
            return Number.isNaN(numero) ? null : numero;
        }

        const valorLimpo = texto
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim();

        const numero = Number(valorLimpo);
        return Number.isNaN(numero) ? null : numero;
    }

    function formatarNumeroProcessoEdit(valor) {
        let n = apenasNumeros(valor);

        if (n.length > 20) {
            n = n.slice(0, 20);
        }

        if (n.length <= 7) return n;
        if (n.length <= 9) return `${n.slice(0, 7)}-${n.slice(7)}`;
        if (n.length <= 13) return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9)}`;
        if (n.length <= 14) return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13)}`;
        if (n.length <= 16) return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13, 14)}.${n.slice(14)}`;

        return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13, 14)}.${n.slice(14, 16)}.${n.slice(16)}`;
    }

    function formatarDataEdit(valor) {
        let n = apenasNumeros(valor);

        if (n.length > 8) {
            n = n.slice(0, 8);
        }

        if (n.length <= 2) return n;
        if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;

        return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
    }

    function formatarNumeroParaExibicao(valor) {
        if (!valor) return '';
        return formatarNumeroProcessoEdit(String(valor));
    }

    async function buscarProcessos() {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/processos`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let dados = {};

            try {
                dados = await resposta.json();
            } catch {
                dados = {};
            }

            if (resposta.status === 401) {
                deslogar();
                return;
            }

            if (!resposta.ok) {
                mostrarMensagem(dados.error || 'Erro ao carregar processos.');
                return;
            }

            setProcessos(dados.processos || []);
            setTiposProcessos(dados.tipos_processos || []);

        } catch (erro) {
            console.error('Erro ao buscar processos:', erro);
            mostrarMensagem('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarProcessos();
    }, []);

    async function buscarAtualizacoes(idProcesso) {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setCarregandoAtualizacoes(true);

        try {
            const response = await fetch(`${API_URL}/processo/${idProcesso}/atualizacoes`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let resultado = {};

            try {
                resultado = await response.json();
            } catch {
                resultado = {};
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagemModal(resultado.error || 'Erro ao carregar atualizações.', 'erro');
                return;
            }

            setAtualizacoes(resultado.atualizacoes || []);

        } catch (error) {
            console.error('Erro ao buscar atualizações:', error);
        } finally {
            setCarregandoAtualizacoes(false);
        }
    }

    async function verificarTemExito(idProcesso) {
        const token = localStorage.getItem('token');

        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/processo/${idProcesso}/pagamento/exito`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (!response.ok) {
                return false;
            }

            const resultado = await response.json();
            const dados = resultado.dados || {};

            return !!(dados.tipo_pagamento || dados.tipo_exito);

        } catch (error) {
            console.error('Erro ao verificar êxito:', error);
            return false;
        }
    }

    async function buscarDadosExito(idProcesso) {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        setCarregandoExito(true);

        try {
            const response = await fetch(`${API_URL}/processo/${idProcesso}/pagamento/exito`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let resultado = {};

            try {
                resultado = await response.json();
            } catch {
                resultado = {};
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagemExito(resultado.error || 'Erro ao carregar pagamento de êxito.', 'erro');
                return;
            }

            const dados = resultado.dados || {};

            setDadosExito({
                tipo_pagamento: dados.tipo_pagamento || dados.tipo_exito || '',
                valor_exito: dados.valor_exito !== null && dados.valor_exito !== undefined ? String(Number(dados.valor_exito)) : '',
                quantidade: dados.quantidade !== null && dados.quantidade !== undefined ? String(Number(dados.quantidade)) : '',
                valor_salario: dados.valor_salario !== null && dados.valor_salario !== undefined ? formatarValorBanco(dados.valor_salario) : '',
                valor_causa: dados.valor_causa !== null && dados.valor_causa !== undefined ? formatarValorBanco(dados.valor_causa) : '',
                distribuicao: dados.distribuicao || '',
                valor_entrada: dados.valor_entrada !== null && dados.valor_entrada !== undefined ? formatarValorBanco(dados.valor_entrada) : '',
                num_parcelas: dados.num_parcelas !== null && dados.num_parcelas !== undefined ? String(dados.num_parcelas) : '',
                dia_vencimento: dados.dia_vencimento !== null && dados.dia_vencimento !== undefined ? String(dados.dia_vencimento) : '',
                mes_inicio: dados.mes_inicio !== null && dados.mes_inicio !== undefined ? String(dados.mes_inicio) : '',
                forma_pagamento: dados.forma_pagamento || ''
            });

        } catch (error) {
            console.error('Erro ao buscar dados de êxito:', error);
            mostrarMensagemExito('Erro de conexão com o servidor.', 'erro');
        } finally {
            setCarregandoExito(false);
        }
    }

    async function salvarAtualizacaoDireta(processoConcluido) {
        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        const urlBase = `${API_URL}/processo/${processoSelecionado.id}/atualizacoes`;
        const url = editandoAtualizacao ? `${urlBase}/${editandoAtualizacao.id}` : urlBase;
        const method = editandoAtualizacao ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({
                    titulo: titulo.trim(),
                    descricao: descricao.trim() ? descricao.trim() : null,
                    processo_concluido: processoConcluido,
                    data: data || null
                })
            });

            let resultado = {};

            try {
                resultado = await response.json();
            } catch {
                resultado = {};
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagemAtualizacao(resultado.error || 'Erro ao salvar atualização.', 'erro');
                return;
            }

            mostrarMensagemAtualizacao(resultado.mensagem || 'Atualização salva com sucesso!', 'sucesso');

            setTimeout(async () => {
                setNovaAtualizacao(false);
                setEditandoAtualizacao(null);
                setTitulo('');
                setDescricao('');
                setConcluido('');
                setData('');
                setMensagemAtualizacao('');
                setTipoMensagemAtualizacao('');

                if (processoSelecionado) {
                    await buscarAtualizacoes(processoSelecionado.id);
                }

                await buscarProcessos();
            }, 1500);

        } catch (error) {
            console.error('Erro ao salvar atualização:', error);
            mostrarMensagemAtualizacao('Erro de conexão com o servidor.', 'erro');
        }
    }

    async function salvarAtualizacao() {
        if (!processoSelecionado) {
            return;
        }

        if (!titulo.trim()) {
            mostrarMensagemAtualizacao('Título é obrigatório.', 'erro');
            return;
        }

        if (!concluido) {
            mostrarMensagemAtualizacao('Informe se o processo foi concluído.', 'erro');
            return;
        }

        const isConcluido = concluido === 'true';

        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        if (!isConcluido) {
            await salvarAtualizacaoDireta(0);
            return;
        }

        setVerificandoExito(true);

        const temExito = await verificarTemExito(processoSelecionado.id);

        setVerificandoExito(false);

        if (temExito) {
            setAtualizacaoPendente({
                id_atualizacao: editandoAtualizacao ? editandoAtualizacao.id : null,
                titulo: titulo.trim(),
                descricao: descricao.trim() ? descricao.trim() : null
            });

            setProcessoExito(processoSelecionado);
            setNovaAtualizacao(false);

            setMensagemAtualizacao('');
            setTipoMensagemAtualizacao('');
            setMensagemModal('');
            setTipoMensagemModal('');

            setModalExitoAberto(true);
            setMensagemExito('');
            setTipoMensagemExito('');

            await buscarDadosExito(processoSelecionado.id);

            return;
        }

        await salvarAtualizacaoDireta(1);
    }

    async function excluirAtualizacao(idAtualizacao) {
        if (!processoSelecionado) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/processo/${processoSelecionado.id}/atualizacoes/${idAtualizacao}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                }
            );

            let resultado = {};

            try {
                resultado = await response.json();
            } catch {
                resultado = {};
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (response.ok) {
                mostrarMensagemModal(resultado.mensagem || 'Atualização excluída com sucesso!', 'sucesso');

                await buscarAtualizacoes(processoSelecionado.id);
                await buscarProcessos();
            } else {
                mostrarMensagemModal(resultado.error || 'Erro ao excluir atualização.', 'erro');
            }

        } catch (error) {
            console.error('Erro ao excluir atualização:', error);
            mostrarMensagemModal('Erro de conexão com o servidor.', 'erro');
        }
    }

    async function salvarExito() {
        if (!processoExito || !atualizacaoPendente) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            deslogar();
            return;
        }

        const camposFaltando = [];

        if (!dadosExito.tipo_pagamento) {
            camposFaltando.push('Tipo de êxito');
        }

        if (dadosExito.tipo_pagamento === 'SALARIOS_BENEFICIO') {
            if (!dadosExito.quantidade) {
                camposFaltando.push('Quantidade de salários');
            }

            if (!dadosExito.valor_salario) {
                camposFaltando.push('Valor do salário');
            }
        }

        if (dadosExito.tipo_pagamento === 'PERCENTUAL') {
            if (!dadosExito.valor_exito) {
                camposFaltando.push('Percentual do êxito');
            }

            if (!dadosExito.valor_causa) {
                camposFaltando.push('Valor da causa');
            }
        }

        if (!dadosExito.distribuicao) {
            camposFaltando.push('Distribuição');
        }

        if (dadosExito.distribuicao === 'ENTRADA_PARCELAS' && !dadosExito.valor_entrada) {
            camposFaltando.push('Valor da entrada');
        }

        if (
            (dadosExito.distribuicao === 'PARCELADO' || dadosExito.distribuicao === 'ENTRADA_PARCELAS')
            && !dadosExito.num_parcelas
        ) {
            camposFaltando.push('Número de parcelas');
        }

        if (dadosExito.distribuicao !== 'RETIDO_FONTE') {
            if (!dadosExito.dia_vencimento) {
                camposFaltando.push('Dia do vencimento');
            }

            if (!dadosExito.mes_inicio) {
                camposFaltando.push('Mês de início');
            }
        }

        if (camposFaltando.length > 0) {
            mostrarMensagemExito(`Preencha: ${camposFaltando.join(', ')}.`, 'erro');
            return;
        }

        let valorExito = null;

        if (dadosExito.tipo_pagamento === 'SALARIOS_BENEFICIO') {
            valorExito = Number(dadosExito.quantidade);
        } else {
            valorExito = Number(String(dadosExito.valor_exito).replace(',', '.'));

            if (Number.isNaN(valorExito) || valorExito <= 0) {
                mostrarMensagemExito('Percentual do êxito inválido.', 'erro');
                return;
            }

            if (valorExito > 100) {
                mostrarMensagemExito('Percentual do êxito não pode ser maior que 100.', 'erro');
                return;
            }
        }

        setSalvandoExito(true);

        try {
            const payload = {
                atualizacao: {
                    id_atualizacao: atualizacaoPendente.id_atualizacao || null,
                    titulo: atualizacaoPendente.titulo,
                    descricao: atualizacaoPendente.descricao,
                    data: data || null
                },
                exito: {
                    tipo_exito: dadosExito.tipo_pagamento,
                    valor_exito: valorExito,
                    quantidade_exito: dadosExito.tipo_pagamento === 'SALARIOS_BENEFICIO' ? Number(dadosExito.quantidade) : null,
                    valor_salario_exito: dadosExito.tipo_pagamento === 'SALARIOS_BENEFICIO' ? converterDinheiro(dadosExito.valor_salario) : null,
                    valor_causa_exito: dadosExito.tipo_pagamento === 'PERCENTUAL' ? converterDinheiro(dadosExito.valor_causa) : null,
                    distribuicao_exito: dadosExito.distribuicao,
                    valor_entrada_exito: dadosExito.distribuicao === 'ENTRADA_PARCELAS' ? converterDinheiro(dadosExito.valor_entrada) : null,
                    numero_parcelas_exito: (dadosExito.distribuicao === 'PARCELADO' || dadosExito.distribuicao === 'ENTRADA_PARCELAS') ? Number(dadosExito.num_parcelas) : null,
                    dia_vencimento_exito: dadosExito.distribuicao !== 'RETIDO_FONTE' ? Number(dadosExito.dia_vencimento) : null,
                    mes_inicio_exito: dadosExito.distribuicao !== 'RETIDO_FONTE' ? Number(dadosExito.mes_inicio) : null,
                    forma_pagamento_exito: dadosExito.distribuicao !== 'RETIDO_FONTE' ? (dadosExito.forma_pagamento || null) : null
                }
            };

            const response = await fetch(`${API_URL}/processo/${processoExito.id}/concluir`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(payload)
            });

            let resultado = {};

            try {
                resultado = await response.json();
            } catch {
                resultado = {};
            }

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagemExito(resultado.error || 'Erro ao concluir processo.', 'erro');
                return;
            }

            setModalExitoAberto(false);
            setProcessoExito(null);
            setAtualizacaoPendente(null);
            setNovaAtualizacao(false);
            setEditandoAtualizacao(null);
            setTitulo('');
            setDescricao('');
            setConcluido('');
            setData('');

            setDadosExito({
                tipo_pagamento: '',
                valor_exito: '',
                quantidade: '',
                valor_salario: '',
                valor_causa: '',
                distribuicao: '',
                valor_entrada: '',
                num_parcelas: '',
                dia_vencimento: '',
                mes_inicio: '',
                forma_pagamento: ''
            });

            mostrarMensagem(resultado.mensagem || 'Processo concluído com sucesso!', 'sucesso');

            if (processoSelecionado) {
                await buscarAtualizacoes(processoSelecionado.id);
            }

            await buscarProcessos();

        } catch (error) {
            console.error('Erro ao concluir processo:', error);
            mostrarMensagemExito('Erro de conexão com o servidor.', 'erro');
        } finally {
            setSalvandoExito(false);
        }
    }

    function cancelarExito() {
        setModalExitoAberto(false);
        setProcessoExito(null);

        setMensagemExito('');
        setTipoMensagemExito('');

        if (atualizacaoPendente) {
            setTitulo(atualizacaoPendente.titulo || '');
            setDescricao(atualizacaoPendente.descricao || '');
            setConcluido('true');

            if (atualizacaoPendente.id_atualizacao) {
                const atualizacao = atualizacoes.find(
                    item => item.id === atualizacaoPendente.id_atualizacao
                );

                if (atualizacao) {
                    setEditandoAtualizacao(atualizacao);
                }
            }

            setNovaAtualizacao(true);
        }

        setAtualizacaoPendente(null);
    }

    function abrirModal(processo) {
        limparTodasMensagens();

        const dadosNormalizados = {
            ...processo,
            numero_processo: formatarNumeroParaExibicao(processo.numero_processo || processo.numero),
            data_inicio: processo.data_inicio ? formatarDataEdit(processo.data_inicio) : ''
        };

        setProcessoSelecionado(processo);
        setDadosEditados(dadosNormalizados);
        setEditando(false);
        setModalAberto(true);
        setOpcao("info");
        setNovaAtualizacao(false);
        setAtualizacaoPendente(null);

        buscarAtualizacoes(processo.id);
    }

    function fecharModal() {
        setModalAberto(false);
        setProcessoSelecionado(null);
        setEditando(false);
        setDadosEditados({});
        setAtualizacoes([]);
        setNovaAtualizacao(false);
        setEditandoAtualizacao(null);
        setAtualizacaoPendente(null);
        setTitulo('');
        setDescricao('');
        setConcluido('');
        setData('');
        setModalExitoAberto(false);
        setProcessoExito(null);

        setDadosExito({
            tipo_pagamento: '',
            valor_exito: '',
            quantidade: '',
            valor_salario: '',
            valor_causa: '',
            distribuicao: '',
            valor_entrada: '',
            num_parcelas: '',
            dia_vencimento: '',
            mes_inicio: '',
            forma_pagamento: ''
        });

        limparTodasMensagens();
    }

    function handleEditChange(e) {
        const { name, value } = e.target;

        let valorFormatado = value;

        if (name === 'numero_processo') {
            valorFormatado = formatarNumeroProcessoEdit(value);
        }

        if (name === 'data_inicio') {
            valorFormatado = formatarDataEdit(value);
        }

        setDadosEditados(prev => ({
            ...prev,
            [name]: valorFormatado
        }));
    }

    async function handleSalvarEdicao() {
        if (!processoSelecionado) return;

        const token = localStorage.getItem('token');
        if (!token) { deslogar(); return; }

        if (!dadosEditados.tipo_processo?.trim()) {
            mostrarMensagemModal('Tipo do processo é obrigatório.', 'erro');
            return;
        }

        if (!dadosEditados.assunto?.trim()) {
            mostrarMensagemModal('Assunto é obrigatório.', 'erro');
            return;
        }

        if (!dadosEditados.area?.trim()) {
            mostrarMensagemModal('Área é obrigatória.', 'erro');
            return;
        }

        if (!dadosEditados.comarca?.trim()) {
            mostrarMensagemModal('Comarca é obrigatória.', 'erro');
            return;
        }

        if (dadosEditados.data_inicio) {
            const textoData = String(dadosEditados.data_inicio).trim();
            const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

            if (!regexData.test(textoData)) {
                mostrarMensagemModal('Data de início inválida. Use o formato DD/MM/AAAA.', 'erro');
                return;
            }

            const [dia, mes, ano] = textoData.split('/').map(Number);
            const dataObjeto = new Date(ano, mes - 1, dia);
            const dataValida = (
                dataObjeto.getFullYear() === ano &&
                dataObjeto.getMonth() === mes - 1 &&
                dataObjeto.getDate() === dia
            );

            if (!dataValida) {
                mostrarMensagemModal('Data de início inválida.', 'erro');
                return;
            }

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            dataObjeto.setHours(0, 0, 0, 0);

            if (dataObjeto > hoje) {
                mostrarMensagemModal('A data de início não pode ser uma data futura.', 'erro');
                return;
            }

            const limite120 = new Date();
            limite120.setFullYear(limite120.getFullYear() - 120);
            limite120.setHours(0, 0, 0, 0);

            if (dataObjeto < limite120) {
                mostrarMensagemModal('A data de início não pode ser superior a 120 anos atrás.', 'erro');
                return;
            }
        }

        try {
            const payload = {
                numero_processo: dadosEditados.numero_processo || '',
                tipo_processo: dadosEditados.tipo_processo,
                assunto: dadosEditados.assunto,
                area: dadosEditados.area,
                comarca: dadosEditados.comarca,
                vara: dadosEditados.vara || '',
                instancia: dadosEditados.instancia,
                data_inicio: dadosEditados.data_inicio
            };

            const response = await fetch(`${API_URL}/processo/${processoSelecionado.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                deslogar();
                return;
            }

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagemModal(resultado.error || 'Erro ao salvar alterações.', 'erro');
                return;
            }

            mostrarMensagemModal(resultado.mensagem || 'Informações atualizadas com sucesso!', 'sucesso');

            setProcessos(prev =>
                prev.map(p =>
                    p.id === processoSelecionado.id
                        ? { ...p, ...dadosEditados }
                        : p
                )
            );

            setProcessoSelecionado(prev => ({ ...prev, ...dadosEditados }));
            setEditando(false);

            await buscarProcessos();

        } catch (error) {
            console.error('Erro ao salvar processo:', error);
            mostrarMensagemModal('Erro de conexão com o servidor.', 'erro');
        }
    }

    function cancelarEdicao() {
        setEditando(false);

        setDadosEditados({
            ...processoSelecionado,
            numero_processo: formatarNumeroParaExibicao(processoSelecionado.numero_processo || processoSelecionado.numero),
            data_inicio: processoSelecionado.data_inicio ? formatarDataEdit(processoSelecionado.data_inicio) : ''
        });

        setMensagemModal('');
        setTipoMensagemModal('');
    }

    function abrirModalInativar(processo) {
        setProcessoInativar(processo);
        setModalInativarAberto(true);
    }

    function fecharModalInativar() {
        setModalInativarAberto(false);
        setProcessoInativar(null);
    }

    async function handleInativar() {
        if (!processoInativar) return;

        const token = localStorage.getItem('token');
        if (!token) { deslogar(); return; }

        try {
            const response = await fetch(`${API_URL}/processo/${processoInativar.id}/inativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.status === 401) {
                deslogar();
                return;
            }

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagem(resultado.error || 'Erro ao inativar processo.', 'erro');
                return;
            }

            setProcessos(prev =>
                prev.map(p =>
                    p.id === processoInativar.id ? { ...p, status: 'inativo' } : p
                )
            );

            if (processoSelecionado?.id === processoInativar.id) {
                setProcessoSelecionado(prev => ({ ...prev, status: 'inativo' }));
            }

            fecharModalInativar();
            mostrarMensagem(resultado.mensagem || 'Processo inativado com sucesso!', 'sucesso');

            await buscarProcessos();

        } catch (error) {
            console.error('Erro ao inativar processo:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        }
    }

    async function handleAtivar(processo) {
        const token = localStorage.getItem('token');
        if (!token) { deslogar(); return; }

        try {
            const response = await fetch(`${API_URL}/processo/${processo.id}/ativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.status === 401) {
                deslogar();
                return;
            }

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagem(resultado.error || 'Erro ao ativar processo.', 'erro');
                return;
            }

            setProcessos(prev =>
                prev.map(p =>
                    p.id === processo.id ? { ...p, status: 'em_andamento' } : p
                )
            );

            mostrarMensagem(resultado.mensagem || 'Processo ativado com sucesso!', 'sucesso');

            await buscarProcessos();

        } catch (error) {
            console.error('Erro ao ativar processo:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        }
    }

    function irParaCadastroProcesso() {
        navigate('/cadastro_processo');
    }

    function abrirNovaAtualizacao() {
        setMensagemModal('');
        setTipoMensagemModal('');
        setMensagemAtualizacao('');
        setTipoMensagemAtualizacao('');

        setEditandoAtualizacao(null);
        setAtualizacaoPendente(null);
        setTitulo('');
        setDescricao('');
        setConcluido('');
        setData('');
        setNovaAtualizacao(true);
    }

    function editarAtualizacao(atualizacao) {
        setMensagemModal('');
        setTipoMensagemModal('');
        setMensagemAtualizacao('');
        setTipoMensagemAtualizacao('');

        setEditandoAtualizacao(atualizacao);
        setAtualizacaoPendente(null);
        setTitulo(atualizacao.titulo || '');
        setDescricao(atualizacao.descricao || '');
        setConcluido(atualizacao.processo_concluido ? 'true' : 'false');
        setData(atualizacao.data ? atualizacao.data.split(' ')[0] : '');
        setNovaAtualizacao(true);
    }

    function fecharNovaAtualizacao() {
        setNovaAtualizacao(false);
        setEditandoAtualizacao(null);
        setAtualizacaoPendente(null);
        setMensagemAtualizacao('');
        setTipoMensagemAtualizacao('');
    }

    const processosFiltrados = processos.filter(processo => {
        const numeroMatch = (processo.numero || '').toLowerCase().includes(filtroNumero.toLowerCase());
        const statusMatch = filtroStatus === 'todos' || processo.status === filtroStatus;
        const tipoMatch = filtroTipo === 'todos' || normalizarTexto(processo.tipo_processo) === normalizarTexto(filtroTipo);

        return numeroMatch && statusMatch && tipoMatch;
    });

    const textoBotaoAtualizacao = () => {
        if (verificandoExito) {
            return 'Verificando...';
        }

        if (concluido === 'true') {
            return 'Próxima Etapa';
        }

        if (editandoAtualizacao) {
            return 'Atualizar';
        }

        return 'Salvar';
    };

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>
                    <div className={css.topoSaudacao}>
                        <h1 className={css.tituloPagina}>Meus Processos</h1>

                        <button
                            className={css.botaoAdicionar}
                            onClick={irParaCadastroProcesso}
                            type="button"
                            title="Cadastrar processo"
                        >
                            +
                        </button>
                    </div>

                    {mensagem && !modalAberto && (
                        <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.areaFiltros}>
                        <div className={css.buscaContainer}>
                            <input
                                type="text"
                                className={css.inputBusca}
                                placeholder="Pesquisar por nº do processo..."
                                value={filtroNumero}
                                onChange={(e) => setFiltroNumero(e.target.value)}
                            />

                            <svg
                                className={css.iconeBusca}
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#ffbf00"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>

                        <div className={css.filtrosOpcoes}>
                            <select
                                className={css.selectFiltro}
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="todos">Filtrar por: Todos os Tipos</option>

                                {tiposProcessos.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>

                            <select
                                className={css.selectFiltro}
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                            >
                                <option value="todos">Filtrar por: Status</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="concluido">Concluído</option>
                                <option value="suspenso">Suspenso</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className={css.tabelaContainer}>
                        {carregando ? (
                            <p>Carregando processos...</p>
                        ) : processos.length === 0 ? (
                            <p>Nenhum processo encontrado.</p>
                        ) : processosFiltrados.length === 0 ? (
                            <p>Nenhum processo encontrado com os filtros selecionados.</p>
                        ) : (
                            <table className={css.tabela}>
                                <thead>
                                <tr>
                                    <th>Nº do Processo</th>
                                    <th>Clientes</th>
                                    <th>Assunto</th>
                                    <th>Início</th>
                                    <th>Status</th>
                                    <th className={css.colunaAcoes}>Ações</th>
                                </tr>
                                </thead>

                                <tbody>
                                {processosFiltrados.map(processo => (
                                    <tr key={processo.id}>
                                        <td>
                                            <div className={css.colunaProcesso}>
                                                <svg
                                                    className={css.iconeProcesso}
                                                    width="22"
                                                    height="18"
                                                    viewBox="0 0 24 20"
                                                    fill="none"
                                                    stroke="#0047ab"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="2" y="1" width="20" height="13" rx="1.5" />
                                                    <line x1="8" y1="18" x2="16" y2="18" />
                                                    <line x1="12" y1="14" x2="12" y2="18" />
                                                </svg>

                                                <span>{processo.numero}</span>
                                            </div>
                                        </td>

                                        <td>{nomesClientes(processo)}</td>
                                        <td>{processo.assunto || '--'}</td>
                                        <td>{processo.data_inicio || '--'}</td>

                                        <td>
                                            <span className={`${css.statusBadge} ${css[processo.status] || ''}`}>
                                                {formatarStatus(processo.status)}
                                            </span>
                                        </td>

                                        <td className={css.colunaAcoes}>
                                            <button
                                                className={css.botaoVer}
                                                onClick={() => abrirModal(processo)}
                                                type="button"
                                            >
                                                Ver
                                            </button>

                                            {processo.status === 'inativo' ? (
                                                <button
                                                    className={css.botaoAtivar}
                                                    onClick={() => handleAtivar(processo)}
                                                    type="button"
                                                >
                                                    Ativar
                                                </button>
                                            ) : (
                                                <button
                                                    className={css.botaoInativar}
                                                    onClick={() => abrirModalInativar(processo)}
                                                    type="button"
                                                >
                                                    Inativar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {modalAberto && processoSelecionado && (
                <div
                    className={css.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            fecharModal();
                        }
                    }}
                >
                    <div className={css.modalContainer}>
                        <div className={css.modalHeader}>
                            <h2 className={css.modalTitulo}>
                                Processo {processoSelecionado.numero}
                            </h2>

                            <button className={css.modalFechar} onClick={fecharModal} type="button">
                                ✕
                            </button>
                        </div>

                        <div className={css.modalBody}>
                            {mensagemModal && !novaAtualizacao && !modalExitoAberto && (
                                <div className={`${css.mensagemContainer} ${tipoMensagemModal === 'sucesso' ? css.sucesso : css.erro}`}>
                                    {mensagemModal}
                                </div>
                            )}

                            <div className={css.secaoTitulo}>
                                <a
                                    className={`${css.secaoSubtitulo} ${opcao === "info" ? css.ativoInfo : ''}`}
                                    onClick={() => setOpcao("info")}
                                >
                                    Informações
                                </a>

                                <a
                                    className={`${css.secaoSubtitulo} ${opcao === "atualizacao" ? css.ativoInfo : ''}`}
                                    onClick={() => setOpcao("atualizacao")}
                                >
                                    Atualizações
                                </a>
                            </div>

                            {opcao === "info" && (
                                <form className={css.formulario} onSubmit={(e) => e.preventDefault()}>
                                    <div className={css.linha}>
                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Nº do processo</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="numero_processo"
                                                    className={css.input}
                                                    value={dadosEditados.numero_processo || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={25}
                                                    placeholder="0000000-00.0000.0.00.0000"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.numero || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Cliente(s)</label>
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={nomesClientes(processoSelecionado)}
                                                readOnly
                                            />
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Tipo do processo</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="tipo_processo"
                                                    className={css.input}
                                                    value={dadosEditados.tipo_processo || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={256}
                                                    placeholder="Digite o tipo do processo"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.tipo_processo || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Assunto</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="assunto"
                                                    className={css.input}
                                                    value={dadosEditados.assunto || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={254}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.assunto || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Área</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="area"
                                                    className={css.input}
                                                    value={dadosEditados.area || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={256}
                                                    placeholder="Digite a área do processo"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.area || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Comarca</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="comarca"
                                                    className={css.input}
                                                    value={dadosEditados.comarca || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={256}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.comarca || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Vara</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="vara"
                                                    className={css.input}
                                                    value={dadosEditados.vara || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={256}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.vara || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Instância</label>

                                            {editando ? (
                                                <select
                                                    name="instancia"
                                                    className={css.input}
                                                    value={dadosEditados.instancia || ''}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Selecionar instância</option>
                                                    <option value="1">1ª instância</option>
                                                    <option value="2">2ª instância</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.instancia ? `${processoSelecionado.instancia}ª instância` : '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Advogado responsável</label>
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={processoSelecionado.advogado_responsavel || '--'}
                                                readOnly
                                            />
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Data de início</label>

                                            {editando ? (
                                                <input
                                                    type="text"
                                                    name="data_inicio"
                                                    className={css.input}
                                                    value={dadosEditados.data_inicio || ''}
                                                    onChange={handleEditChange}
                                                    maxLength={10}
                                                    placeholder="dd/mm/aaaa"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={processoSelecionado.data_inicio || '--'}
                                                    readOnly
                                                />
                                            )}
                                        </div>

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Status</label>
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={formatarStatus(processoSelecionado.status)}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                                        <p className={css.obsCampos}>* Campos editáveis</p>
                                    </div>

                                    <div className={css.botaoContainer}>
                                        {editando ? (
                                            <>
                                                <button
                                                    className={css.botaoCadastro}
                                                    type="button"
                                                    onClick={handleSalvarEdicao}
                                                >
                                                    Atualizar Informações
                                                </button>

                                                <button
                                                    className={css.botaoCancelar}
                                                    type="button"
                                                    onClick={cancelarEdicao}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className={css.botaoEditar}
                                                type="button"
                                                onClick={() => setEditando(true)}
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {opcao === "atualizacao" && (
                                <div>
                                    <div className={css.topoAtualizacao}>
                                        <div className={css.listaAtualizacao}>
                                            {carregandoAtualizacoes ? (
                                                <p>Carregando atualizações...</p>
                                            ) : atualizacoes.length === 0 ? (
                                                <p className={css.semAtualizacoes}>Nenhuma atualização registrada</p>
                                            ) : (
                                                atualizacoes.map(atualizacao => (
                                                    <div key={atualizacao.id} className={css.atualizacao}>
                                                        <div className={css.dataAtualizacao}>
                                                            <p className={css.textoDataAtualizacao}>
                                                                {atualizacao.data ? atualizacao.data.split(' ')[0] : '--'}
                                                            </p>
                                                        </div>

                                                        <div className={css.textoAtualizacao}>
                                                            <p className={css.tituloAtualizacao}>
                                                                {atualizacao.titulo}

                                                                {atualizacao.processo_concluido && (
                                                                    <span className={css.badgeConcluido}>
                                                                        {' '}✓ Concluído
                                                                    </span>
                                                                )}
                                                            </p>

                                                            {atualizacao.descricao && (
                                                                <p className={css.descricaoAtualizacao}>
                                                                    {atualizacao.descricao}
                                                                </p>
                                                            )}

                                                            <div className={css.atualizacaoAcoes}>
                                                                <button
                                                                    className={css.botaoEditarAtualizacao}
                                                                    onClick={() => editarAtualizacao(atualizacao)}
                                                                    type="button"
                                                                >
                                                                    Editar
                                                                </button>

                                                                <button
                                                                    className={css.botaoDeletarAtualizacao}
                                                                    onClick={() => excluirAtualizacao(atualizacao.id)}
                                                                    type="button"
                                                                >
                                                                    Excluir
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <button
                                            className={css.botaoAdicionar}
                                            onClick={abrirNovaAtualizacao}
                                            type="button"
                                            title="Nova atualização"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {novaAtualizacao && (
                <div className={css.modalOverlaySegunda}>
                    <div className={css.modalContainerSegunda}>
                        <div className={css.modalHeader}>
                            <h2 className={css.modalTitulo}>
                                {editandoAtualizacao ? 'Editar atualização' : 'Cadastro de atualização'}
                            </h2>

                            <button
                                className={css.modalFechar}
                                type="button"
                                onClick={fecharNovaAtualizacao}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={css.modalBody}>
                            {mensagemAtualizacao && (
                                <div className={`${css.mensagemContainer} ${tipoMensagemAtualizacao === 'sucesso' ? css.sucesso : css.erro}`}>
                                    {mensagemAtualizacao}
                                </div>
                            )}

                            <div className={css.formulario}>
                                <div className={css.linha}>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Data *</label>

                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="DD/MM/AAAA"
                                            maxLength={10}
                                            value={data}
                                            onChange={handleData}
                                        />
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Título *</label>

                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="Digite um título"
                                            maxLength={254}
                                            value={titulo}
                                            onChange={(e) => setTitulo(capitalizarNome(e.target.value))}
                                        />
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Descrição</label>

                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="Digite a descrição"
                                            maxLength={254}
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Processo concluído?</label>

                                        <select
                                            className={css.input}
                                            value={concluido}
                                            onChange={(e) => setConcluido(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            <option value="true">Sim</option>
                                            <option value="false">Não</option>
                                        </select>
                                    </div>

                                    <div className={css.botaoContainer}>
                                        <button
                                            className={css.botaoEditar}
                                            type="button"
                                            onClick={salvarAtualizacao}
                                            disabled={verificandoExito}
                                        >
                                            {textoBotaoAtualizacao()}
                                        </button>

                                        <button
                                            className={css.botaoCancelar}
                                            type="button"
                                            onClick={fecharNovaAtualizacao}
                                            disabled={verificandoExito}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalExitoAberto && processoExito && (
                <div className={css.modalOverlaySegunda}>
                    <div className={css.modalContainerSegunda}>
                        <div className={css.modalHeader}>
                            <h2 className={css.modalTitulo}>Pagamento do êxito</h2>

                            <button
                                className={css.modalFechar}
                                type="button"
                                onClick={cancelarExito}
                                disabled={salvandoExito}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={css.modalBody}>
                            {mensagemExito && (
                                <div className={`${css.mensagemContainer} ${tipoMensagemExito === 'sucesso' ? css.sucesso : css.erro}`}>
                                    {mensagemExito}
                                </div>
                            )}

                            {carregandoExito ? (
                                <p>Carregando dados do êxito...</p>
                            ) : (
                                <div className={css.formulario}>
                                    <div className={css.linha}>
                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Tipo de pagamento *</label>

                                            <select
                                                className={css.input}
                                                value={dadosExito.tipo_pagamento}
                                                onChange={(e) => {
                                                    const valor = e.target.value;

                                                    setDadosExito(prev => ({
                                                        ...prev,
                                                        tipo_pagamento: valor,
                                                        quantidade: valor === 'SALARIOS_BENEFICIO' ? prev.quantidade : '',
                                                        valor_salario: valor === 'SALARIOS_BENEFICIO' ? prev.valor_salario : '',
                                                        valor_exito: valor === 'PERCENTUAL' ? prev.valor_exito : '',
                                                        valor_causa: valor === 'PERCENTUAL' ? prev.valor_causa : ''
                                                    }));
                                                }}
                                            >
                                                <option value="">Selecione</option>
                                                <option value="SALARIOS_BENEFICIO">Salários de benefício</option>
                                                <option value="PERCENTUAL">Percentual</option>
                                            </select>
                                        </div>

                                        {dadosExito.tipo_pagamento === 'SALARIOS_BENEFICIO' && (
                                            <>
                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Quantidade *</label>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className={css.input}
                                                        placeholder="Digite a quantidade"
                                                        value={dadosExito.quantidade}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, quantidade: e.target.value }))}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Valor do salário *</label>

                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        placeholder="R$ 0,00"
                                                        value={dadosExito.valor_salario}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, valor_salario: formatarDinheiro(e.target.value) }))}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {dadosExito.tipo_pagamento === 'PERCENTUAL' && (
                                            <>
                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Percentual do êxito *</label>

                                                    <input
                                                        type="number"
                                                        className={css.input}
                                                        placeholder="Ex: 10"
                                                        min="0.01"
                                                        max="100"
                                                        step="0.01"
                                                        value={dadosExito.valor_exito}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, valor_exito: e.target.value }))}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Valor da causa *</label>

                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        placeholder="R$ 0,00"
                                                        value={dadosExito.valor_causa}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, valor_causa: formatarDinheiro(e.target.value) }))}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className={css.campoMetade}>
                                            <label className={css.label}>Distribuição do pagamento *</label>

                                            <select
                                                className={css.input}
                                                value={dadosExito.distribuicao}
                                                onChange={(e) => {
                                                    const valor = e.target.value;

                                                    setDadosExito(prev => ({
                                                        ...prev,
                                                        distribuicao: valor,
                                                        num_parcelas: valor === 'AVISTA' || valor === 'RETIDO_FONTE' ? '' : prev.num_parcelas,
                                                        valor_entrada: valor === 'ENTRADA_PARCELAS' ? prev.valor_entrada : '',
                                                        dia_vencimento: valor === 'RETIDO_FONTE' ? '' : prev.dia_vencimento,
                                                        mes_inicio: valor === 'RETIDO_FONTE' ? '' : prev.mes_inicio,
                                                        forma_pagamento: valor === 'RETIDO_FONTE' ? '' : prev.forma_pagamento
                                                    }));
                                                }}
                                            >
                                                <option value="">Selecione</option>
                                                <option value="AVISTA">À vista</option>
                                                <option value="PARCELADO">Parcelado</option>
                                                <option value="ENTRADA_PARCELAS">Entrada + parcelas</option>
                                                <option value="RETIDO_FONTE">Retido na fonte</option>
                                            </select>
                                        </div>

                                        {dadosExito.distribuicao === 'ENTRADA_PARCELAS' && (
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Valor da entrada *</label>

                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    placeholder="R$ 0,00"
                                                    value={dadosExito.valor_entrada}
                                                    onChange={(e) => setDadosExito(prev => ({ ...prev, valor_entrada: formatarDinheiro(e.target.value) }))}
                                                />
                                            </div>
                                        )}

                                        {(dadosExito.distribuicao === 'PARCELADO' || dadosExito.distribuicao === 'ENTRADA_PARCELAS') && (
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nº de parcelas *</label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    className={css.input}
                                                    placeholder="Digite"
                                                    value={dadosExito.num_parcelas}
                                                    onChange={(e) => setDadosExito(prev => ({ ...prev, num_parcelas: e.target.value }))}
                                                />
                                            </div>
                                        )}

                                        {dadosExito.distribuicao !== 'RETIDO_FONTE' && (
                                            <>
                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Dia do vencimento *</label>

                                                    <select
                                                        className={css.input}
                                                        value={dadosExito.dia_vencimento}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                                                    >
                                                        <option value="">Selecione</option>

                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                                                            <option key={dia} value={dia}>{dia}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Mês de início *</label>

                                                    <select
                                                        className={css.input}
                                                        value={dadosExito.mes_inicio}
                                                        onChange={(e) => setDadosExito(prev => ({ ...prev, mes_inicio: e.target.value }))}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="1">Janeiro</option>
                                                        <option value="2">Fevereiro</option>
                                                        <option value="3">Março</option>
                                                        <option value="4">Abril</option>
                                                        <option value="5">Maio</option>
                                                        <option value="6">Junho</option>
                                                        <option value="7">Julho</option>
                                                        <option value="8">Agosto</option>
                                                        <option value="9">Setembro</option>
                                                        <option value="10">Outubro</option>
                                                        <option value="11">Novembro</option>
                                                        <option value="12">Dezembro</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {dadosExito.distribuicao !== 'RETIDO_FONTE' && (
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Forma de pagamento</label>

                                                <select
                                                    className={css.input}
                                                    value={dadosExito.forma_pagamento}
                                                    onChange={(e) => setDadosExito(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="CREDITO">Crédito</option>
                                                    <option value="DEBITO">Débito</option>
                                                    <option value="PIX">Pix</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                                        </div>

                                        <div className={css.botaoContainer}>
                                            <button
                                                className={css.botaoCadastro}
                                                type="button"
                                                onClick={salvarExito}
                                                disabled={salvandoExito || carregandoExito}
                                            >
                                                {salvandoExito ? 'Concluindo...' : 'Concluir processo'}
                                            </button>

                                            <button
                                                className={css.botaoCancelar}
                                                type="button"
                                                onClick={cancelarExito}
                                                disabled={salvandoExito}
                                            >
                                                Voltar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalInativarAberto && processoInativar && (
                <div
                    className={css.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            fecharModalInativar();
                        }
                    }}
                >
                    <div className={css.modalInativacao}>
                        <button
                            className={css.modalFecharIconeLeft}
                            onClick={fecharModalInativar}
                            type="button"
                        >
                            X
                        </button>

                        <h2 className={css.tituloInativacao}>
                            Certeza que gostaria de
                            <br />
                            inativar?
                        </h2>

                        <p className={css.subtituloInativacao}>
                            Confirme para inativar o processo.
                        </p>

                        <div className={css.botoesInativacao}>
                            <button
                                className={css.btnCancelarInativacao}
                                onClick={fecharModalInativar}
                                type="button"
                            >
                                Cancelar
                            </button>

                            <button
                                className={css.btnConfirmarInativacao}
                                onClick={handleInativar}
                                type="button"
                            >
                                Inativar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}