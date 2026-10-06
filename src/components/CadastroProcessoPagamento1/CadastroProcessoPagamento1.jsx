import React, { useState, useRef, useEffect } from 'react';
import css from './CadastroProcessoPagamento1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate, useLocation } from 'react-router-dom';

export default function CadastroProcessoPagamento1({ api }) {
    window.onload = function() {
        window.scrollTo(0, 0);
    };

    const navigate = useNavigate();
    const location = useLocation();
    const topoRef = useRef(null);

    let processo = location.state?.processo;
    let parteContraria = location.state?.parte_contraria;

    if (!processo) {
        const saved = sessionStorage.getItem('processo_temp');
        if (saved) {
            try {
                processo = JSON.parse(saved);
            } catch (e) {
                processo = null;
            }
        }
    }

    if (!parteContraria) {
        const saved = sessionStorage.getItem('parte_contraria_temp');
        if (saved) {
            try {
                parteContraria = JSON.parse(saved);
            } catch (e) {
                parteContraria = null;
            }
        }
    }

    useEffect(() => {
        if (!processo || !parteContraria) {
            navigate('/cadastro_processo', { replace: true });
        }
    }, [processo, parteContraria, navigate]);

    const [proLabore, setProLabore] = useState('');
    const [valor, setValor] = useState('');
    const [qtdSalarios, setQtdSalarios] = useState('');
    const [valorSalario, setValorSalario] = useState('');
    const [distribuicao, setDistribuicao] = useState('');
    const [entrada, setEntrada] = useState('');
    const [qtdParcelas, setQtdParcelas] = useState('');
    const [diaVencimento, setDiaVencimento] = useState('');
    const [mes, setMes] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');

    const [exito, setExito] = useState('');
    const [qtdSalariosExito, setQtdSalariosExito] = useState('');
    const [valorSalarioExito, setValorSalarioExito] = useState('');
    const [percentual, setPercentual] = useState('');
    const [juros, setJuros] = useState('');

    const [distribuicaoExito, setDistribuicaoExito] = useState('');
    const [entradaExito, setEntradaExito] = useState('');
    const [qtdParcelasExito, setQtdParcelasExito] = useState('');
    const [diaVencimentoExito, setDiaVencimentoExito] = useState('');
    const [formaPagamentoExito, setFormaPagamentoExito] = useState('');

    const [valorCausaExito, setValorCausaExito] = useState('');

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    const [
        modalDocumentosAberta,
        setModalDocumentosAberta
    ] = useState(false);

    const [
        idProcessoCriado,
        setIdProcessoCriado
    ] = useState(null);

    const [
        numeroProcessoCriado,
        setNumeroProcessoCriado
    ] = useState('');

    const [
        modelosIniciais,
        setModelosIniciais
    ] = useState([]);

    const [
        modelosSelecionados,
        setModelosSelecionados
    ] = useState([]);

    const [
        carregandoModelos,
        setCarregandoModelos
    ] = useState(false);

    const [
        gerandoDocumentos,
        setGerandoDocumentos
    ] = useState(false);

    const [
        mensagemDocumentos,
        setMensagemDocumentos
    ] = useState('');

    const [
        buscaModeloInicial,
        setBuscaModeloInicial
    ] = useState('');

    const API_URL = api || 'http://10.92.11.22:5000';

    const dias = Array.from({ length: 31 }, (_, index) => index + 1);
    const meses = [
        { valor: 1, nome: 'Janeiro' },
        { valor: 2, nome: 'Fevereiro' },
        { valor: 3, nome: 'Março' },
        { valor: 4, nome: 'Abril' },
        { valor: 5, nome: 'Maio' },
        { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' },
        { valor: 8, nome: 'Agosto' },
        { valor: 9, nome: 'Setembro' },
        { valor: 10, nome: 'Outubro' },
        { valor: 11, nome: 'Novembro' },
        { valor: 12, nome: 'Dezembro' }
    ];

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) {
            clearTimeout(window.timeoutMensagem);
        }
        window.timeoutMensagem = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 7000);
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);
        if (topoRef.current) {
            topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        agendarLimpezaMensagem();
    }

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, '');
    }

    function formatarDinheiro(valorTexto) {
        let numeros = apenasNumeros(valorTexto);
        numeros = numeros.replace(/^0+/, '');
        if (!numeros) return '';
        if (numeros.length > 20) numeros = numeros.slice(0, 20);
        while (numeros.length < 3) numeros = '0' + numeros;
        const reais = numeros.slice(0, -2);
        const centavos = numeros.slice(-2);
        const reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `R$ ${reaisFormatado},${centavos}`;
    }

    function converterDinheiro(valorTexto) {
        if (!valorTexto) return null;
        const valorLimpo = valorTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const numero = Number(valorLimpo);
        return Number.isNaN(numero) ? null : numero;
    }

    function formatarPercentual(valorTexto) {
        let numeros = apenasNumeros(valorTexto);
        numeros = numeros.replace(/^0+/, '');
        if (!numeros) return '';
        if (Number(numeros) > 10000) numeros = '10000';
        numeros = numeros.padStart(3, '0');
        const inteiro = numeros.slice(0, -2);
        const decimal = numeros.slice(-2);
        return `${inteiro},${decimal}`;
    }

    function converterPercentual(valorTexto) {
        if (!valorTexto) return null;
        const numero = Number(valorTexto.replace('%', '').replace(',', '.'));
        return Number.isNaN(numero) ? null : numero;
    }

    function voltar() {
        navigate(-1);
    }

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');
        navigate('/login');
    }

    function formatarTipoModelo(tipo) {

        if (tipo === 'PROCURACAO') {
            return 'Procuração';
        }

        if (tipo === 'HIPOSSUFICIENCIA') {
            return 'Declaração de justiça gratuita';
        }

        if (tipo === 'CONTRATO') {
            return 'Contrato de honorários';
        }

        return tipo;
    }


    function irParaProcessos() {

        setModalDocumentosAberta(false);

        navigate('/processos');
    }


    function alternarModeloInicial(
        idModelo
    ) {

        const id =
            String(
                idModelo
            );


        setModelosSelecionados(
            anteriores => {

                if (
                    anteriores.includes(
                        id
                    )
                ) {

                    return anteriores.filter(
                        item =>
                            item !== id
                    );
                }


                return [
                    ...anteriores,
                    id
                ];
            }
        );
    }


    async function buscarModelosIniciais(
        idProcesso
    ) {

        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            deslogar();

            return;
        }


        setCarregandoModelos(
            true
        );

        setMensagemDocumentos(
            ''
        );

        setModelosSelecionados(
            []
        );


        try {

            const response =
                await fetch(

                    `${API_URL}/processo/${idProcesso}/modelos-documentos`,

                    {
                        method: 'GET',

                        credentials:
                            'include',

                        headers: {
                            'X-Access-Token':
                            token
                        }
                    }

                );


            if (
                response.status === 401
            ) {

                deslogar();

                return;
            }


            const dados =
                await response.json();


            if (!response.ok) {

                setModelosIniciais(
                    []
                );

                setMensagemDocumentos(
                    dados.error
                    ||
                    'Não foi possível carregar os modelos de documentos.'
                );

                return;
            }


            const tiposIniciais = [
                'PROCURACAO',
                'HIPOSSUFICIENCIA',
                'CONTRATO'
            ];


            const modelos =
                (
                    dados.modelos
                    ||
                    []
                ).filter(
                    modelo => {

                        const tipo =
                            String(
                                modelo.tipo
                                ||
                                ''
                            )
                                .trim()
                                .toUpperCase();


                        return (
                            modelo.ativo !== false
                            &&
                            tiposIniciais.includes(
                                tipo
                            )
                        );
                    }
                );


            setModelosIniciais(
                modelos
            );


        } catch (erro) {

            console.error(
                'Erro ao carregar modelos iniciais:',
                erro
            );


            setModelosIniciais(
                []
            );


            setMensagemDocumentos(
                'Processo cadastrado, mas não foi possível carregar os modelos de documentos.'
            );


        } finally {

            setCarregandoModelos(
                false
            );
        }
    }


    async function gerarDocumentosIniciais() {

        if (
            modelosSelecionados.length === 0
        ) {

            setMensagemDocumentos(
                'Selecione pelo menos um documento.'
            );

            return;
        }


        if (!idProcessoCriado) {

            setMensagemDocumentos(
                'Processo não encontrado.'
            );

            return;
        }


        const token =
            localStorage.getItem(
                'token'
            );


        if (!token) {

            deslogar();

            return;
        }


        setGerandoDocumentos(
            true
        );

        setMensagemDocumentos(
            ''
        );


        let quantidadeGerada = 0;


        try {

            for (
                const idModelo
                of modelosSelecionados
                ) {

                const modelo =
                    modelosIniciais.find(
                        item =>
                            String(
                                item.id
                            )
                            ===
                            String(
                                idModelo
                            )
                    );


                const response =
                    await fetch(

                        `${API_URL}/processo/${idProcessoCriado}/documentos/gerar`,

                        {
                            method: 'POST',

                            credentials:
                                'include',

                            headers: {

                                'Content-Type':
                                    'application/json',

                                'X-Access-Token':
                                token
                            },

                            body:
                                JSON.stringify({

                                    id_modelo:
                                    idModelo

                                })
                        }

                    );


                if (
                    response.status === 401
                ) {

                    deslogar();

                    return;
                }


                if (!response.ok) {

                    let dadosErro = {};


                    try {

                        dadosErro =
                            await response.json();

                    } catch {

                        dadosErro = {};

                    }


                    throw new Error(

                        dadosErro.error
                        ||
                        `Erro ao gerar ${modelo?.nome || 'documento'}.`

                    );
                }


                const arquivo =
                    await response.blob();


                const url =
                    window.URL.createObjectURL(
                        arquivo
                    );


                const nomeModelo =
                    modelo?.nome
                    ||
                    'documento';


                const nomeSeguro =
                    String(
                        nomeModelo
                    )
                        .normalize('NFD')
                        .replace(
                            /[\u0300-\u036f]/g,
                            ''
                        )
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            '_'
                        );


                const numeroSeguro =
                    String(
                        numeroProcessoCriado
                        ||
                        idProcessoCriado
                    )
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            '_'
                        );


                const link =
                    document.createElement(
                        'a'
                    );


                link.href =
                    url;


                link.download =
                    `${nomeSeguro}_${numeroSeguro}.docx`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(
                    () => {

                        window.URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );


                quantidadeGerada++;
            }


            setMensagemDocumentos(
                quantidadeGerada === 1
                    ? 'Documento gerado com sucesso!'
                    : 'Documentos gerados com sucesso!'
            );


            setTimeout(
                () => {

                    navigate(
                        '/processos'
                    );

                },
                1000
            );


        } catch (erro) {

            console.error(
                'Erro ao gerar documentos iniciais:',
                erro
            );


            setMensagemDocumentos(

                quantidadeGerada > 0

                    ? (
                        'Alguns documentos foram gerados, '
                        + 'mas ocorreu um erro: '
                        + erro.message
                    )

                    : (
                        erro.message
                        ||
                        'Erro ao gerar documentos.'
                    )

            );


        } finally {

            setGerandoDocumentos(
                false
            );
        }
    }

    function alterarProLabore(valorSelecionado) {
        setProLabore(valorSelecionado);
        setValor('');
        setQtdSalarios('');
        setValorSalario('');
        setDistribuicao('');
        setEntrada('');
        setQtdParcelas('');
        setDiaVencimento('');
        setMes('');
        setFormaPagamento('');
    }

    function alterarExito(valorSelecionado) {
        setExito(valorSelecionado);
        setQtdSalariosExito('');
        setValorSalarioExito('');
        setPercentual('');
        setDistribuicaoExito('');
        setEntradaExito('');
        setQtdParcelasExito('');
        setDiaVencimentoExito('');
        setFormaPagamentoExito('');
        setValorCausaExito('');
    }

    async function handleCadastro(e) {
        e.preventDefault();

        setMensagem('');
        setTipoMensagem('');

        if (!processo || !parteContraria) {
            mostrarMensagem('Dados do processo ou parte contrária não encontrados.');
            return;
        }

        const camposFaltando = [];

        if (proLabore === 'valor') {
            if (!valor) camposFaltando.push('Valor dos honorários');
        } else if (proLabore === 'salarios') {
            if (!qtdSalarios) camposFaltando.push('Quantidade de salários (pró-labore)');
            if (!valorSalario) camposFaltando.push('Valor do salário (pró-labore)');
        }

        if (proLabore !== '') {
            if (!distribuicao) camposFaltando.push('Distribuição de pagamento (pró-labore)');
            if (distribuicao === 'parcelado' && !qtdParcelas) camposFaltando.push('Quantidade de parcelas (pró-labore)');
            if (distribuicao === 'entrada' && !entrada) camposFaltando.push('Valor da entrada (pró-labore)');
            if (distribuicao === 'entrada' && !qtdParcelas) camposFaltando.push('Quantidade de parcelas (pró-labore)');
            if (!diaVencimento) camposFaltando.push('Dia do vencimento (pró-labore)');
            if (!mes) camposFaltando.push('Mês de início (pró-labore)');
            if (!formaPagamento) camposFaltando.push('Forma de pagamento (pró-labore)');
        }

        if (exito === 'salarios') {
            if (!qtdSalariosExito) camposFaltando.push('Quantidade de salários do êxito');
            if (!valorSalarioExito) camposFaltando.push('Valor do salário do êxito');
            if (!distribuicaoExito) camposFaltando.push('Distribuição do êxito');
            if (distribuicaoExito === 'parcelado' && !qtdParcelasExito) camposFaltando.push('Quantidade de parcelas do êxito');
            if (distribuicaoExito === 'entrada' && !entradaExito) camposFaltando.push('Valor da entrada do êxito');
            if (distribuicaoExito === 'entrada' && !qtdParcelasExito) camposFaltando.push('Quantidade de parcelas do êxito');
            if (!diaVencimentoExito) camposFaltando.push('Dia do vencimento do êxito');
            if (!formaPagamentoExito) camposFaltando.push('Forma de pagamento do êxito');
        } else if (exito === 'percentual') {
            if (!percentual) camposFaltando.push('Percentual de êxito');
            if (!distribuicaoExito) camposFaltando.push('Distribuição do êxito');
            if (distribuicaoExito === 'parcelado' && !qtdParcelasExito) camposFaltando.push('Quantidade de parcelas do êxito');
            if (distribuicaoExito === 'entrada' && !entradaExito) camposFaltando.push('Valor da entrada do êxito');
            if (distribuicaoExito === 'entrada' && !qtdParcelasExito) camposFaltando.push('Quantidade de parcelas do êxito');
            if (!diaVencimentoExito) camposFaltando.push('Dia do vencimento do êxito');
            if (!formaPagamentoExito) camposFaltando.push('Forma de pagamento do êxito');
        }

        if (camposFaltando.length > 0) {
            mostrarMensagem(`Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`);
            return;
        }

        let tipoHonorario = 'NAO_HA';
        let numeroSalarios = null;
        let valorHonorario = null;

        if (proLabore === 'valor') {
            tipoHonorario = 'REAIS';
            valorHonorario = converterDinheiro(valor);
        } else if (proLabore === 'salarios') {
            tipoHonorario = 'SALARIOS';
            numeroSalarios = Number(qtdSalarios);
            valorHonorario = converterDinheiro(valorSalario);
        }

        let tipoPagamento = null;
        if (distribuicao === 'vista') {
            tipoPagamento = 'AVISTA';
        } else if (distribuicao === 'parcelado') {
            tipoPagamento = 'PARCELADO';
        } else if (distribuicao === 'entrada') {
            tipoPagamento = 'ENTRADA_PARCELAS';
        }

        let tipoExito = null;
        let valorExito = null;

        if (exito === 'salarios') {
            tipoExito = 'SALARIOS_BENEFICIO';
            valorExito = Number(qtdSalariosExito);
        } else if (exito === 'percentual') {
            tipoExito = 'PERCENTUAL';
            valorExito = converterPercentual(percentual);
        }

        let tipoPagamentoExito = null;
        if (distribuicaoExito === 'vista') {
            tipoPagamentoExito = 'AVISTA';
        } else if (distribuicaoExito === 'parcelado') {
            tipoPagamentoExito = 'PARCELADO';
        } else if (distribuicaoExito === 'entrada') {
            tipoPagamentoExito = 'ENTRADA_PARCELAS';
        }

        const mesInicioExito = mes ? Number(mes) : null;

        const honorarios = {
            tipo_honorario: tipoHonorario,
            numero_salarios: numeroSalarios,
            valor_honorario: valorHonorario,
            tipo_pagamento: tipoPagamento,
            valor_entrada: distribuicao === 'entrada' ? converterDinheiro(entrada) : null,
            numero_parcelas: (distribuicao === 'parcelado' || distribuicao === 'entrada') ? Number(qtdParcelas) : null,
            dia_vencimento: proLabore !== '' ? Number(diaVencimento) : null,
            mes_inicio: proLabore !== '' ? Number(mes) : null,
            forma_pagamento: proLabore !== '' ? formaPagamento : null,

            tem_exito: exito !== '',
            tipo_exito: tipoExito,
            valor_exito: valorExito,
            percentual_juros: juros ? converterPercentual(juros) : null,

            distribuicao_exito: tipoPagamentoExito,
            valor_entrada_exito: distribuicaoExito === 'entrada' ? converterDinheiro(entradaExito) : null,
            numero_parcelas_exito: (distribuicaoExito === 'parcelado' || distribuicaoExito === 'entrada') ? Number(qtdParcelasExito) : null,
            dia_vencimento_exito: exito !== '' ? Number(diaVencimentoExito) : null,
            mes_inicio_exito: mesInicioExito,
            forma_pagamento_exito: exito !== '' ? formaPagamentoExito : null,
            valor_salario_exito: exito === 'salarios' ? converterDinheiro(valorSalarioExito) : null,
            valor_causa_exito: exito === 'percentual' ? (valorCausaExito ? converterDinheiro(valorCausaExito) : null) : null,
            quantidade_exito: exito === 'salarios' ? Number(qtdSalariosExito) : (exito === 'percentual' ? Number(percentual) : null)
        };

        const dadosCadastro = {
            processo: processo,
            parte_contraria: parteContraria,
            honorarios: honorarios
        };

        setCarregando(true);

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(`${API_URL}/cadastrar_processo`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(dadosCadastro)
            });

            const dados = await resposta.json();

            if (resposta.status === 401) {
                deslogar();
                return;
            }

            if (!resposta.ok) {
                mostrarMensagem(dados.error || 'Erro ao cadastrar processo.');
                return;
            }

            mostrarMensagem(dados.mensagem || 'Processo cadastrado com sucesso!', 'sucesso');

            sessionStorage.removeItem(
                'processo_temp'
            );

            sessionStorage.removeItem(
                'parte_contraria_temp'
            );

            sessionStorage.removeItem(
                'honorarios_temp'
            );


            setIdProcessoCriado(
                dados.id_processo
            );


            setNumeroProcessoCriado(
                dados.numero_processo
                ||
                processo.numero_processo
                ||
                String(
                    dados.id_processo
                )
            );


            setModalDocumentosAberta(
                true
            );


            await buscarModelosIniciais(
                dados.id_processo
            );

        } catch (erro) {
            console.error('Erro ao cadastrar processo:', erro);
            mostrarMensagem('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }

    const modelosIniciaisFiltrados =
        modelosIniciais.filter(
            modelo => {

                const termo =
                    String(
                        buscaModeloInicial
                        ||
                        ''
                    )
                        .normalize('NFD')
                        .replace(
                            /[\u0300-\u036f]/g,
                            ''
                        )
                        .toLowerCase()
                        .trim();


                const nome =
                    String(
                        modelo.nome
                        ||
                        ''
                    )
                        .normalize('NFD')
                        .replace(
                            /[\u0300-\u036f]/g,
                            ''
                        )
                        .toLowerCase();


                const tipo =
                    String(
                        formatarTipoModelo(
                            modelo.tipo
                        )
                        ||
                        ''
                    )
                        .normalize('NFD')
                        .replace(
                            /[\u0300-\u036f]/g,
                            ''
                        )
                        .toLowerCase();


                return (
                    nome.includes(
                        termo
                    )
                    ||
                    tipo.includes(
                        termo
                    )
                );
            }
        );

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />
            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button className={css.botaoVoltar} onClick={voltar} tabIndex={1} name="btnVoltar" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1 className={css.titulo}>Cadastre o pagamento</h1>
                </div>

                {mensagem && (
                    <div style={{
                        padding: '16px 24px',
                        margin: '0 auto 25px auto',
                        maxWidth: '700px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontFamily: 'Clear Sans, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.05rem',
                        backgroundColor: tipoMensagem === 'sucesso' ? '#d4edda' : '#fce8e6',
                        color: tipoMensagem === 'sucesso' ? '#155724' : '#a94442',
                        border: tipoMensagem === 'sucesso' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleCadastro}>
                    <div className={css.linha}>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Honorários pró-labore *</label>
                            <select
                                className={css.input}
                                value={proLabore}
                                onChange={(e) => alterarProLabore(e.target.value)}
                                tabIndex={2}
                                name="proLabore"
                            >
                                <option value="">Não há</option>
                                <option value="salarios">Salários</option>
                                <option value="valor">Reais</option>
                            </select>
                        </div>

                        {proLabore === 'valor' && (
                            <div className={css.campoMetade}>
                                <label className={css.label}>Valor *</label>
                                <input
                                    type="text"
                                    className={css.input}
                                    placeholder="R$ 0,00"
                                    value={valor}
                                    onChange={(e) => setValor(formatarDinheiro(e.target.value))}
                                    maxLength={25}
                                    tabIndex={3}
                                    name="valor"
                                />
                            </div>
                        )}

                        {proLabore === 'salarios' && (
                            <>
                                <div className={css.campoMetade}>
                                    <label className={css.label}>Quantidade de salários *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={css.input}
                                        placeholder="Digite a quantidade"
                                        value={qtdSalarios}
                                        onChange={(e) => setQtdSalarios(apenasNumeros(e.target.value))}
                                        tabIndex={3}
                                        name="quantidadeSalarios"
                                    />
                                </div>
                                <div className={css.campoMetade}>
                                    <label className={css.label}>Valor do salário *</label>
                                    <input
                                        type="text"
                                        className={css.input}
                                        placeholder="R$ 0,00"
                                        value={valorSalario}
                                        onChange={(e) => setValorSalario(formatarDinheiro(e.target.value))}
                                        maxLength={25}
                                        tabIndex={4}
                                        name="valorSalario"
                                    />
                                </div>
                            </>
                        )}

                        {proLabore !== '' && (
                            <>
                                <div className={css.campoMetade}>
                                    <label className={css.label}>Tipo de pagamento (pró-labore) *</label>
                                    <select
                                        className={css.input}
                                        value={distribuicao}
                                        onChange={(e) => {
                                            setDistribuicao(e.target.value);
                                            if (e.target.value === 'vista') {
                                                setQtdParcelas('');
                                                setEntrada('');
                                            }
                                            if (e.target.value === 'parcelado') {
                                                setEntrada('');
                                            }
                                        }}
                                        tabIndex={5}
                                        name="distribuicao"
                                    >
                                        <option value="" disabled>Selecionar</option>
                                        <option value="vista">À vista</option>
                                        <option value="parcelado">Parcelado</option>
                                        <option value="entrada">Entrada + parcelas</option>
                                    </select>
                                </div>

                                {distribuicao === 'entrada' && (
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Valor da entrada *</label>
                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="R$ 0,00"
                                            value={entrada}
                                            onChange={(e) => setEntrada(formatarDinheiro(e.target.value))}
                                            maxLength={25}
                                            tabIndex={6}
                                            name="valorEntrada"
                                        />
                                    </div>
                                )}

                                {(distribuicao === 'parcelado' || distribuicao === 'entrada') && (
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Qtd. parcelas *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={css.input}
                                            placeholder="Digite"
                                            value={qtdParcelas}
                                            onChange={(e) => setQtdParcelas(apenasNumeros(e.target.value))}
                                            tabIndex={7}
                                            name="qtdParcelas"
                                        />
                                    </div>
                                )}

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Dia do vencimento *</label>
                                    <select
                                        className={css.input}
                                        value={diaVencimento}
                                        onChange={(e) => setDiaVencimento(e.target.value)}
                                        tabIndex={8}
                                        name="diaVencimento"
                                    >
                                        <option value="" disabled>Dia</option>
                                        {dias.map(dia => (
                                            <option key={dia} value={dia}>{dia}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Mês de início *</label>
                                    <select
                                        className={css.input}
                                        value={mes}
                                        onChange={(e) => setMes(e.target.value)}
                                        tabIndex={9}
                                        name="mes"
                                    >
                                        <option value="" disabled>Mês</option>
                                        {meses.map(mesItem => (
                                            <option key={mesItem.valor} value={mesItem.valor}>{mesItem.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Forma de pagamento *</label>
                                    <select
                                        className={css.input}
                                        value={formaPagamento}
                                        onChange={(e) => setFormaPagamento(e.target.value)}
                                        tabIndex={10}
                                        name="formaPagamento"
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="CREDITO">Crédito</option>
                                        <option value="DEBITO">Débito</option>
                                        <option value="PIX">Pix</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className={css.campoMetade}>
                            <label className={css.label}>Honorários de êxito *</label>
                            <select
                                className={css.input}
                                value={exito}
                                onChange={(e) => alterarExito(e.target.value)}
                                tabIndex={11}
                                name="honorariosExito"
                            >
                                <option value="">Não há</option>
                                <option value="salarios">Salários de benefício</option>
                                <option value="percentual">Percentual</option>
                            </select>
                        </div>

                        {exito === 'salarios' && (
                            <>
                                <div className={css.campoMetade}>
                                    <label className={css.label}>Quantidade de salários *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={css.input}
                                        placeholder="Digite"
                                        value={qtdSalariosExito}
                                        onChange={(e) => setQtdSalariosExito(apenasNumeros(e.target.value))}
                                        tabIndex={12}
                                        name="quantidadeSalariosExito"
                                    />
                                </div>

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Valor do salário *</label>
                                    <input
                                        type="text"
                                        className={css.input}
                                        placeholder="R$ 0,00"
                                        value={valorSalarioExito}
                                        onChange={(e) => setValorSalarioExito(formatarDinheiro(e.target.value))}
                                        maxLength={25}
                                        tabIndex={13}
                                        name="valor_salario_exito"
                                    />
                                </div>
                            </>
                        )}



                        {exito !== '' && (
                            <>
                                <div className={css.campoMetade}>
                                    <label className={css.label}>Tipo de pagamento (êxito) *</label>
                                    <select
                                        className={css.input}
                                        value={distribuicaoExito}
                                        onChange={(e) => {
                                            setDistribuicaoExito(e.target.value);
                                            if (e.target.value === 'vista') {
                                                setQtdParcelasExito('');
                                                setEntradaExito('');
                                            }
                                            if (e.target.value === 'parcelado') {
                                                setEntradaExito('');
                                            }
                                        }}
                                        tabIndex={14}
                                        name="distribuicaoExito"
                                    >
                                        <option value="" disabled>Selecionar</option>
                                        <option value="vista">À vista</option>
                                        <option value="parcelado">Parcelado</option>
                                        <option value="entrada">Entrada + parcelas</option>
                                    </select>
                                </div>

                                {distribuicaoExito === 'entrada' && (
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Valor da entrada (êxito) *</label>
                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="R$ 0,00"
                                            value={entradaExito}
                                            onChange={(e) => setEntradaExito(formatarDinheiro(e.target.value))}
                                            maxLength={25}
                                            tabIndex={15}
                                            name="valorEntradaExito"
                                        />
                                    </div>
                                )}

                                {(distribuicaoExito === 'parcelado' || distribuicaoExito === 'entrada') && (
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Qtd. parcelas (êxito) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={css.input}
                                            placeholder="Digite"
                                            value={qtdParcelasExito}
                                            onChange={(e) => setQtdParcelasExito(apenasNumeros(e.target.value))}
                                            tabIndex={16}
                                            name="qtdParcelasExito"
                                        />
                                    </div>
                                )}

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Dia do vencimento (êxito) *</label>
                                    <select
                                        className={css.input}
                                        value={diaVencimentoExito}
                                        onChange={(e) => setDiaVencimentoExito(e.target.value)}
                                        tabIndex={17}
                                        name="diaVencimentoExito"
                                    >
                                        <option value="" disabled>Dia</option>
                                        {dias.map(dia => (
                                            <option key={dia} value={dia}>{dia}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={css.campoMetade}>
                                    <label className={css.label}>Forma de pagamento (êxito) *</label>
                                    <select
                                        className={css.input}
                                        value={formaPagamentoExito}
                                        onChange={(e) => setFormaPagamentoExito(e.target.value)}
                                        tabIndex={18}
                                        name="formaPagamentoExito"
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="CREDITO">Crédito</option>
                                        <option value="DEBITO">Débito</option>
                                        <option value="PIX">Pix</option>
                                    </select>
                                </div>

                                {exito === 'percentual' && (
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Valor da causa (para percentual)</label>
                                        <input
                                            type="text"
                                            className={css.input}
                                            placeholder="R$ 0,00"
                                            value={valorCausaExito}
                                            onChange={(e) => setValorCausaExito(formatarDinheiro(e.target.value))}
                                            maxLength={25}
                                            tabIndex={19}
                                            name="valorCausaExito"
                                        />
                                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                            Se não preencher, será usado R$ 45.000,00
                                        </small>
                                    </div>
                                )}
                            </>
                        )}



                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button
                            className={css.botaoCadastro}
                            type="submit"
                            disabled={carregando}
                            tabIndex={21}
                            name="btnCadastrar"
                        >
                            {carregando ? 'Cadastrando...' : 'Cadastrar processo'}
                        </button>
                    </div>
                </form>
            </section>


            {
                modalDocumentosAberta
                &&
                (
                    <div
                        className={
                            css.modalDocumentosOverlay
                        }
                    >

                        <div
                            className={
                                css.modalDocumentos
                            }
                        >

                            <button
                                type="button"
                                className={
                                    css.modalDocumentosFechar
                                }
                                onClick={
                                    irParaProcessos
                                }
                                disabled={
                                    gerandoDocumentos
                                }
                                aria-label="Fechar"
                            >
                                ✕
                            </button>


                            <h2
                                className={
                                    css.modalDocumentosTitulo
                                }
                            >
                                Gostaria de gerar
                                arquivos iniciais?
                            </h2>

                            <div
                                className={
                                    css.buscaModeloInicialContainer
                                }
                            >

                                <input
                                    type="text"
                                    className={
                                        css.buscaModeloInicial
                                    }
                                    placeholder="Pesquisar documento..."
                                    value={
                                        buscaModeloInicial
                                    }
                                    onChange={
                                        (e) =>
                                            setBuscaModeloInicial(
                                                e.target.value
                                            )
                                    }
                                    disabled={
                                        gerandoDocumentos
                                    }
                                />


                                <svg
                                    className={
                                        css.iconeBuscaModeloInicial
                                    }
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#8a8a8a"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="8"
                                    />

                                    <line
                                        x1="21"
                                        y1="21"
                                        x2="16.65"
                                        y2="16.65"
                                    />
                                </svg>

                            </div>


                            {
                                carregandoModelos
                                    ? (
                                        <div
                                            className={
                                                css.estadoModelosIniciais
                                            }
                                        >
                                            Carregando modelos...
                                        </div>
                                    )

                                    : modelosIniciaisFiltrados.length === 0
                                        ? (
                                            <div
                                                className={
                                                    css.estadoModelosIniciais
                                                }
                                            >

                                                <p>
                                                    Nenhum modelo de documento
                                                    inicial está disponível
                                                    para este processo.
                                                </p>

                                            </div>
                                        )

                                        : (
                                            <div
                                                className={
                                                    css.listaModelosIniciais
                                                }
                                            >

                                                {
                                                    modelosIniciaisFiltrados.map(
                                                        modelo => (

                                                            <label
                                                                key={
                                                                    modelo.id
                                                                }
                                                                className={
                                                                    css.itemModeloInicial
                                                                }
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    className={
                                                                        css.checkboxModeloInicial
                                                                    }
                                                                    checked={
                                                                        modelosSelecionados.includes(
                                                                            String(
                                                                                modelo.id
                                                                            )
                                                                        )
                                                                    }
                                                                    onChange={
                                                                        () =>
                                                                            alternarModeloInicial(
                                                                                modelo.id
                                                                            )
                                                                    }
                                                                    disabled={
                                                                        gerandoDocumentos
                                                                    }
                                                                />


                                                                <div
                                                                    className={
                                                                        css.textoModeloInicial
                                                                    }
                                                                >

                                                                    <span
                                                                        className={
                                                                            css.nomeModeloInicial
                                                                        }
                                                                    >
                                                                        {
                                                                            modelo.nome
                                                                        }
                                                                    </span>


                                                                    <span
                                                                        className={
                                                                            css.tipoModeloInicial
                                                                        }
                                                                    >
                                                                        {
                                                                            formatarTipoModelo(
                                                                                modelo.tipo
                                                                            )
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </label>

                                                        )
                                                    )
                                                }

                                            </div>
                                        )
                            }


                            {
                                mensagemDocumentos
                                &&
                                (
                                    <p
                                        className={
                                            css.mensagemDocumentos
                                        }
                                    >
                                        {
                                            mensagemDocumentos
                                        }
                                    </p>
                                )
                            }


                            <div
                                className={
                                    css.modalDocumentosAcoes
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        css.botaoGerarArquivos
                                    }
                                    onClick={
                                        gerarDocumentosIniciais
                                    }
                                    disabled={
                                        gerandoDocumentos
                                        ||
                                        carregandoModelos
                                        ||
                                        modelosIniciais.length === 0
                                    }
                                >
                                    {
                                        gerandoDocumentos
                                            ? 'Gerando...'
                                            : 'Gerar arquivos'
                                    }
                                </button>


                                <button
                                    type="button"
                                    className={
                                        css.botaoAgoraNao
                                    }
                                    onClick={
                                        irParaProcessos
                                    }
                                    disabled={
                                        gerandoDocumentos
                                    }
                                >
                                    Agora não
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }


            <Footer />

        </div>
    );
}
