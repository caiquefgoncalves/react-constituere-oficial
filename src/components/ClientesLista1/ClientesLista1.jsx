import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './ClientesLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function ClientesLista1({ api }) {
    const navigate = useNavigate();
    const topoModalRef = useRef(null);

    const [clientes, setClientes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState('');
    const [tipoMensagem, setTipoMensagem] = useState('');
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [modalAberto, setModalAberto] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [editando, setEditando] = useState(false);
    const [dadosEditados, setDadosEditados] = useState({});
    const [dadosRepresentante, setDadosRepresentante] = useState({});
    const [carregandoModal, setCarregandoModal] = useState(false);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);

    const [modalInativarAberto, setModalInativarAberto] = useState(false);
    const [clienteInativar, setClienteInativar] = useState(null);
    const [inativando, setInativando] = useState(false);
    const [ativando, setAtivando] = useState(false);

    const API_URL = api || 'http://192.168.0.130:5000';
    const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    function apenasNumeros(valor) {
        if (!valor) return '';
        return String(valor).replace(/\D/g, '');
    }

    function capitalizarNome(texto) {
        if (!texto) return '';
        return texto.split(' ').map(p =>
            p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        ).join(' ');
    }

    function formatarCpf(valor) {
        let n = apenasNumeros(valor);
        if (n.length > 11) n = n.slice(0, 11);
        if (n.length <= 3) return n;
        if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`;
        if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`;
        return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`;
    }

    function formatarCnpj(valor) {
        let n = apenasNumeros(valor);
        if (n.length > 14) n = n.slice(0, 14);
        if (n.length <= 2) return n;
        if (n.length <= 5) return `${n.slice(0,2)}.${n.slice(2)}`;
        if (n.length <= 8) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5)}`;
        if (n.length <= 12) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8)}`;
        return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12,14)}`;
    }

    function formatarTelefone(valor) {
        let n = apenasNumeros(valor);
        if (n.length > 11) n = n.slice(0, 11);
        if (n.length === 0) return '';
        if (n.length <= 2) return `(${n}`;
        if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
        return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7,11)}`;
    }

    function formatarCep(valor) {
        let n = apenasNumeros(valor);
        if (n.length > 8) n = n.slice(0, 8);
        if (n.length <= 5) return n;
        return `${n.slice(0,5)}-${n.slice(5,8)}`;
    }

    function formatarData(valor) {
        if (!valor) return '';
        let n = apenasNumeros(valor);
        if (n.length > 8) n = n.slice(0, 8);
        if (n.length <= 2) return n;
        if (n.length <= 4) return `${n.slice(0,2)}/${n.slice(2)}`;
        return `${n.slice(0,2)}/${n.slice(2,4)}/${n.slice(4,8)}`;
    }

    function formatarRg(valor) {
        let v = String(valor || '').replace(/[^0-9Xx]/g, '');
        if (v.length > 9) v = v.slice(0, 9);
        if (v.length <= 2) return v;
        if (v.length <= 5) return `${v.slice(0,2)}.${v.slice(2)}`;
        if (v.length <= 8) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
        return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}-${v.slice(8).toUpperCase()}`;
    }

    function validarCpf(cpf) {
        const n = apenasNumeros(cpf);
        if (n.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(n)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(n[i]) * (10 - i);
        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== parseInt(n[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(n[i]) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== parseInt(n[10])) return false;

        return true;
    }

    function validarCnpj(cnpj) {
        const n = apenasNumeros(cnpj);
        if (n.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(n)) return false;

        let tam = n.length - 2;
        let nums = n.substring(0, tam);
        let dig = n.substring(tam);
        let soma = 0;
        let pos = tam - 7;
        for (let i = tam; i >= 1; i--) {
            soma += parseInt(nums.charAt(tam - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(dig.charAt(0))) return false;

        tam = tam + 1;
        nums = n.substring(0, tam);
        soma = 0;
        pos = tam - 7;
        for (let i = tam; i >= 1; i--) {
            soma += parseInt(nums.charAt(tam - i)) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(dig.charAt(1))) return false;

        return true;
    }

    function calcularIdade(dataStr) {
        if (!dataStr) return null;
        const p = String(dataStr).replace(/[\/\-]/g, '/').split('/');
        if (p.length !== 3) return null;
        const d = parseInt(p[0]), m = parseInt(p[1]) - 1, a = parseInt(p[2]);
        if (isNaN(d) || isNaN(m) || isNaN(a)) return null;
        const nasc = new Date(a, m, d);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        if (hoje.getMonth() < m || (hoje.getMonth() === m && hoje.getDate() < d)) idade--;
        return idade;
    }

    function converterDataParaBanco(data) {
        if (!data) return '';
        const n = apenasNumeros(data);
        if (n.length === 8) return `${n.slice(4,8)}-${n.slice(2,4)}-${n.slice(0,2)}`;
        return '';
    }

    function contarClientesMes(lista) {
        const hoje = new Date();
        return lista.filter(c => {
            if (!c.data_cadastro) return false;
            try {
                const p = c.data_cadastro.split('/');
                const d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
                return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
            } catch { return false; }
        }).length;
    }

    function agendarLimpezaMensagem() {
        if (window.timeoutMsgCliente) clearTimeout(window.timeoutMsgCliente);
        window.timeoutMsgCliente = setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
        }, 6000);
    }

    function mostrarMensagem(texto, tipo = 'erro') {
        setMensagem(texto);
        setTipoMensagem(tipo);
        agendarLimpezaMensagem();
        if (topoModalRef.current) {
            topoModalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async function buscarClientes() {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setCarregando(true);

        try {
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setClientes(data.clientes || []);
            } else {
                const data = await response.json();
                mostrarMensagem(data.error || 'Erro ao carregar clientes.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => { buscarClientes(); }, [API_URL, navigate]);

    async function abrirModalVer(cliente) {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setModalAberto(true);
        setEditando(false);
        setCarregandoModal(true);
        setClienteSelecionado(null);
        setDadosEditados({});
        setDadosRepresentante({});
        setMensagem('');
        setTipoMensagem('');

        try {
            const response = await fetch(`${API_URL}/cliente/${cliente.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            let dados = {};
            if (response.ok) {
                const resultado = await response.json();
                dados = resultado.cliente || resultado;
            } else {
                dados = { ...cliente };
            }

            dados.id = cliente.id;
            dados.tipo = dados.tipo || cliente.tipo;

            const normalizado = {
                ...dados,
                nome: dados.nome || '',
                razao_social: dados.razao_social || '',
                nome_fantasia: dados.nome_fantasia || '',
                cpf: formatarCpf(dados.cpf || ''),
                cnpj: formatarCnpj(dados.cnpj || ''),
                cep: formatarCep(dados.cep || ''),
                telefone: formatarTelefone(dados.telefone || ''),
                data_nascimento: dados.data_nascimento ? formatarData(dados.data_nascimento) : '',
                rg: dados.rg && dados.rg !== '--' ? formatarRg(dados.rg) : '',
                orgao_expedidor: dados.orgao_expedidor !== '--' ? (dados.orgao_expedidor || '') : '',
                nacionalidade: dados.nacionalidade !== '--' ? (dados.nacionalidade || '') : '',
                estado_civil: dados.estado_civil !== '--' ? (dados.estado_civil || '') : '',
                profissao: dados.profissao !== '--' ? (dados.profissao || '') : '',
                sexo: dados.sexo !== '--' ? (dados.sexo || '') : '',
                carteira_trabalho: dados.carteira_trabalho !== '--' ? (dados.carteira_trabalho || '') : '',
                serie_carteira: dados.serie_carteira !== '--' ? (dados.serie_carteira || '') : '',
                logradouro: dados.logradouro !== '--' ? (dados.logradouro || '') : '',
                numero: dados.numero !== '--' ? (dados.numero || '') : '',
                complemento: dados.complemento !== '--' ? (dados.complemento || '') : '',
                bairro: dados.bairro !== '--' ? (dados.bairro || '') : '',
                cidade: dados.cidade !== '--' ? (dados.cidade || '') : '',
                estado: dados.estado !== '--' ? (dados.estado || '') : '',
                email: dados.email !== '--' ? (dados.email || '') : ''
            };

            let repNormalizado = {};
            if (dados.representante) {
                const rep = dados.representante;
                repNormalizado = {
                    nome: rep.nome !== '--' ? (rep.nome || '') : '',
                    profissao: rep.profissao !== '--' ? (rep.profissao || '') : '',
                    cpf: formatarCpf(rep.cpf || ''),
                    sexo: rep.sexo !== '--' ? (rep.sexo || '') : '',
                    rg: rep.rg && rep.rg !== '--' ? formatarRg(rep.rg) : '',
                    orgao_expedidor: rep.orgao_expedidor !== '--' ? (rep.orgao_expedidor || '') : '',
                    nacionalidade: rep.nacionalidade !== '--' ? (rep.nacionalidade || '') : '',
                    estado_civil: rep.estado_civil !== '--' ? (rep.estado_civil || '') : ''
                };
            }

            setClienteSelecionado(normalizado);
            setDadosEditados({ ...normalizado });
            setDadosRepresentante({ ...repNormalizado });

        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            const fb = {
                ...cliente,
                id: cliente.id,
                cpf: formatarCpf(cliente.cpf || ''),
                telefone: formatarTelefone(cliente.telefone || '')
            };
            setClienteSelecionado(fb);
            setDadosEditados({ ...fb });
        } finally {
            setCarregandoModal(false);
        }
    }

    function fecharModal() {
        setModalAberto(false);
        setClienteSelecionado(null);
        setEditando(false);
        setDadosEditados({});
        setDadosRepresentante({});
        setMensagem('');
        setTipoMensagem('');
    }

    function handleEditChange(e) {
        const { name, value } = e.target;
        let v = value;

        switch (name) {
            case 'nome':
            case 'razao_social':
            case 'nome_fantasia':
                v = capitalizarNome(String(value).replace(/[^a-zA-ZÀ-ÿ\s0-9]/g, '').slice(0, 254));
                break;
            case 'cpf':
                v = formatarCpf(value);
                break;
            case 'cnpj':
                v = formatarCnpj(value);
                break;
            case 'telefone':
                v = formatarTelefone(value);
                break;
            case 'cep':
                v = formatarCep(value);
                if (apenasNumeros(value).length === 8) buscarCep(value);
                break;
            case 'data_nascimento':
                v = formatarData(value);
                break;
            case 'rg':
                v = formatarRg(value);
                break;
            case 'orgao_expedidor':
                v = String(value).replace(/[^a-zA-Z0-9/]/g, '').slice(0, 20);
                break;
            case 'carteira_trabalho':
                v = apenasNumeros(value).slice(0, 7);
                break;
            case 'serie_carteira':
                v = apenasNumeros(value).slice(0, 4);
                break;
            case 'profissao':
            case 'nacionalidade':
                v = capitalizarNome(String(value).replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 254));
                break;
            case 'numero':
                v = apenasNumeros(value).slice(0, 20);
                break;
            case 'email':
                v = String(value).replace(/\s/g, '').slice(0, 254);
                break;
            default:
                v = value;
        }

        setDadosEditados(prev => ({ ...prev, [name]: v }));
    }

    function handleRepChange(e) {
        const { name, value } = e.target;
        let v = value;

        switch (name) {
            case 'nome':
            case 'profissao':
            case 'nacionalidade':
                v = capitalizarNome(String(value).replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 254));
                break;
            case 'cpf':
                v = formatarCpf(value);
                break;
            case 'rg':
                v = formatarRg(value);
                break;
            case 'orgao_expedidor':
                v = String(value).replace(/[^a-zA-Z0-9/]/g, '').slice(0, 20);
                break;
            default:
                v = value;
        }

        setDadosRepresentante(prev => ({ ...prev, [name]: v }));
    }

    async function buscarCep(cepInformado) {
        const n = apenasNumeros(cepInformado);
        if (n.length !== 8) return;

        setBuscandoCep(true);
        try {
            const r = await fetch(`https://viacep.com.br/ws/${n}/json/`);
            if (!r.ok) throw new Error('Falha na consulta');
            const d = await r.json();
            if (d.erro) {
                mostrarMensagem('CEP não encontrado. Verifique o número informado.', 'erro');
                return;
            }
            setDadosEditados(prev => ({
                ...prev,
                logradouro: d.logradouro || '',
                bairro: d.bairro || '',
                cidade: d.localidade || '',
                estado: d.uf || ''
            }));
            setMensagem('');
            setTipoMensagem('');
        } catch (err) {
            console.error('Erro ao consultar CEP:', err);
            mostrarMensagem('Não foi possível consultar o CEP. Verifique sua conexão.', 'erro');
        } finally {
            setBuscandoCep(false);
        }
    }

    async function handleSalvarEdicao() {
        if (!clienteSelecionado) return;

        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const faltando = [];
        const tipo = clienteSelecionado.tipo;

        if (tipo === 'fisico') {
            if (!String(dadosEditados.nome || '').trim()) faltando.push('Nome completo');
            if (!String(dadosEditados.cpf || '').trim()) faltando.push('CPF');
            if (!String(dadosEditados.telefone || '').trim()) faltando.push('Telefone');
            if (!String(dadosEditados.email || '').trim()) faltando.push('E-mail');
            if (!String(dadosEditados.cep || '').trim()) faltando.push('CEP');
            if (!String(dadosEditados.logradouro || '').trim()) faltando.push('Logradouro');
            if (!String(dadosEditados.numero || '').trim()) faltando.push('Número');
            if (!String(dadosEditados.bairro || '').trim()) faltando.push('Bairro');
            if (!String(dadosEditados.cidade || '').trim()) faltando.push('Cidade');
            if (!String(dadosEditados.estado || '').trim()) faltando.push('Estado');
        } else {
            if (!String(dadosEditados.razao_social || '').trim()) faltando.push('Razão social');
            if (!String(dadosEditados.nome_fantasia || '').trim()) faltando.push('Nome fantasia');
            if (!String(dadosEditados.cnpj || '').trim()) faltando.push('CNPJ');
            if (!String(dadosEditados.telefone || '').trim()) faltando.push('Telefone');
            if (!String(dadosEditados.email || '').trim()) faltando.push('E-mail');
            if (!String(dadosEditados.cep || '').trim()) faltando.push('CEP');
            if (!String(dadosEditados.logradouro || '').trim()) faltando.push('Logradouro');
            if (!String(dadosEditados.numero || '').trim()) faltando.push('Número');
            if (!String(dadosEditados.bairro || '').trim()) faltando.push('Bairro');
            if (!String(dadosEditados.cidade || '').trim()) faltando.push('Cidade');
            if (!String(dadosEditados.estado || '').trim()) faltando.push('Estado');
        }

        if (faltando.length > 0) {
            mostrarMensagem(`Preencha os campos obrigatórios: ${faltando.join(', ')}.`, 'erro');
            return;
        }

        if (tipo === 'fisico') {
            if (!validarCpf(dadosEditados.cpf)) {
                mostrarMensagem('CPF inválido. Verifique os números informados.', 'erro');
                return;
            }

            const idade = calcularIdade(dadosEditados.data_nascimento);
            if (dadosEditados.data_nascimento && (idade === null || idade < 18 || idade > 120)) {
                mostrarMensagem('Data de nascimento inválida. Idade deve ser entre 18 e 120 anos.', 'erro');
                return;
            }
        }

        if (tipo === 'juridico') {
            if (!validarCnpj(dadosEditados.cnpj)) {
                mostrarMensagem('CNPJ inválido. Verifique os números informados.', 'erro');
                return;
            }

            const repPreenchido = Object.values(dadosRepresentante).some(v => String(v || '').trim() !== '');
            if (repPreenchido) {
                if (!String(dadosRepresentante.nome || '').trim()) {
                    mostrarMensagem('Nome do representante é obrigatório.', 'erro');
                    return;
                }
                if (!String(dadosRepresentante.cpf || '').trim()) {
                    mostrarMensagem('CPF do representante é obrigatório.', 'erro');
                    return;
                }
                if (!validarCpf(dadosRepresentante.cpf)) {
                    mostrarMensagem('CPF do representante é inválido.', 'erro');
                    return;
                }
                if (!String(dadosRepresentante.sexo || '').trim()) {
                    mostrarMensagem('Sexo do representante é obrigatório.', 'erro');
                    return;
                }
            }
        }

        const cepN = apenasNumeros(dadosEditados.cep);
        if (cepN.length !== 8) {
            mostrarMensagem('CEP incompleto. Digite os 8 números.', 'erro');
            return;
        }

        const telN = apenasNumeros(dadosEditados.telefone);
        if (telN.length < 10 || telN.length > 11) {
            mostrarMensagem('Telefone incompleto. Digite DDD + número.', 'erro');
            return;
        }

        setSalvandoEdicao(true);
        setMensagem('');

        try {
            const payload = {
                nome: dadosEditados.nome,
                razao_social: dadosEditados.razao_social,
                nome_fantasia: dadosEditados.nome_fantasia,
                cpf: apenasNumeros(dadosEditados.cpf),
                cnpj: apenasNumeros(dadosEditados.cnpj),
                email: dadosEditados.email,
                telefone: telN,
                data_nascimento: converterDataParaBanco(dadosEditados.data_nascimento),
                sexo: dadosEditados.sexo,
                rg: apenasNumeros(dadosEditados.rg).length > 0 ? String(dadosEditados.rg).replace(/[^\dXx]/g, '') : '',
                orgao_expedidor: dadosEditados.orgao_expedidor,
                carteira_trabalho: dadosEditados.carteira_trabalho,
                serie_carteira: dadosEditados.serie_carteira,
                profissao: dadosEditados.profissao,
                estado_civil: dadosEditados.estado_civil,
                nacionalidade: dadosEditados.nacionalidade,
                cep: cepN,
                logradouro: dadosEditados.logradouro,
                numero: dadosEditados.numero,
                complemento: dadosEditados.complemento,
                bairro: dadosEditados.bairro,
                cidade: dadosEditados.cidade,
                estado: dadosEditados.estado,
                representante: clienteSelecionado.tipo === 'juridico' && Object.keys(dadosRepresentante).length > 0
                    ? {
                        nome: dadosRepresentante.nome,
                        profissao: dadosRepresentante.profissao,
                        cpf: apenasNumeros(dadosRepresentante.cpf),
                        sexo: dadosRepresentante.sexo,
                        rg: dadosRepresentante.rg,
                        orgao_expedidor: dadosRepresentante.orgao_expedidor,
                        nacionalidade: dadosRepresentante.nacionalidade,
                        estado_civil: dadosRepresentante.estado_civil
                    }
                    : null
            };

            const response = await fetch(`${API_URL}/cliente/${clienteSelecionado.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagem(resultado.error || 'Erro ao salvar alterações.', 'erro');
                return;
            }

            mostrarMensagem(resultado.mensagem || 'Cliente atualizado com sucesso!', 'sucesso');

            setClientes(prev =>
                prev.map(c =>
                    c.id === clienteSelecionado.id
                        ? {
                            ...c,
                            nome: tipo === 'juridico'
                                ? (dadosEditados.nome_fantasia || dadosEditados.razao_social)
                                : dadosEditados.nome,
                            cpf: tipo === 'juridico' ? formatarCnpj(dadosEditados.cnpj) : formatarCpf(dadosEditados.cpf),
                            email: dadosEditados.email,
                            telefone: dadosEditados.telefone
                        }
                        : c
                )
            );

            setClienteSelecionado(prev => ({ ...prev, ...dadosEditados }));
            setEditando(false);

        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setSalvandoEdicao(false);
        }
    }

    function cancelarEdicao() {
        setEditando(false);
        setDadosEditados({ ...clienteSelecionado });
        setMensagem('');
        setTipoMensagem('');
    }

    function abrirModalInativar(cliente) {
        setClienteInativar(cliente);
        setModalInativarAberto(true);
    }

    function fecharModalInativar() {
        setModalInativarAberto(false);
        setClienteInativar(null);
    }

    async function handleInativar() {
        if (!clienteInativar) return;
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setInativando(true);
        try {
            const response = await fetch(`${API_URL}/cliente/${clienteInativar.id}/inativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagem(resultado.error || 'Erro ao inativar cliente.', 'erro');
                return;
            }

            setClientes(prev =>
                prev.map(c => c.id === clienteInativar.id ? { ...c, status: 'inativo' } : c)
            );

            if (clienteSelecionado?.id === clienteInativar.id) {
                setClienteSelecionado(prev => ({ ...prev, status: 'inativo' }));
            }

            fecharModalInativar();
            mostrarMensagem(resultado.mensagem || 'Cliente inativado com sucesso!', 'sucesso');
        } catch (error) {
            console.error('Erro ao inativar cliente:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setInativando(false);
        }
    }

    async function handleAtivar(cliente) {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        setAtivando(true);
        try {
            const response = await fetch(`${API_URL}/cliente/${cliente.id}/ativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });

            let resultado = {};
            try { resultado = await response.json(); } catch { resultado = {}; }

            if (!response.ok) {
                mostrarMensagem(resultado.error || 'Erro ao ativar cliente.', 'erro');
                return;
            }

            setClientes(prev =>
                prev.map(c => c.id === cliente.id ? { ...c, status: 'ativo' } : c)
            );

            if (clienteSelecionado?.id === cliente.id) {
                setClienteSelecionado(prev => ({ ...prev, status: 'ativo' }));
            }

            mostrarMensagem(resultado.mensagem || 'Cliente ativado com sucesso!', 'sucesso');
        } catch (error) {
            console.error('Erro ao ativar cliente:', error);
            mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        } finally {
            setAtivando(false);
        }
    }

    function irParaCadastroCliente() {
        navigate('/cadastro_cliente_fisico');
    }

    const clientesFiltrados = clientes.filter(cliente => {
        const nomeMatch = cliente.nome?.toLowerCase().includes(filtroNome.toLowerCase());
        const statusMatch = filtroStatus === 'todos' || cliente.status === filtroStatus;
        const tipoMatch = filtroTipo === 'todos' || cliente.tipo === filtroTipo;
        return nomeMatch && statusMatch && tipoMatch;
    });

    const ativos = clientes.filter(c => c.status === 'ativo').length;
    const novosMes = contarClientesMes(clientes);
    const inadimplentes = clientes.filter(c => c.status === 'inadimplente').length;

    const ehPJ = clienteSelecionado?.tipo === 'juridico';

    return (
        <div className={css.paginaCompleta}>
            <Header api={API_URL} />

            <div className={css.layoutDashboard}>
                <div className={css.menuLateralContainer}>
                    <MenuLateralAdvogado api={API_URL} />
                </div>

                <div className={css.conteudoPrincipal}>
                    <div className={css.topoSaudacao}>
                        <h1 className={css.tituloPagina}>Meus Clientes</h1>
                        <button className={css.botaoAdicionar} onClick={irParaCadastroCliente} name="btn-adicionar-cliente" type="button">+</button>
                    </div>

                    {mensagem && !modalAberto && (
                        <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                            {mensagem}
                        </div>
                    )}

                    <div className={css.gradeEstatisticas}>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Clientes ativos</span>
                            <span className={css.numeroEstatistica}>{ativos}</span>
                        </div>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Novos clientes (este mês)</span>
                            <span className={css.numeroEstatistica}>{novosMes}</span>
                        </div>
                        <div className={css.cardEstatistica}>
                            <span className={css.labelEstatistica}>Clientes inadimplentes</span>
                            <span className={css.numeroEstatistica}>{inadimplentes}</span>
                        </div>
                    </div>

                    <div className={css.areaFiltros}>
                        <div className={css.buscaContainer}>
                            <input
                                type="text"
                                className={css.inputBusca}
                                placeholder="Pesquisar por nome do cliente..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                            />
                            <svg className={css.iconeBusca} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        <div className={css.filtrosOpcoes}>
                            <select className={css.selectFiltro} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                <option value="todos">Filtrar por: Todos os Tipos</option>
                                <option value="fisico">Pessoa Física</option>
                                <option value="juridico">Pessoa Jurídica</option>
                            </select>
                            <select className={css.selectFiltro} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                                <option value="todos">Filtrar por: Status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inadimplente">Inadimplente</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className={css.tabelaContainer}>
                        {carregando ? (
                            <p>Carregando clientes...</p>
                        ) : clientesFiltrados.length === 0 ? (
                            <p>Nenhum cliente encontrado.</p>
                        ) : (
                            <table className={css.tabela}>
                                <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF/CNPJ</th>
                                    <th>E-mail</th>
                                    <th>Telefone</th>
                                    <th>Status</th>
                                    <th className={css.colunaAcoes}>Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clientesFiltrados.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td>{cliente.nome}</td>
                                        <td>{cliente.cpf}</td>
                                        <td>{cliente.email}</td>
                                        <td>{formatarTelefone(cliente.telefone)}</td>
                                        <td>
                                            <span className={`${css.statusBadge} ${css[cliente.status]}`}>
                                                {cliente.status === 'ativo' && 'Em dia'}
                                                {cliente.status === 'inadimplente' && 'Inadimplente'}
                                                {cliente.status === 'inativo' && 'Inativo'}
                                            </span>
                                        </td>
                                        <td className={css.colunaAcoes}>
                                            <button className={css.botaoVer} onClick={() => abrirModalVer(cliente)} type="button">Ver</button>
                                            {cliente.status === 'inativo' ? (
                                                <button className={css.botaoAtivar} onClick={() => handleAtivar(cliente)} type="button" disabled={ativando}>
                                                    {ativando ? '...' : 'Ativar'}
                                                </button>
                                            ) : (
                                                <button className={css.botaoInativar} onClick={() => abrirModalInativar(cliente)} type="button">Inativar</button>
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

            {modalAberto && (
                <div className={css.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) fecharModal(); }}>
                    <div className={css.modalContainerGrande || css.modalContainer}>
                        <div className={css.modalHeader} ref={topoModalRef}>
                            <h2 className={css.modalTitulo}>
                                {carregandoModal ? 'Carregando...' : (clienteSelecionado?.nome || clienteSelecionado?.razao_social || 'Cliente')}
                            </h2>
                            <button className={css.modalFechar} onClick={fecharModal} type="button">✕</button>
                        </div>

                        <div className={css.modalBody}>
                            {mensagem && (
                                <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                                    {mensagem}
                                </div>
                            )}

                            {carregandoModal ? (
                                <p>Carregando dados do cliente...</p>
                            ) : clienteSelecionado && (
                                <form className={css.formulario} onSubmit={(e) => e.preventDefault()}>
                                    {ehPJ && (
                                        <>
                                            <h3 className={css.subtituloSecao}>
                                                Dados do Cliente (Pessoa Jurídica)
                                            </h3>

                                            <div className={css.linha}>
                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Razão social *</label>
                                                    <input type="text" name="razao_social" className={css.input}
                                                           value={dadosEditados.razao_social || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={254}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Nome fantasia *</label>
                                                    <input type="text" name="nome_fantasia" className={css.input}
                                                           value={dadosEditados.nome_fantasia || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={254}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>CNPJ *</label>
                                                    <input type="text" name="cnpj" className={css.input}
                                                           value={dadosEditados.cnpj || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={18}
                                                           placeholder="00.000.000/0000-00"
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>CEP *</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input type="text" name="cep" className={css.input}
                                                               value={dadosEditados.cep || ''}
                                                               onChange={handleEditChange}
                                                               readOnly={!editando}
                                                               maxLength={9}
                                                               placeholder="00000-000"
                                                        />
                                                        {buscandoCep && (
                                                            <span style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#666' }}>
                                                                Buscando...
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Logradouro *</label>
                                                    <input type="text" name="logradouro" className={css.input}
                                                           value={dadosEditados.logradouro || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Número *</label>
                                                    <input type="text" name="numero" className={css.input}
                                                           value={dadosEditados.numero || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Complemento</label>
                                                    <input type="text" name="complemento" className={css.input}
                                                           value={dadosEditados.complemento || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Bairro *</label>
                                                    <input type="text" name="bairro" className={css.input}
                                                           value={dadosEditados.bairro || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Cidade *</label>
                                                    <input type="text" name="cidade" className={css.input}
                                                           value={dadosEditados.cidade || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>UF *</label>
                                                    <select name="estado" className={css.input}
                                                            value={dadosEditados.estado || ''}
                                                            onChange={handleEditChange}
                                                            disabled={!editando}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {ufs.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Telefone *</label>
                                                    <input type="text" name="telefone" className={css.input}
                                                           value={dadosEditados.telefone || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={15}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>E-mail *</label>
                                                    <input type="text" name="email" className={css.input}
                                                           value={dadosEditados.email || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={254}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!ehPJ && (
                                        <div className={css.linha}>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nome completo *</label>
                                                <input type="text" name="nome" className={css.input}
                                                       value={dadosEditados.nome || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={254}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Data de nascimento *</label>
                                                <input type="text" name="data_nascimento" className={css.input}
                                                       value={dadosEditados.data_nascimento || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={10}
                                                       placeholder="DD/MM/AAAA"
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>CPF *</label>
                                                <input type="text" name="cpf" className={css.input}
                                                       value={dadosEditados.cpf || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={14}
                                                       placeholder="000.000.000-00"
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Sexo *</label>
                                                <select name="sexo" className={css.input}
                                                        value={dadosEditados.sexo || ''}
                                                        onChange={handleEditChange}
                                                        disabled={!editando}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="Feminino">Feminino</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Prefiro não informar">Prefiro não informar</option>
                                                </select>
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>RG</label>
                                                <input type="text" name="rg" className={css.input}
                                                       value={dadosEditados.rg || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={15}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Órgão expedidor</label>
                                                <input type="text" name="orgao_expedidor" className={css.input}
                                                       value={dadosEditados.orgao_expedidor || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={20}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Carteira de trabalho</label>
                                                <input type="text" name="carteira_trabalho" className={css.input}
                                                       value={dadosEditados.carteira_trabalho || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={7}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Série da carteira</label>
                                                <input type="text" name="serie_carteira" className={css.input}
                                                       value={dadosEditados.serie_carteira || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={4}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Profissão</label>
                                                <input type="text" name="profissao" className={css.input}
                                                       value={dadosEditados.profissao || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado civil</label>
                                                <select name="estado_civil" className={css.input}
                                                        value={dadosEditados.estado_civil || ''}
                                                        onChange={handleEditChange}
                                                        disabled={!editando}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                                    <option value="Casado(a)">Casado(a)</option>
                                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                                    <option value="União Estável">União Estável</option>
                                                </select>
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nacionalidade</label>
                                                <input type="text" name="nacionalidade" className={css.input}
                                                       value={dadosEditados.nacionalidade || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>CEP *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input type="text" name="cep" className={css.input}
                                                           value={dadosEditados.cep || ''}
                                                           onChange={handleEditChange}
                                                           readOnly={!editando}
                                                           maxLength={9}
                                                           placeholder="00000-000"
                                                    />
                                                    {buscandoCep && (
                                                        <span style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#666' }}>
                                                            Buscando...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Logradouro *</label>
                                                <input type="text" name="logradouro" className={css.input}
                                                       value={dadosEditados.logradouro || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Número *</label>
                                                <input type="text" name="numero" className={css.input}
                                                       value={dadosEditados.numero || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Complemento</label>
                                                <input type="text" name="complemento" className={css.input}
                                                       value={dadosEditados.complemento || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Bairro *</label>
                                                <input type="text" name="bairro" className={css.input}
                                                       value={dadosEditados.bairro || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Cidade *</label>
                                                <input type="text" name="cidade" className={css.input}
                                                       value={dadosEditados.cidade || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado *</label>
                                                <select name="estado" className={css.input}
                                                        value={dadosEditados.estado || ''}
                                                        onChange={handleEditChange}
                                                        disabled={!editando}
                                                >
                                                    <option value="">Selecione</option>
                                                    {ufs.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Telefone *</label>
                                                <input type="text" name="telefone" className={css.input}
                                                       value={dadosEditados.telefone || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={15}
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>E-mail *</label>
                                                <input type="text" name="email" className={css.input}
                                                       value={dadosEditados.email || ''}
                                                       onChange={handleEditChange}
                                                       readOnly={!editando}
                                                       maxLength={254}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {ehPJ && (
                                        <>
                                            <h3 className={css.subtituloSecao}>
                                                Representante Legal
                                            </h3>

                                            <div className={css.linha}>
                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Nome completo</label>
                                                    <input type="text" name="nome" className={css.input}
                                                           value={dadosRepresentante.nome || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={254}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Profissão</label>
                                                    <input type="text" name="profissao" className={css.input}
                                                           value={dadosRepresentante.profissao || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={100}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>CPF</label>
                                                    <input type="text" name="cpf" className={css.input}
                                                           value={dadosRepresentante.cpf || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={14}
                                                           placeholder="000.000.000-00"
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Sexo</label>
                                                    <select name="sexo" className={css.input}
                                                            value={dadosRepresentante.sexo || ''}
                                                            onChange={handleRepChange}
                                                            disabled={!editando}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Feminino">Feminino</option>
                                                        <option value="Masculino">Masculino</option>
                                                        <option value="Prefiro não informar">Prefiro não informar</option>
                                                    </select>
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>RG</label>
                                                    <input type="text" name="rg" className={css.input}
                                                           value={dadosRepresentante.rg || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={15}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Órgão expedidor</label>
                                                    <input type="text" name="orgao_expedidor" className={css.input}
                                                           value={dadosRepresentante.orgao_expedidor || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={20}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Nacionalidade</label>
                                                    <input type="text" name="nacionalidade" className={css.input}
                                                           value={dadosRepresentante.nacionalidade || ''}
                                                           onChange={handleRepChange}
                                                           readOnly={!editando}
                                                           maxLength={50}
                                                    />
                                                </div>

                                                <div className={css.campoMetade}>
                                                    <label className={css.label}>Estado civil</label>
                                                    <select name="estado_civil" className={css.input}
                                                            value={dadosRepresentante.estado_civil || ''}
                                                            onChange={handleRepChange}
                                                            disabled={!editando}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Solteiro(a)">Solteiro(a)</option>
                                                        <option value="Casado(a)">Casado(a)</option>
                                                        <option value="Divorciado(a)">Divorciado(a)</option>
                                                        <option value="Viúvo(a)">Viúvo(a)</option>
                                                        <option value="União Estável">União Estável</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                                        <p className={css.obsCampos}>* Campos obrigatórios</p>
                                    </div>

                                    <div className={css.botaoContainer}>
                                        {editando ? (
                                            <>
                                                <button
                                                    className={css.botaoCadastro}
                                                    type="button"
                                                    onClick={handleSalvarEdicao}
                                                    disabled={salvandoEdicao}
                                                >
                                                    {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                                                </button>
                                                <button
                                                    className={css.botaoCancelar}
                                                    type="button"
                                                    onClick={cancelarEdicao}
                                                    disabled={salvandoEdicao}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className={css.botaoEditar || css.botaoCadastro}
                                                type="button"
                                                onClick={() => setEditando(true)}
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalInativarAberto && clienteInativar && (
                <div className={css.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget && !inativando) fecharModalInativar(); }}>
                    <div className={css.modalInativacao}>
                        <button className={css.modalFecharIconeLeft} onClick={fecharModalInativar} type="button" disabled={inativando}>X</button>
                        <h2 className={css.tituloInativacao}>Certeza que gostaria de<br />inativar?</h2>
                        <p className={css.subtituloInativacao}>
                            Confirme para inativar o cliente <strong>{clienteInativar.nome}</strong>.
                        </p>
                        <div className={css.botoesInativacao}>
                            <button className={css.btnCancelarInativacao} onClick={fecharModalInativar} type="button" disabled={inativando}>Cancelar</button>
                            <button className={css.btnConfirmarInativacao} onClick={handleInativar} type="button" disabled={inativando}>
                                {inativando ? 'Inativando...' : 'Inativar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}