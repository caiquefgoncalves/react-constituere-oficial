// Quantos dias antes do vencimento o sistema começa a avisar
export const DIAS_ALERTA = 7;

// Aceita "dd/mm/aaaa" ou "aaaa-mm-dd" e devolve uma data local (sem horas)
export function parseData(texto) {
    if (!texto) return null;

    const br = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texto);
    if (br) {
        return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
    }

    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
    if (iso) {
        return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    }

    return null;
}

export function diasParaVencer(texto) {
    const data = parseData(texto);
    if (!data) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return Math.round((data - hoje) / 86400000);
}