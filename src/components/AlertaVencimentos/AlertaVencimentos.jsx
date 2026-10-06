import React, { useEffect, useState } from 'react';
import css from './AlertaVencimentos.module.css';
import { diasParaVencer } from "../../../utils/Vencimentos.js";

export const DIAS_ALERTA = 3;
const MAX_ITENS_VISIVEIS = 5;

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(valor) || 0);
}

function textoPrazo(item) {
    if (item.dias === null) return 'Atrasada';
    if (item.dias < 0) {
        const n = Math.abs(item.dias);
        return `Atrasada há ${n} dia${n > 1 ? 's' : ''}`;
    }
    if (item.dias === 0) return 'Vence hoje';
    if (item.dias === 1) return 'Vence amanhã';
    return `Vence em ${item.dias} dias`;
}

export function TagVencimento({ vencimento }) {
    const dias = diasParaVencer(vencimento);

    if (dias === null || dias < 0 || dias > DIAS_ALERTA) {
        return null;
    }

    const texto =
        dias === 0 ? 'Vence hoje' : dias === 1 ? 'Vence amanhã' : `Vence em ${dias} dias`;

    return (
        <span className={`${css.tag} ${dias <= 1 ? css.tagUrgente : css.tagAtencao}`}>
            {texto}
        </span>
    );
}

export default function AlertaVencimentos({ api, atualizar, onVerPendentes }) {
    const [itens, setItens] = useState([]);
    const [dispensado, setDispensado] = useState(false);
    const [permissao, setPermissao] = useState(() =>
        typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const controller = new AbortController();

        async function buscarPorStatus(status) {
            const response = await fetch(
                `${api}/pagamentos?page=1&limit=100&status=${encodeURIComponent(status)}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token },
                    signal: controller.signal
                }
            );

            if (!response.ok) return [];

            const data = await response.json();
            return Array.isArray(data.pagamentos) ? data.pagamentos : [];
        }

        async function carregar() {
            try {
                const [aPagar, atrasadas] = await Promise.all([
                    buscarPorStatus('A pagar'),
                    buscarPorStatus('Atrasada')
                ]);

                const porId = new Map();
                [...aPagar, ...atrasadas].forEach(pag => porId.set(pag.id, pag));

                const lista = Array.from(porId.values())
                    .map(pag => ({ ...pag, dias: diasParaVencer(pag.vencimento) }))
                    .filter(
                        pag =>
                            pag.status === 'Atrasada' ||
                            (pag.dias !== null && pag.dias <= DIAS_ALERTA)
                    )
                    .sort((a, b) => (a.dias ?? -9999) - (b.dias ?? -9999));

                setItens(lista);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao buscar vencimentos:', error);
                }
            }
        }

        carregar();

        return () => controller.abort();
    }, [api, atualizar]);

    const atrasados = itens.filter(item => item.status === 'Atrasada' || (item.dias ?? 0) < 0);
    const aVencer = itens.filter(item => !atrasados.includes(item));

    useEffect(() => {
        if (itens.length === 0 || permissao !== 'granted') return;

        const hoje = new Date().toLocaleDateString('pt-BR');
        if (localStorage.getItem('aviso_vencimentos_data') === hoje) return;

        const partes = [];
        if (atrasados.length > 0) {
            partes.push(`${atrasados.length} em atraso`);
        }
        if (aVencer.length > 0) {
            partes.push(`${aVencer.length} vencendo nos próximos ${DIAS_ALERTA} dias`);
        }

        try {
            new Notification('Pagamentos pendentes', { body: partes.join(' e ') });
            localStorage.setItem('aviso_vencimentos_data', hoje);
        } catch (error) {
            console.error('Não foi possível enviar a notificação:', error);
        }
    }, [itens, permissao]);

    async function ativarAvisosNavegador() {
        if (typeof Notification === 'undefined') return;
        const resultado = await Notification.requestPermission();
        setPermissao(resultado);
    }

    if (dispensado || itens.length === 0) {
        return null;
    }

    const visiveis = itens.slice(0, MAX_ITENS_VISIVEIS);
    const restantes = itens.length - visiveis.length;

    return (
        <section className={css.alerta} role="alert" aria-label="Pagamentos que precisam de atenção">
            <div className={css.topo}>
                <div>
                    <h2 className={css.titulo}>Atenção aos pagamentos</h2>
                    <p className={css.resumo}>
                        {atrasados.length > 0 && `${atrasados.length} em atraso`}
                        {atrasados.length > 0 && aVencer.length > 0 && ' • '}
                        {aVencer.length > 0 &&
                            `${aVencer.length} vencendo nos próximos ${DIAS_ALERTA} dias`}
                    </p>
                </div>

                <button
                    type="button"
                    className={css.botaoFechar}
                    onClick={() => setDispensado(true)}
                    aria-label="Dispensar aviso"
                >
                    ✕
                </button>
            </div>

            <ul className={css.lista}>
                {visiveis.map(item => (
                    <li key={item.id} className={css.item}>
                        <div className={css.itemInfo}>
                            <span className={css.itemNome}>{item.nome || 'Pagamento'}</span>
                            <span className={css.itemCliente}>{item.cliente || '--'}</span>
                        </div>

                        <span className={css.itemValor}>{formatarMoeda(item.valor)}</span>

                        <span
                            className={`${css.tag} ${
                                item.dias === null || item.dias < 0
                                    ? css.tagAtrasada
                                    : item.dias <= 1
                                        ? css.tagUrgente
                                        : css.tagAtencao
                            }`}
                        >
                            {textoPrazo(item)}
                        </span>
                    </li>
                ))}
            </ul>

            {restantes > 0 && (
                <p className={css.restantes}>e mais {restantes} pagamento(s)</p>
            )}

            <div className={css.acoes}>
                {onVerPendentes && (
                    <button type="button" className={css.botaoPrimario} onClick={onVerPendentes}>
                        Ver pagamentos a pagar
                    </button>
                )}

                {permissao === 'default' && (
                    <button type="button" className={css.botaoSecundario} onClick={ativarAvisosNavegador}>
                        Ativar avisos no navegador
                    </button>
                )}
            </div>
        </section>
    );
}