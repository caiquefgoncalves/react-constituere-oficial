import { useState, useRef, useEffect } from "react";
import css from './ChatVeritas.module.css';

export default function ChatVeritas({ aberto, onFechar }) {
    const [mensagens, setMensagens] = useState([
        {
            id: 1,
            autor: 'veritas',
            texto: 'Olá! Sou o Veritas.AI, sua assistente jurídica. Como posso ajudar você hoje?'
        }
    ]);
    const [input, setInput] = useState('');
    const [digitando, setDigitando] = useState(false);
    const fimRef = useRef(null);

    useEffect(() => {
        if (fimRef.current) {
            fimRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensagens, digitando]);

    function enviarMensagem(e) {
        e.preventDefault();
        const texto = input.trim();
        if (!texto) return;

        const novaMsg = {
            id: Date.now(),
            autor: 'usuario',
            texto
        };
        setMensagens(prev => [...prev, novaMsg]);
        setInput('');
        setDigitando(true);

        setTimeout(() => {
            setDigitando(false);
            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    autor: 'veritas',
                    texto: 'Entendi! Em breve vou processar sua solicitação com base na legislação vigente. (Resposta simulada - front apenas)'
                }
            ]);
        }, 1200);
    }

    if (!aberto) return null;

    return (
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
                    <button
                        className={css.botaoFechar}
                        onClick={onFechar}
                        aria-label="Fechar chat"
                    >
                        &#10005;
                    </button>
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
                            <div className={css.balao}>{msg.texto}</div>
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
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Pergunte algo ao Veritas.AI..."
                        className={css.input}
                    />
                    <button type="submit" className={css.botaoEnviar} aria-label="Enviar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}