import React, { useState } from 'react';
import css from './ModalAdvogadoAdicionar1.module.css';

export default function ModalAdvogadoAdicionar1({ isOpen, onClose, onAdicionar, carregando }) {
    const [email, setEmail] = useState('');
    const [posicao, setPosicao] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdicionar({ email, posicao });
    };

    const handleClose = () => {
        setEmail('');
        setPosicao('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={css.overlay} onClick={handleClose}>
            <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className={css.closeButton}
                    onClick={handleClose}
                    aria-label="Fechar"
                    name="btn-fechar-modal"
                >
                    ×
                </button>

                <h1 className={css.titulo}>Adicionar advogado</h1>

                <form onSubmit={handleSubmit}>
                    <div className={css.formFields}>
                        <div className={css.formGroup}>
                            <label htmlFor="email-advogado">
                                E-mail do advogado *
                            </label>
                            <input
                                id="email-advogado"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite o e-mail do advogado"
                                name="email_advogado"
                                required
                            />
                        </div>

                        <div className={css.formGroup}>
                            <label htmlFor="posicao-advogado">
                                Posição *
                            </label>
                            <select
                                id="posicao-advogado"
                                value={posicao}
                                onChange={(e) => setPosicao(e.target.value)}
                                name="posicao_advogado"
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="PROPRIETARIO">Proprietário</option>
                                <option value="PARCEIRO">Parceiro</option>
                            </select>
                        </div>
                    </div>

                    <div className={css.helpText}>
                        <p>* Campos obrigatórios</p>
                        <p>** O advogado precisa estar cadastrado na Constituere</p>
                    </div>

                    <button
                        type="submit"
                        className={css.addButton}
                        disabled={carregando}
                        name="btn-adicionar-advogado"
                    >
                        {carregando ? 'Adicionando...' : 'Adicionar'}
                    </button>
                </form>
            </div>
        </div>
    );
}