import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from 'socket.io-client';
import css from './Chats1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

function decodificarToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) { return null; }
}

export default function Chats1({ api }) {
    const api_url = api || "http://10.92.11.28:5000";
    const navigate = useNavigate();
    const location = useLocation();

    const [autorizado, setAutorizado] = useState(false);
    const [usuarioTipo, setUsuarioTipo] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [menuColapsado, setMenuColapsado] = useState(false);

    const [aba, setAba] = useState("conversas");
    const [contatos, setContatos] = useState([]);
    const [carregandoContatos, setCarregandoContatos] = useState(false);

    const [conversas, setConversas] = useState([]);
    const [carregandoConversas, setCarregandoConversas] = useState(true);
    const [conversaSelecionada, setConversaSelecionada] = useState(null);

    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [msgTexto, setMsgTexto] = useState('');
    const [msgTipo, setMsgTipo] = useState('');
    const [iniciando, setIniciando] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const mensagensEndRef = useRef(null);
    const socketRef = useRef(null);
    const mensagemIdsRef = useRef(new Set());
    const mensagensContainerRef = useRef(null);

    const conversaRef = useRef(null);
    const usuarioIdRef = useRef(null);

    useEffect(() => {
        conversaRef.current = conversaSelecionada;
    }, [conversaSelecionada]);

    useEffect(() => {
        usuarioIdRef.current = usuarioId;
    }, [usuarioId]);

    const scrollToBottom = () => {
        if (mensagensContainerRef.current) {
            mensagensContainerRef.current.scrollTop = mensagensContainerRef.current.scrollHeight;
        }
    };

    const atualizarUrl = (contatoId) => {
        if (contatoId) {
            navigate(`/chats?contato=${contatoId}`, { replace: false });
        } else {
            navigate('/chats', { replace: false });
        }
    };

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
        if (conversas.length > 0) {
            const params = new URLSearchParams(location.search);
            const conversaId = params.get('conversa');
            const contatoId = params.get('contato');

            if (conversaId) {
                const conversa = conversas.find(c => c.conversa_id === parseInt(conversaId));
                if (conversa) {
                    setConversaSelecionada(prev => (prev && prev.conversa_id === conversa.conversa_id) ? prev : conversa);
                }
            } else if (contatoId) {
                const conversaExistente = conversas.find(c => c.usuario_id === parseInt(contatoId));
                if (conversaExistente) {
                    setConversaSelecionada(prev => (prev && prev.conversa_id === conversaExistente.conversa_id) ? prev : conversaExistente);
                } else {
                    iniciarConversaAutomatica(parseInt(contatoId));
                }
            }
        }
    }, [conversas, location.search, usuarioTipo]);

    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        const token = getToken();
        if (!token || !autorizado) return;

        const socket = io(api_url, {
            transports: ['polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1500,
            timeout: 20000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setSocketConnected(true);
            socket.emit('authenticate', { token });
        });

        socket.on('disconnect', () => {
            setSocketConnected(false);
        });

        socket.on('connect_error', () => {
            setSocketConnected(false);
        });

        socket.on('authenticated', () => {});

        socket.on('new_message', (data) => {
            const conversaAtual = conversaRef.current;
            const meuId = usuarioIdRef.current;

            if (conversaAtual && data.conversa_id === conversaAtual.conversa_id) {
                if (!mensagemIdsRef.current.has(data.id)) {
                    mensagemIdsRef.current.add(data.id);
                    setMensagens(prev => {
                        const existe = prev.some(msg => msg.id === data.id);
                        if (!existe) {
                            const listaFiltrada = data.remetente_id === meuId
                                ? prev.filter(msg => !msg.isTemp)
                                : prev;

                            return [...listaFiltrada, {
                                id: data.id,
                                remetente_id: data.remetente_id,
                                mensagem: data.mensagem,
                                data: data.data,
                                is_meu_envio: data.remetente_id === meuId
                            }].sort((a, b) => a.id - b.id);
                        }
                        return prev;
                    });
                }
            }

            setConversas(prev => {
                const conversaAtualizada = prev.find(c => c.conversa_id === data.conversa_id);
                if (conversaAtualizada) {
                    const outras = prev.filter(c => c.conversa_id !== data.conversa_id);
                    return [{ ...conversaAtualizada, ultimo_texto: data.mensagem.substring(0, 35) }, ...outras];
                }
                return prev;
            });
        });

        socket.on('error', (data) => {
            setMsgTexto(data.error || 'Erro na conexão do chat');
            setMsgTipo('erro');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [api_url, autorizado]);

    useEffect(() => {
        if (socketConnected && conversaSelecionada && socketRef.current) {
            socketRef.current.emit('join_conversa', {
                conversa_id: conversaSelecionada.conversa_id
            });
        }
    }, [socketConnected, conversaSelecionada]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            localStorage.setItem('sessaoExpirada', 'Sua sessão expirou. Faça login novamente.');
            navigate('/login');
            return;
        }

        const tokenData = decodificarToken(token);
        if (!tokenData) {
            navigate('/login');
            return;
        }

        if (tokenData.exp) {
            const agora = Math.floor(Date.now() / 1000);
            if (tokenData.exp < agora) {
                localStorage.clear();
                navigate('/login');
                return;
            }
        }

        if (tokenData.tipo !== 0 && tokenData.tipo !== 2 && tokenData.tipo !== 3) {
            setMsgTexto('Acesso não permitido ao chat');
            setMsgTipo('erro');
            setTimeout(() => {
                navigate('/dashboard_advogado');
            }, 3000);
            return;
        }

        setAutorizado(true);
        setUsuarioTipo(tokenData.tipo);
        setUsuarioId(tokenData.id_usuarios);

        if (tokenData.tipo === 0 && tokenData.id_usuarios) {
            setFotoPerfil(`${api_url}/uploads/Usuarios/${tokenData.id_usuarios}.jpeg`);
        }

        carregarConversas(token);
    }, []);

    useEffect(() => {
        if (conversaSelecionada) {
            setMensagens([]);
            mensagemIdsRef.current.clear();
            carregarMensagens(conversaSelecionada.conversa_id);
        }
    }, [conversaSelecionada]);

    useEffect(() => {
        if (mensagens.length > 0) {
            const timerId = setTimeout(() => {
                scrollToBottom();
            }, 50);
            return () => clearTimeout(timerId);
        }
    }, [mensagens]);

    useEffect(() => {
        if (aba === 'novo' && contatos.length === 0 && !carregandoContatos) {
            carregarContatos();
        }
    }, [aba]);

    async function carregarConversas(tokenParam) {
        const token = tokenParam || getToken();
        if (!token) return;

        try {
            const response = await fetch(`${api_url}/dm/listar_conversas?token=${token}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversas(data.conversas || []);
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        } finally {
            setCarregandoConversas(false);
        }
    }

    async function carregarContatos() {
        const token = getToken();
        if (!token) return;

        setCarregandoContatos(true);
        try {
            const rota = usuarioTipo === 0 ? '/clientes' : '/dm/advogados_disponiveis';
            const response = await fetch(`${api_url}${rota}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.ok) {
                const data = await response.json();
                const lista = data.clientes || data.advogados || [];
                setContatos(lista);
            }
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
        } finally {
            setCarregandoContatos(false);
        }
    }

    async function carregarMensagens(conversaId, silencioso = false) {
        const token = getToken();
        if (!token) return;

        try {
            if (!silencioso) setCarregandoMensagens(true);
            const response = await fetch(`${api_url}/dm/mensagens/${conversaId}?token=${token}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                }
            });

            if (response.ok) {
                const data = await response.json();
                const mensagensCarregadas = data.mensagens || [];
                mensagensCarregadas.forEach(msg => mensagemIdsRef.current.add(msg.id));

                setMensagens(mensagensCarregadas.sort((a, b) => a.id - b.id));
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        } finally {
            if (!silencioso) setCarregandoMensagens(false);
        }
    }

    async function iniciarConversaAutomatica(contatoId) {
        const token = getToken();
        if (!token) return;

        setIniciando(true);
        try {
            const response = await fetch(`${api_url}/dm/iniciar_conversa/${contatoId}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                }
            });

            if (response.ok) {
                await carregarConversas();
                setTimeout(async () => {
                    await carregarConversas();
                    const novaConversa = conversas.find(c => c.usuario_id === contatoId);
                    if (novaConversa) {
                        setConversaSelecionada(novaConversa);
                        setAba('conversas');
                        atualizarUrl(contatoId);
                    }
                }, 500);
            } else {
                const data = await response.json();
                setMsgTexto(data.error || 'Erro ao iniciar conversa');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMsgTexto('Erro de conexão');
            setMsgTipo('erro');
        } finally {
            setIniciando(false);
        }
    }

    function voltarParaConversas() {
        setConversaSelecionada(null);
        mensagemIdsRef.current.clear();
        navigate('/chats', { replace: true });
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    };

    async function enviarMensagem() {
        if (!novaMensagem.trim()) return;
        if (!conversaSelecionada) return;

        const token = getToken();
        if (!token) {
            setMsgTexto('Token não encontrado. Faça login novamente.');
            setMsgTipo('erro');
            return;
        }

        const mensagemTexto = novaMensagem.trim();

        const mensagemTemp = {
            id: Date.now(),
            remetente_id: usuarioId,
            mensagem: mensagemTexto,
            data: new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            is_meu_envio: true,
            isTemp: true
        };

        setMensagens(prev => [...prev, mensagemTemp]);
        setNovaMensagem('');
        setEnviando(true);

        try {
            const response = await fetch(`${api_url}/dm/enviar_mensagem/${conversaSelecionada.conversa_id}?token=${token}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({ mensagem: mensagemTexto })
            });

            if (response.ok) {
                await carregarMensagens(conversaSelecionada.conversa_id, true);
                await carregarConversas();
            } else {
                setMensagens(prev => prev.filter(msg => msg.id !== mensagemTemp.id));
                const data = await response.json();
                setMsgTexto(data.error || 'Erro ao enviar mensagem');
                setMsgTipo('erro');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMensagens(prev => prev.filter(msg => msg.id !== mensagemTemp.id));
            setMsgTexto('Erro de conexão. Tente novamente.');
            setMsgTipo('erro');
        } finally {
            setEnviando(false);
        }
    }

    function getImagemUrl(id) {
        return `${api_url}/uploads/Usuarios/${id}.jpeg`;
    }

    function iniciais(nome) {
        if (!nome) return '?';
        return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }

    if (!autorizado) return null;

    const idsComConversa = new Set(conversas.map(c => c.usuario_id));
    const contatosSemConversa = contatos.filter(c => !idsComConversa.has(c.id));

    return (
        <div className={css.paginaCompleta}>
            <Header api={api_url} fotoPerfil={fotoPerfil} />

            <div className={css.layoutDashboard}>
                <div className={`${css.menuLateralContainer} ${menuColapsado ? css.menuLateralColapsado : ''}`}>
                    <MenuLateralAdvogado api={api_url} />
                </div>

                <div className={css.conteudoPrincipal}>
                    {msgTexto && (
                        <div className={`${css.mensagemAlerta} ${msgTipo === 'erro' ? css.erro : css.sucesso}`}>
                            <span>{msgTexto}</span>
                            <button type="button" onClick={() => setMsgTexto('')}>×</button>
                        </div>
                    )}

                    <div className={css.chatWrapper}>
                        <div className={css.container}>
                            <div className={css.abas}>
                                <button
                                    className={`${css.aba} ${aba === 'conversas' ? css.abaAtiva : ''}`}
                                    onClick={() => setAba('conversas')}
                                >
                                    Conversas
                                </button>
                                <button
                                    className={`${css.aba} ${aba === 'novo' ? css.abaAtiva : ''}`}
                                    onClick={() => setAba('novo')}
                                >
                                    Nova Conversa
                                </button>
                            </div>

                            <div className={css.secaoConversas}>
                                {aba === 'conversas' && (
                                    <>
                                        {carregandoConversas ? (
                                            <p className={css.carregando}>Carregando conversas...</p>
                                        ) : conversas.length === 0 ? (
                                            <p className={css.semConversas}>Nenhuma conversa ainda.</p>
                                        ) : (
                                            <div className={css.conversasScroll}>
                                                {conversas.map(conv => (
                                                    <div
                                                        key={conv.conversa_id}
                                                        className={`${css.conversaItem} ${conversaSelecionada?.conversa_id === conv.conversa_id ? css.conversaAtiva : ''}`}
                                                        onClick={() => {
                                                            setConversaSelecionada(conv);
                                                            atualizarUrl(conv.usuario_id);
                                                        }}
                                                    >
                                                        <img
                                                            className={css.imagem}
                                                            src={getImagemUrl(conv.usuario_id)}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                            alt={conv.usuario_nome}
                                                        />
                                                        <div className={css.imagemFallback} style={{ display: 'none' }}>
                                                            {iniciais(conv.usuario_nome)}
                                                        </div>
                                                        <div className={css.conversaInfo}>
                                                            <p className={css.nome}>{conv.usuario_nome}</p>
                                                            <p className={css.mensagem}>{conv.ultimo_texto?.substring(0, 35) || 'Nenhuma mensagem'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {aba === 'novo' && (
                                    <>
                                        {carregandoContatos ? (
                                            <p className={css.carregando}>Carregando...</p>
                                        ) : contatosSemConversa.length === 0 ? (
                                            <p className={css.semConversas}>
                                                {contatos.length > 0 ? 'Você já tem conversa com todos.' : 'Nenhum contato encontrado.'}
                                            </p>
                                        ) : (
                                            <div className={css.conversasScroll}>
                                                {contatosSemConversa.map(contato => (
                                                    <div
                                                        key={contato.id}
                                                        className={css.conversaItem}
                                                        onClick={() => iniciarConversaAutomatica(contato.id)}
                                                    >
                                                        <img
                                                            className={css.imagem}
                                                            src={getImagemUrl(contato.id)}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                            alt={contato.nome}
                                                        />
                                                        <div className={css.imagemFallback} style={{ display: 'none' }}>
                                                            {iniciais(contato.nome)}
                                                        </div>
                                                        <div className={css.conversaInfo}>
                                                            <p className={css.nome}>{contato.nome}</p>
                                                            <p className={css.mensagem}>Clique para iniciar</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {conversaSelecionada ? (
                            <div className={css.chatArea}>
                                <div className={css.header}>
                                    <button className={css.btnVoltar} onClick={voltarParaConversas} aria-label="Voltar">
                                        &#10094;
                                    </button>
                                    <img
                                        className={css.imagem}
                                        src={getImagemUrl(conversaSelecionada.usuario_id)}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                        }}
                                        alt={conversaSelecionada.usuario_nome}
                                    />
                                    <div className={css.imagemFallback} style={{ display: 'none' }}>
                                        {iniciais(conversaSelecionada.usuario_nome)}
                                    </div>
                                    <div className={css.headerInfo}>
                                        <p>{conversaSelecionada.usuario_nome}</p>
                                    </div>
                                </div>

                                <div className={css.mensagens} ref={mensagensContainerRef}>
                                    {carregandoMensagens && mensagens.length === 0 ? (
                                        <p className={css.estadoVazio}>Carregando mensagens...</p>
                                    ) : mensagens.length === 0 ? (
                                        <p className={css.estadoVazio}>Nenhuma mensagem ainda. Envie uma mensagem!</p>
                                    ) : (
                                        mensagens.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={msg.is_meu_envio ? css.mensagemEu : css.mensagemVoce}
                                            >
                                                <div className={css.balao}>
                                                    <p>{msg.mensagem}</p>
                                                    <span className={css.dataMensagem}>
                                                        {msg.data}
                                                        {msg.isTemp && <em className={css.enviando}> Enviando...</em>}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={mensagensEndRef} />
                                </div>

                                <form className={css.chat} onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="text"
                                        className={css.inputMensagem}
                                        placeholder="Digite uma mensagem..."
                                        value={novaMensagem}
                                        onChange={(e) => setNovaMensagem(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={enviando}
                                    />
                                    <button
                                        className={css.mandar}
                                        onClick={enviarMensagem}
                                        type="button"
                                        disabled={enviando || !novaMensagem.trim()}
                                        aria-label="Enviar mensagem"
                                    >
                                        ➤
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className={css.chatAreaVazio}>
                                <div className={css.mensagemVazio}>
                                    <div className={css.iconeVazio}>💬</div>
                                    <h3>Selecione uma conversa</h3>
                                    <p>Escolha um contato ao lado para começar a conversar.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}