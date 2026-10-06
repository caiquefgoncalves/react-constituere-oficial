import React, { useState } from 'react';
import css from './AdicionarLancamento1.module.css';

const estadoInicial = {
    tipo: 'despesa',
    descricao: '',
    valor: '',
    data: '',
};

function mascaraValor(valor) {
    let v = String(valor || '').replace(/\D/g, '');

    if (v.length > 13) {
        v = v.slice(0, 13);
    }

    if (v.length === 0) {
        return '';
    }

    if (v.length <= 2) {
        return `R$ ${v}`;
    }

    const inteiro = v.slice(0, -2);
    const decimal = v.slice(-2);

    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `R$ ${inteiroFormatado},${decimal}`;
}

function valorParaNumero(valorMascarado) {
    if (!valorMascarado) return 0;

    const n = String(valorMascarado).replace(/\D/g, '');
    if (!n) return 0;

    return parseInt(n, 10) / 100;
}

function mascaraData(valor) {
    let v = String(valor || '').replace(/\D/g, '');

    if (v.length > 8) {
        v = v.slice(0, 8);
    }

    if (v.length <= 2) return v;
    if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;

    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
}

function dataParaBanco(dataMascarada) {
    const n = String(dataMascarada || '').replace(/\D/g, '');

    if (n.length !== 8) return '';

    return `${n.slice(4, 8)}-${n.slice(2, 4)}-${n.slice(0, 2)}`;
}

export default function AdicionarLancamento1({ api, idEscritorio, isOpen, onClose, onSucesso }) {
    const API_URL = api || 'http://10.92.11.25:5000';

    const [dados, setDados] = useState(estadoInicial);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');

    function handleChange(e) {
        const { name, value } = e.target;

        let v = value;

        if (name === 'valor') {
            v = mascaraValor(value);
        }

        if (name === 'data') {
            v = mascaraData(value);
        }

        if (name === 'descricao') {
            v = String(value).slice(0, 254);
        }

        setDados((prev) => ({
            ...prev,
            [name]: v,
        }));
    }

    function fechar() {
        if (salvando) return;

        setDados(estadoInicial);
        setMensagem('');
        setTipoMensagem('');

        if (typeof onClose === 'function') {
            onClose();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMensagem('');

        if (!dados.descricao.trim()) {
            setMensagem('Descrição é obrigatória.');
            setTipoMensagem('erro');
            return;
        }

        const valorNum = valorParaNumero(dados.valor);

        if (!valorNum || valorNum <= 0) {
            setMensagem('Valor deve ser maior que zero.');
            setTipoMensagem('erro');
            return;
        }

        const dataBanco = dataParaBanco(dados.data);

        if (!dataBanco) {
            setMensagem('Data inválida. Use o formato DD/MM/AAAA.');
            setTipoMensagem('erro');
            return;
        }

        setSalvando(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('tipo', dados.tipo);
            formData.append('descricao', dados.descricao.trim());
            formData.append('valor', String(valorNum).replace('.', ','));
            formData.append('data', dataBanco);

            const response = await fetch(
                `${API_URL}/escritorio/${idEscritorio}/financeiro/lancamentos`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-Access-Token': token
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMensagem('Lançamento cadastrado com sucesso!');
                setTipoMensagem('sucesso');
                setDados(estadoInicial);

                if (typeof onSucesso === 'function') {
                    onSucesso();
                }

                setTimeout(() => {
                    setMensagem('');
                    setTipoMensagem('');
                }, 3000);
            } else {
                setMensagem(data.error || 'Erro ao cadastrar lançamento.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            console.error('Erro ao cadastrar lançamento:', error);
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setSalvando(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={css.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget && !salvando) {
                    fechar();
                }
            }}
        >
            <div className={css.modalContainer}>

                <div className={css.modalHeader}>
                    <h2 className={css.modalTitulo}>
                        Novo Lançamento
                    </h2>

                    <button
                        className={css.modalFechar}
                        onClick={fechar}
                        type="button"
                        aria-label="Fechar"
                        disabled={salvando}
                    >
                        ✕
                    </button>
                </div>

                <div className={css.modalBody}>

                    {mensagem && (
                        <div
                            className={`${css.mensagemContainer} ${
                                tipoMensagem === 'sucesso' ? css.sucesso : css.erro
                            }`}
                        >
                            {mensagem}
                        </div>
                    )}

                    <form className={css.formulario} onSubmit={handleSubmit}>

                        <div className={css.linha}>

                            <div className={css.campoMetade}>
                                <label className={css.label} htmlFor="tipo">
                                    Tipo *
                                </label>

                                <select
                                    id="tipo"
                                    name="tipo"
                                    className={css.input}
                                    value={dados.tipo}
                                    onChange={handleChange}
                                    disabled={salvando}
                                    required
                                >
                                    <option value="despesa">Despesa</option>
                                    <option value="receita">Receita</option>
                                </select>
                            </div>

                            <div className={css.campoMetade}>
                                <label className={css.label} htmlFor="data">
                                    Data *
                                </label>

                                <input
                                    id="data"
                                    name="data"
                                    type="text"
                                    inputMode="numeric"
                                    className={css.input}
                                    placeholder="DD/MM/AAAA"
                                    value={dados.data}
                                    onChange={handleChange}
                                    maxLength={10}
                                    disabled={salvando}
                                    required
                                />
                            </div>

                        </div>

                        <div className={css.linha}>

                            <div className={css.campoInteiro}>
                                <label className={css.label} htmlFor="descricao">
                                    Descrição *
                                </label>

                                <input
                                    id="descricao"
                                    name="descricao"
                                    type="text"
                                    className={css.input}
                                    placeholder="Ex.: Custas processuais"
                                    value={dados.descricao}
                                    onChange={handleChange}
                                    maxLength={254}
                                    disabled={salvando}
                                    required
                                />
                            </div>

                        </div>

                        <div className={css.linha}>

                            <div className={css.campoInteiro}>
                                <label className={css.label} htmlFor="valor">
                                    Valor *
                                </label>

                                <input
                                    id="valor"
                                    name="valor"
                                    type="text"
                                    inputMode="numeric"
                                    className={css.input}
                                    placeholder="R$ 0,00"
                                    value={dados.valor}
                                    onChange={handleChange}
                                    disabled={salvando}
                                    required
                                />
                            </div>

                        </div>

                        <div className={css.campoInteiro}>
                            <p className={css.obsCampos}>
                                * Campos obrigatórios
                            </p>
                        </div>

                        <div className={css.botaoContainer}>

                            <button
                                className={css.botaoCadastro}
                                type="submit"
                                disabled={salvando}
                            >
                                {salvando ? 'Cadastrando...' : 'Cadastrar'}
                            </button>

                            <button
                                className={css.botaoCancelar}
                                type="button"
                                onClick={fechar}
                                disabled={salvando}
                            >
                                Cancelar
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
}