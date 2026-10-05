import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import css from './ChatVeritas.module.css';

const MENSAGEM_INICIAL = {
    id: 1,
    autor: 'veritas',
    texto: 'Olá! Sou a Veritas.AI. Posso ajudar com perguntas jurídicas e com estes serviços:\n\n1. Consultar, criar, editar, confirmar, recusar e desmarcar agendamentos.\n2. Localizar clientes e advogados parceiros por nome, CPF, CNPJ ou e-mail.\n3. Listar seus clientes e advogados parceiros.\n4. Consultar processos e cadastrar atualizações de processos ou projetos.\n5. Preparar o download do relatório em PDF de um processo.\n\nComo posso ajudar?'
};

function formatarTexto(texto) {
    return String(texto || '').split(/(\*\*[^*]+\*\*)/g).map((parte, index) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
            return <strong key={index}>{parte.slice(2, -2)}</strong>;
        }

        return parte;
    });
}

export default function ChatVeritas({ aberto, onFechar, api }) {
    const API_URL = api || ' http://10.92.11.26:5000';

    const [mensagens, setMensagens] = useState(() => {
        const idUsuario = localStorage.getItem('id_usuario');

        if (!idUsuario) return [MENSAGEM_INICIAL];

        try {
            const salvo = JSON.parse(localStorage.getItem(`veritas_historico_${idUsuario}`));
            if (!Array.isArray(salvo) || !salvo.length) {
                return [MENSAGEM_INICIAL];
            }

            const somenteMensagemInicial = salvo.length === 1 && salvo[0]?.id === 1 && salvo[0]?.autor === 'veritas';
            return somenteMensagemInicial ? [MENSAGEM_INICIAL] : salvo;
        } catch {
            return [MENSAGEM_INICIAL];
        }
    });
    const [input, setInput] = useState('');
    const [digitando, setDigitando] = useState(false);
    const [executandoAcao, setExecutandoAcao] = useState(false);
    const [gravandoAudio, setGravandoAudio] = useState(false);
    const [vozAtivada, setVozAtivada] = useState(() => {
        return localStorage.getItem('veritas_voz_ativada') === 'true';
    });
    const [velocidadeVoz, setVelocidadeVoz] = useState(() => {
        return Number(localStorage.getItem('veritas_velocidade_voz')) || 1.15;
    });
    const fimRef = useRef(null);
    const reconhecimentoRef = useRef(null);
    const primeiraLeituraRef = useRef(true);
    const ultimaMensagemLidaRef = useRef(null);

    useEffect(() => {
        if (fimRef.current) {
            fimRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensagens, digitando]);

    useEffect(() => {
        const idUsuario = localStorage.getItem('id_usuario');

        if (!idUsuario) return;

        const historico = mensagens.slice(-24).map(({ id, autor, texto }) => ({
            id,
            autor,
            texto
        }));

        localStorage.setItem(`veritas_historico_${idUsuario}`, JSON.stringify(historico));
    }, [mensagens]);

    useEffect(() => {
        if (!aberto) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, [aberto]);

    useEffect(() => () => {
        reconhecimentoRef.current?.stop();
        window.speechSynthesis?.cancel();
    }, []);

    useEffect(() => {
        localStorage.setItem('veritas_voz_ativada', String(vozAtivada));
        if (!vozAtivada) window.speechSynthesis?.cancel();
    }, [vozAtivada]);

    useEffect(() => {
        localStorage.setItem('veritas_velocidade_voz', String(velocidadeVoz));
    }, [velocidadeVoz]);

    useEffect(() => {
        const ultimaMensagem = mensagens[mensagens.length - 1];
        if (primeiraLeituraRef.current) {
            primeiraLeituraRef.current = false;
            ultimaMensagemLidaRef.current = ultimaMensagem?.id;
            return;
        }
        if (!vozAtivada || ultimaMensagem?.autor !== 'veritas' || ultimaMensagem.id === ultimaMensagemLidaRef.current) return;

        ultimaMensagemLidaRef.current = ultimaMensagem.id;
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(ultimaMensagem.texto.replace(/\*\*/g, ''));
        fala.lang = 'pt-BR';
        fala.rate = velocidadeVoz;
        fala.pitch = 1.12;
        const vozes = window.speechSynthesis.getVoices();
        fala.voice = vozes.find(voz => (
            voz.lang.toLowerCase().startsWith('pt-br')
            && /(female|feminina|maria|francisca|helena|luciana|google portugu)/i.test(voz.name)
        )) || vozes.find(voz => voz.lang.toLowerCase().startsWith('pt-br')) || null;
        window.speechSynthesis.speak(fala);
    }, [mensagens, vozAtivada, velocidadeVoz]);

    function apagarHistorico() {
        const idUsuario = localStorage.getItem('id_usuario');

        if (idUsuario) {
            localStorage.removeItem(`veritas_historico_${idUsuario}`);
        }

        setMensagens([MENSAGEM_INICIAL]);
    }

    async function enviarMensagem(e, textoTranscrito = null) {
        e?.preventDefault();

        const texto = (textoTranscrito ?? input).trim();

        if (!texto || digitando) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now(),
                    autor: 'veritas',
                    texto: 'Sua sessao expirou ou voce nao esta logado. Faca login novamente para falar com a Veritas.'
                }
            ]);
            return;
        }

        setMensagens(prev => [
            ...prev,
            {
                id: Date.now(),
                autor: 'usuario',
                texto
            }
        ]);
        setInput('');
        setDigitando(true);
        const inicioRequisicao = performance.now();
        let diagnosticoTempo = null;

        try {
            const resposta = await fetch(`${API_URL}/ai/veritas`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({
                    pergunta: texto,
                    historico: mensagens.slice(-12).map(msg => ({
                        role: msg.autor === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    }))
                })
            });

            let dados = {};

            try {
                dados = await resposta.json();
            } catch {
                dados = {};
            }
            diagnosticoTempo = dados.diagnostico_tempo || null;

            if (resposta.status === 401) {
                localStorage.removeItem('nome');
                localStorage.removeItem('tipo');
                localStorage.removeItem('token');
                localStorage.removeItem('id_usuario');

                setMensagens(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        autor: 'veritas',
                        texto: 'Sua sessao expirou. Faca login novamente para continuar.'
                    }
                ]);
                return;
            }

            if (!resposta.ok) {
                throw new Error(dados.error || 'Erro ao consultar a Veritas.');
            }

            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    autor: 'veritas',
                    texto: dados.resposta || 'Nao consegui gerar uma resposta agora.',
                    acao: dados.acao_proposta || null
                }
            ]);

        } catch (erro) {
            console.error('Erro ao consultar Veritas:', erro);

            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    autor: 'veritas',
                    texto: 'Nao consegui conectar com a Veritas agora. Verifique se a API esta rodando e tente novamente.'
                }
            ]);

        } finally {
            const totalMs = Math.round(performance.now() - inicioRequisicao);
            console.info('Veritas: tempo da requisição', {
                navegador_ms: totalMs,
                servidor: diagnosticoTempo
            });
            setDigitando(false);
        }
    }

    function gravarAudio() {
        window.speechSynthesis?.cancel();

        if (gravandoAudio) {
            reconhecimentoRef.current?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMensagens(prev => [...prev, {
                id: Date.now(), autor: 'veritas',
                texto: 'O reconhecimento de voz nao e compativel com este navegador. Use Chrome ou Edge para gravar mensagens.'
            }]);
            return;
        }

        const reconhecimento = new SpeechRecognition();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.continuous = false;
        reconhecimento.interimResults = true;
        reconhecimentoRef.current = reconhecimento;
        let textoFinal = '';

        reconhecimento.onstart = () => setGravandoAudio(true);
        reconhecimento.onresult = evento => {
            let textoParcial = '';
            for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
                const resultado = evento.results[indice];
                if (resultado.isFinal) textoFinal += resultado[0].transcript;
                else textoParcial += resultado[0].transcript;
            }
            setInput((textoFinal || textoParcial).trim());
        };
        reconhecimento.onerror = evento => {
            if (evento.error !== 'aborted' && evento.error !== 'no-speech') {
                setMensagens(prev => [...prev, {
                    id: Date.now(), autor: 'veritas',
                    texto: 'Nao foi possivel reconhecer o audio. Verifique a permissao do microfone e tente novamente.'
                }]);
            }
        };
        reconhecimento.onend = () => {
            setGravandoAudio(false);
            reconhecimentoRef.current = null;
            if (textoFinal.trim()) enviarMensagem(null, textoFinal);
        };
        reconhecimento.start();
    }

    async function confirmarAcao(idMensagem, acao) {
        const token = localStorage.getItem('token');

        if (!token || !acao || executandoAcao) return;

        setExecutandoAcao(true);

        try {
            if (acao.tipo === 'verificar_exito') {
                const resposta = await fetch(`${API_URL}${acao.endpoint}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });
                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    throw new Error(dados.error || 'Não foi possível consultar os honorários de êxito.');
                }

                const exito = dados.dados || {};
                const possuiExito = Boolean(exito.tipo_pagamento || exito.tipo_exito);
                const dinheiro = (valor) => valor === null || valor === undefined || valor === ''
                    ? 'Não informado'
                    : Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const tipoExito = {
                    SALARIOS_BENEFICIO: 'Salários de benefício',
                    PERCENTUAL: 'Percentual'
                }[exito.tipo_pagamento || exito.tipo_exito] || 'Não informado';
                const distribuicao = {
                    AVISTA: 'À vista',
                    PARCELADO: 'Parcelado',
                    ENTRADA_PARCELAS: 'Entrada + parcelas',
                    RETIDO_FONTE: 'Retido na fonte'
                }[exito.distribuicao] || 'Não informado';
                const detalhesExito = [
                    `Tipo de êxito: ${tipoExito}`,
                    `Quantidade de salários: ${exito.quantidade || 'Não informado'}`,
                    `Valor do salário: ${dinheiro(exito.valor_salario)}`,
                    `Percentual de êxito: ${exito.valor_exito ? `${exito.valor_exito}%` : 'Não informado'}`,
                    `Valor da causa: ${dinheiro(exito.valor_causa)}`,
                    `Distribuição: ${distribuicao}`,
                    `Valor da entrada: ${dinheiro(exito.valor_entrada)}`,
                    `Número de parcelas: ${exito.num_parcelas || 'Não informado'}`,
                    `Dia de vencimento: ${exito.dia_vencimento || 'Não informado'}`,
                    `Mês de início: ${exito.mes_inicio || 'Não informado'}`,
                    `Forma de pagamento: ${exito.forma_pagamento || 'Não informado'}`
                ].map((linha, indice) => `${indice + 1}. ${linha}`).join('\n');
                setMensagens(prev => prev.map(msg => (
                    msg.id === idMensagem ? { ...msg, acao: null } : msg
                )));
                setMensagens(prev => [...prev, {
                    id: Date.now(),
                    autor: 'veritas',
                    texto: possuiExito
                        ? `Os honorários de êxito atuais são:\n\n${detalhesExito}\n\nInforme apenas os campos que deseja alterar antes de concluir o processo.`
                        : 'Não há honorários de êxito cadastrados para este processo. Nenhuma configuração de êxito será exigida para a conclusão.'
                }]);
                return;
            }

            if (acao.tipo === 'baixar_relatorio' || acao.tipo === 'baixar_pdf_log' || acao.tipo === 'baixar_relatorio_agendamentos') {
                const resposta = await fetch(`${API_URL}${acao.endpoint}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });

                if (!resposta.ok) {
                    const dados = await resposta.json().catch(() => ({}));
                    throw new Error(dados.error || 'Nao foi possivel gerar o relatorio.');
                }

                const arquivo = await resposta.blob();
                const url = URL.createObjectURL(arquivo);
                const link = document.createElement('a');
                const nomeArquivo = resposta.headers
                    .get('Content-Disposition')
                    ?.match(/filename="?([^";]+)"?/)?.[1] || (
                        acao.tipo === 'baixar_pdf_log' ? 'log-escritorio.pdf'
                            : acao.tipo === 'baixar_relatorio_agendamentos' ? 'relatorio-agendamentos.pdf'
                                : 'relatorio_processo.pdf'
                    );

                link.href = url;
                link.download = nomeArquivo;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setMensagens(prev => prev.map(msg => (
                    msg.id === idMensagem ? { ...msg, acao: null } : msg
                )));
                setMensagens(prev => [...prev, {
                    id: Date.now(),
                    autor: 'veritas',
                    texto: acao.tipo === 'baixar_pdf_log'
                        ? 'O download do PDF do Log foi iniciado.'
                        : acao.tipo === 'baixar_relatorio_agendamentos'
                            ? 'O download do relatório de agendamentos foi iniciado.'
                            : 'O download do relatorio foi iniciado.'
                }]);
                return;
            }

            const resposta = await fetch(`${API_URL}${acao.endpoint}`, {
                method: acao.metodo,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(acao.dados)
            });
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(dados.error || 'Não foi possível concluir o agendamento.');
            }

            setMensagens(prev => prev.map(msg => (
                msg.id === idMensagem ? { ...msg, acao: null } : msg
            )));
            setMensagens(prev => [...prev, {
                id: Date.now(),
                autor: 'veritas',
                texto: dados.mensagem || dados.message || 'Agendamento atualizado com sucesso.'
            }]);
        } catch (erro) {
            setMensagens(prev => [...prev, {
                id: Date.now(),
                autor: 'veritas',
                texto: erro.message || 'Não foi possível concluir a ação.'
            }]);
        } finally {
            setExecutandoAcao(false);
        }
    }

    if (!aberto) return null;

    return createPortal(
        <div className={css.overlay} onClick={onFechar}>
            <div className={css.chat} onClick={e => e.stopPropagation()}>
                <header className={css.header}>
                    <div className={css.headerInfo}>
                        <img
                            src="/veritas.png"
                            alt="Veritas.AI"
                            className={css.avatarHeader}
                        />
                        <h3>Veritas.AI</h3>
                    </div>
                    <div className={css.acoesCabecalho}>
                        <button
                            type="button"
                            className={`${css.botaoVoz} ${vozAtivada ? css.botaoVozAtiva : ''}`}
                            onClick={() => setVozAtivada(ativa => !ativa)}
                            aria-label={vozAtivada ? 'Desligar voz da Veritas' : 'Ligar voz da Veritas'}
                            title={vozAtivada ? 'Desligar voz da Veritas' : 'Ligar voz da Veritas'}
                        >
                            {vozAtivada ? 'Voz ligada' : 'Voz desligada'}
                        </button>
                        <label className={css.controleVelocidade} title="Velocidade da voz">
                            <span>Velocidade</span>
                            <select
                                value={velocidadeVoz}
                                onChange={e => setVelocidadeVoz(Number(e.target.value))}
                                disabled={!vozAtivada}
                                aria-label="Velocidade da voz"
                            >
                                <option value={0.9}>0,9x</option>
                                <option value={1}>1x</option>
                                <option value={1.15}>1,15x</option>
                                <option value={1.3}>1,3x</option>
                                <option value={1.5}>1,5x</option>
                                <option value={1.75}>1,75x</option>
                                <option value={2}>2x</option>
                            </select>
                        </label>
                        <button
                            type="button"
                            className={css.botaoLimparHistorico}
                            onClick={apagarHistorico}
                            aria-label="Apagar histórico da conversa"
                            title="Apagar histórico"
                        >
                            Limpar
                        </button>
                        <button
                            className={css.botaoFechar}
                            onClick={onFechar}
                            aria-label="Fechar chat"
                        >
                            &#10005;
                        </button>
                    </div>
                </header>

                <div className={css.mensagens}>
                    {mensagens.map(msg => (
                        <div
                            key={msg.id}
                            className={`${css.mensagem} ${
                                msg.autor === 'usuario' ? css.mensagemUsuario : css.mensagemVeritas
                            }`}
                        >
                            {msg.autor === 'veritas' && (
                                <img
                                    src="/veritas.png"
                                    alt="Veritas"
                                    className={css.avatarMensagem}
                                />
                            )}
                            <div className={css.balao}>
                                {formatarTexto(msg.texto)}
                                {msg.acao && (
                                    <div className={css.acaoProposta}>
                                        <strong>Ação proposta</strong>
                                        <span>{formatarTexto(msg.acao.descricao)}</span>
                                        <button
                                            type="button"
                                            className={css.botaoConfirmarAcao}
                                            onClick={() => confirmarAcao(msg.id, msg.acao)}
                                            disabled={executandoAcao}
                                        >
                                            {executandoAcao
                                                ? 'Executando...'
                                                : (msg.acao.tipo === 'baixar_relatorio' || msg.acao.tipo === 'baixar_pdf_log' || msg.acao.tipo === 'baixar_relatorio_agendamentos')
                                                    ? 'Baixar PDF'
                                                    : 'Confirmar ação'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {digitando && (
                        <div className={`${css.mensagem} ${css.mensagemVeritas}`}>
                            <img
                                src="/veritas.png"
                                alt="Veritas"
                                className={css.avatarMensagem}
                            />
                            <div className={css.balao}>
                                <span className={css.digitando}>
                                    <span></span><span></span><span></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={fimRef} />
                </div>

                <form className={css.formulario} onSubmit={enviarMensagem}>
                    <button
                        type="button"
                        className={`${css.botaoMicrofone} ${gravandoAudio ? css.botaoMicrofoneGravando : ''}`}
                        onClick={gravarAudio}
                        aria-label={gravandoAudio ? 'Parar gravacao' : 'Gravar mensagem por voz'}
                        title={gravandoAudio ? 'Parar gravacao' : 'Gravar mensagem por voz'}
                        disabled={digitando || executandoAcao}
                    >
                        <img src="/microfone.png" alt="" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Pergunte algo ao Veritas.AI..."
                        className={css.input}
                        disabled={digitando || executandoAcao}
                    />
                    <button
                        type="submit"
                        className={css.botaoEnviar}
                        aria-label="Enviar"
                        disabled={digitando || executandoAcao || !input.trim()}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
