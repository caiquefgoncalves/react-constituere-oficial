import React, { useState, useRef, useEffect } from 'react';
import css from './Reagendar1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { useNavigate, useLocation } from 'react-router-dom';

export default function Reagendar1({ api }) {
    const navigate = useNavigate();
    const location = useLocation();
    const topoRef = useRef(null);

    const agendamentoOriginal = location.state?.agendamento;

    const hojeISO = new Date().toISOString().split('T')[0];

    function converterParaISO(dataTexto) {
        if (!dataTexto) return '';

        const texto = String(dataTexto).trim();

        if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
            return texto.slice(0, 10);
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
            const [dia, mes, ano] = texto.split('/');
            return `${ano}-${mes}-${dia}`;
        }

        return '';
    }

    const [data, setData] = useState('');
    const [cliente, setCliente] = useState('');
    const [advogado2, setAdvogado2] = useState('');
    const [assunto, setAssunto] = useState('');
    const [horario, setHorario] = useState('');
    const [duracao, setDuracao] = useState('');

    const [clientes, setClientes] = useState([]);
    const [advogados, setAdvogados] = useState([]);

    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [carregandoClientes, setCarregandoClientes] = useState(false);
    const [carregandoAdvogados, setCarregandoAdvogados] = useState(false);

    const API_URL = api || 'http://10.92.11.39:5000';

    function agendarLimpezaMensagem() {
        if (window.timeoutMensagem) clearTimeout(window.timeoutMensagem);
        window.timeoutMensagem = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 9000);
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);

        if (topoRef.current) {
            topoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        agendarLimpezaMensagem();
    }

    function capitalizar(texto) {
        if (!texto) return '';
        return texto
            .split(' ')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
            .join(' ');
    }

    function handleAssunto(e) {
        const valor = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (valor.length <= 256) setAssunto(capitalizar(valor));
    }

    function duracaoParaMinutos(duracaoTexto) {
        if (!duracaoTexto) return null;

        if (duracaoTexto.includes(':')) {
            const partes = duracaoTexto.split(':');
            if (partes.length !== 2) return null;
            const h = Number(partes[0]);
            const m = Number(partes[1]);
            if (isNaN(h) || isNaN(m) || m >= 60) return null;
            return h * 60 + m;
        }

        if (/^\d+$/.test(duracaoTexto)) return Number(duracaoTexto);

        return null;
    }

    function voltar() {
        navigate('/agendamentos');
    }

    function deslogar() {
        localStorage.removeItem('nome');
        localStorage.removeItem('tipo');
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');
        navigate('/login');
    }

    async function buscarClientes() {
        setCarregandoClientes(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            const dados = await response.json();

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                mostrarMensagem(dados.error || 'Erro ao carregar clientes.');
                return;
            }

            const lista = dados.clientes || [];
            setClientes(lista.filter(c => c.status === 'ativo'));

        } catch (erro) {
            console.error('Erro ao carregar clientes:', erro);
            mostrarMensagem('Erro de conexão ao carregar clientes.');
        } finally {
            setCarregandoClientes(false);
        }
    }

    async function buscarAdvogados() {
        setCarregandoAdvogados(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/listar_advogados`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.status === 401) {
                deslogar();
                return;
            }

            if (!response.ok) {
                setAdvogados([]);
                return;
            }

            const dados = await response.json();
            setAdvogados(dados.advogados || []);

        } catch (erro) {
            console.error('Erro ao carregar advogados:', erro);
        } finally {
            setCarregandoAdvogados(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        if (!agendamentoOriginal) {
            navigate('/agendamentos');
            return;
        }

        setData(converterParaISO(agendamentoOriginal.data_iso || agendamentoOriginal.data));
        setAssunto(agendamentoOriginal.assunto);
        setHorario(agendamentoOriginal.horario);
        setDuracao(agendamentoOriginal.duracao);
        setCliente(String(agendamentoOriginal.id_cliente));
        setAdvogado2(agendamentoOriginal.id_advogado_2 ? String(agendamentoOriginal.id_advogado_2) : '');

        buscarClientes();
        buscarAdvogados();
    }, [API_URL]);

    async function handleCadastro(e) {
        e.preventDefault();

        setCarregando(true);
        setMensagem('');
        setTipoMensagem('');

        const camposFaltando = [];

        if (!cliente) camposFaltando.push('Cliente');
        if (!assunto.trim()) camposFaltando.push('Assunto');
        if (!data) camposFaltando.push('Data');
        if (!horario) camposFaltando.push('Horário');
        if (!duracao.trim()) camposFaltando.push('Duração');

        if (camposFaltando.length > 0) {
            mostrarMensagem(`Preencha os campos obrigatórios: ${camposFaltando.join(', ')}.`);
            setCarregando(false);
            return;
        }

        if (data < hojeISO) {
            mostrarMensagem('A data não pode ser anterior ao dia de hoje.');
            setCarregando(false);
            return;
        }

        if (!/^\d{2}:\d{2}$/.test(horario)) {
            mostrarMensagem('Horário inválido.');
            setCarregando(false);
            return;
        }

        const duracaoMin = duracaoParaMinutos(duracao);

        if (duracaoMin === null) {
            mostrarMensagem('Duração inválida.');
            setCarregando(false);
            return;
        }

        if (duracaoMin <= 0) {
            mostrarMensagem('A duração deve ser maior que 0.');
            setCarregando(false);
            return;
        }

        if (duracaoMin > 480) {
            mostrarMensagem('A duração não pode ser maior que 8 horas.');
            setCarregando(false);
            return;
        }

        const nomeCliente = clientes.find(c => String(c.id) === String(cliente));

        const payload = {
            id_cliente: Number(cliente),
            id_advogado_2: advogado2 ? Number(advogado2) : null,
            cliente: nomeCliente ? nomeCliente.nome : '',
            assunto: assunto.trim(),
            data: data,
            horario: horario,
            duracao: duracao
        };

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(`${API_URL}/agendamento/${agendamentoOriginal.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(payload)
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
                mostrarMensagem(dados.error || 'Erro ao editar agendamento.');
                return;
            }

            mostrarMensagem(dados.mensagem || 'Agendamento atualizado com sucesso!', 'sucesso');

            setTimeout(() => navigate('/agendamentos'), 2000);

        } catch (erro) {
            console.error('Erro ao editar agendamento:', erro);
            mostrarMensagem('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <section className={css.containerSection} ref={topoRef}>
                <div className={css.topArea}>
                    <button
                        className={css.botaoVoltar}
                        onClick={voltar}
                        tabIndex={-1}
                        name="btn-voltar"
                        type="button"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <h1 className={css.titulo}>
                        Remarcar a consulta
                    </h1>
                </div>

                {mensagem && (
                    <div
                        style={{
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
                        }}
                    >
                        {mensagem}
                    </div>
                )}

                <form className={css.formulario} onSubmit={handleCadastro}>
                    <div className={css.linha}>
                        <div className={css.campoMetade}>
                            <label className={css.label}>Cliente *</label>
                            <select
                                className={css.input}
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                tabIndex={1}
                                name="cliente"
                                disabled={carregandoClientes}
                            >
                                <option value="" disabled>
                                    {carregandoClientes ? 'Carregando clientes...' : 'Selecione o cliente'}
                                </option>
                                {clientes.map(clienteItem => (
                                    <option key={clienteItem.id} value={clienteItem.id}>
                                        {clienteItem.nome} - {clienteItem.cpf}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Advogado 2 (se houver)</label>
                            <select
                                className={css.input}
                                value={advogado2}
                                onChange={(e) => setAdvogado2(e.target.value)}
                                tabIndex={2}
                                name="advogado2"
                                disabled={carregandoAdvogados}
                            >
                                <option value="">
                                    {carregandoAdvogados ? 'Carregando advogados...' : 'Nenhum'}
                                </option>
                                {advogados.map(a => (
                                    <option key={a.id} value={a.id}>{a.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Assunto *</label>
                            <input
                                type="text"
                                className={css.input}
                                placeholder="Digite o assunto"
                                value={assunto}
                                onChange={handleAssunto}
                                tabIndex={3}
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Data *</label>
                            <input
                                type="date"
                                className={css.input}
                                value={data}
                                min={hojeISO}
                                onChange={(e) => setData(e.target.value)}
                                tabIndex={4}
                                name="data"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Horário *</label>
                            <input
                                type="time"
                                className={css.input}
                                value={horario}
                                onChange={(e) => setHorario(e.target.value)}
                                tabIndex={5}
                                name="horario"
                            />
                        </div>

                        <div className={css.campoMetade}>
                            <label className={css.label}>Duração *</label>
                            <input
                                type="time"
                                className={css.input}
                                value={duracao}
                                max="08:00"
                                onChange={(e) => setDuracao(e.target.value)}
                                tabIndex={6}
                                name="duracao"
                            />
                            <small style={{ color: '#888', fontSize: '0.8rem' }}>
                                Máximo 8 horas
                            </small>
                        </div>

                        <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                            <p className={css.obsCampos}>* Campos obrigatórios</p>
                        </div>
                    </div>

                    <div className={css.botaoContainer}>
                        <button
                            className={css.botaoCadastro}
                            type="submit"
                            disabled={carregando || carregandoClientes}
                            tabIndex={10}
                            name="btn-cadastrar"
                        >
                            {carregando ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </form>
            </section>

            <Footer />
        </div>
    );
}