import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './ClientesLista1.module.css';
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import MenuLateralAdvogado from "../MenuLateralAdvogado/MenuLateralAdvogado.jsx";

export default function ClientesLista1({ api }) {
    const navigate = useNavigate();
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
    const [carregandoModal, setCarregandoModal] = useState(false);

    const [modalInativarAberto, setModalInativarAberto] = useState(false);
    const [clienteInativar, setClienteInativar] = useState(null);
    const [inativando, setInativando] = useState(false);

    const API_URL = api || 'http://10.92.11.4:5000';

    function apenasNumeros(valor) {
        if (!valor) return '';
        return valor.replace(/\D/g, '');
    }

    function formatarCpf(valor) {
        if (!valor) return '';
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
    }

    function formatarCnpj(valor) {
        if (!valor) return '';
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
        if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
        if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
        return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
    }

    function formatarTelefone(valor) {
        if (!valor) return '';
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }

    function formatarCep(valor) {
        if (!valor) return '';
        const numeros = apenasNumeros(valor);
        if (numeros.length === 0) return '';
        if (numeros.length <= 5) return numeros;
        return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }

    function formatarDocumento(doc, tipo) {
        if (!doc) return '';
        if (tipo === 'juridico') {
            return formatarCnpj(doc);
        }
        return formatarCpf(doc);
    }

    function aplicarMascaras(cliente) {
        if (!cliente) return cliente;
        const tipo = cliente.tipo || 'fisico';
        return {
            ...cliente,
            cpf: formatarDocumento(cliente.cpf, tipo),
            telefone: formatarTelefone(cliente.telefone),
            cep: formatarCep(cliente.cep),
            representante: cliente.representante ? {
                ...cliente.representante,
                cpf: formatarCpf(cliente.representante.cpf)
            } : null
        };
    }

    function contarClientesMes(clientes) {
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();
        return clientes.filter(cliente => {
            if (!cliente.data_cadastro) return false;
            try {
                const partes = cliente.data_cadastro.split('/');
                const data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
            } catch (e) {
                return false;
            }
        }).length;
    }

    async function buscarCep(cep) {
        const cepNumeros = apenasNumeros(cep);
        if (cepNumeros.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
            if (!response.ok) throw new Error('Não foi possível consultar o CEP.');
            const data = await response.json();
            if (data.erro) {
                setMensagem('CEP não encontrado. Verifique o número informado.');
                setTipoMensagem('erro');
                return;
            }
            setDadosEditados(prev => ({
                ...prev,
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || ''
            }));
            setMensagem('CEP encontrado! Endereço preenchido automaticamente.');
            setTipoMensagem('sucesso');
            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            setMensagem('Não foi possível consultar o CEP. Verifique sua conexão com a internet.');
            setTipoMensagem('erro');
        }
    }

    function handleCpfChange(e) {
        const valor = e.target.value;
        const tipo = clienteSelecionado?.tipo || 'fisico';
        let mascara;
        if (tipo === 'juridico') {
            mascara = formatarCnpj(valor);
        } else {
            mascara = formatarCpf(valor);
        }
        setDadosEditados(prev => ({ ...prev, cpf: mascara }));
    }

    function handleTelefoneChange(e) {
        const valor = e.target.value;
        const mascara = formatarTelefone(valor);
        setDadosEditados(prev => ({ ...prev, telefone: mascara }));
    }

    function handleCepChange(e) {
        const valor = e.target.value;
        const cepFormatado = formatarCep(valor);
        setDadosEditados(prev => ({ ...prev, cep: cepFormatado }));
        const cepNumeros = apenasNumeros(valor);
        if (cepNumeros.length === 8) {
            buscarCep(cepNumeros);
        }
    }

    function handleEditChange(e) {
        const { name, value } = e.target;
        setDadosEditados(prev => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tipo = localStorage.getItem('tipo');
        if (!token || !tipo) {
            navigate('/login');
            return;
        }
        async function buscarClientes() {
            try {
                const response = await fetch(`${API_URL}/clientes`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'X-Access-Token': token }
                });
                if (response.ok) {
                    const data = await response.json();
                    const clientesComMascara = (data.clientes || []).map(cliente => ({
                        ...cliente,
                        cpf: formatarDocumento(cliente.cpf, cliente.tipo),
                        telefone: formatarTelefone(cliente.telefone)
                    }));
                    setClientes(clientesComMascara);
                } else if (response.status === 401) {
                    localStorage.removeItem('nome');
                    localStorage.removeItem('tipo');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    const data = await response.json();
                    setMensagem(data.error || 'Erro ao carregar clientes.');
                    setTipoMensagem('erro');
                }
            } catch (error) {
                setMensagem('Erro de conexão com o servidor.');
                setTipoMensagem('erro');
            } finally {
                setCarregando(false);
            }
        }
        buscarClientes();
    }, [API_URL, navigate]);

    async function abrirModal(cliente) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/cliente/${cliente.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-Access-Token': token }
            });
            if (response.ok) {
                const data = await response.json();
                const clienteComMascara = aplicarMascaras(data.cliente);
                setClienteSelecionado(clienteComMascara);
                setDadosEditados(clienteComMascara);
            } else {
                const clienteComMascara = aplicarMascaras(cliente);
                setClienteSelecionado(clienteComMascara);
                setDadosEditados(clienteComMascara);
            }
        } catch (error) {
            const clienteComMascara = aplicarMascaras(cliente);
            setClienteSelecionado(clienteComMascara);
            setDadosEditados(clienteComMascara);
        }
        setEditando(false);
        setModalAberto(true);
        setCarregandoModal(false);
        setMensagem('');
        setTipoMensagem('');
    }

    function fecharModal() {
        setModalAberto(false);
        setClienteSelecionado(null);
        setEditando(false);
        setDadosEditados({});
        setMensagem('');
        setTipoMensagem('');
    }

    async function handleSalvarEdicao() {
        setCarregandoModal(true);
        try {
            const token = localStorage.getItem('token');
            const dadosParaEnviar = {
                nome: dadosEditados.nome,
                cpf: apenasNumeros(dadosEditados.cpf || ''),
                email: dadosEditados.email,
                telefone: apenasNumeros(dadosEditados.telefone || ''),
                rg: dadosEditados.rg,
                orgao_expedidor: dadosEditados.orgao_expedidor,
                nacionalidade: dadosEditados.nacionalidade,
                estado_civil: dadosEditados.estado_civil,
                profissao: dadosEditados.profissao,
                logradouro: dadosEditados.logradouro,
                numero: dadosEditados.numero,
                complemento: dadosEditados.complemento,
                bairro: dadosEditados.bairro,
                cidade: dadosEditados.cidade,
                estado: dadosEditados.estado,
                cep: apenasNumeros(dadosEditados.cep || ''),
                sexo: dadosEditados.sexo,
                data_nascimento: dadosEditados.data_nascimento,
                razao_social: dadosEditados.razao_social,
                nome_fantasia: dadosEditados.nome_fantasia
            };
            const response = await fetch(`${API_URL}/cliente/${clienteSelecionado.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(dadosParaEnviar)
            });
            const data = await response.json();
            if (response.ok) {
                const clienteAtualizado = aplicarMascaras({
                    ...clienteSelecionado,
                    ...dadosEditados
                });
                setClientes(prev => prev.map(c =>
                    c.id === clienteSelecionado.id ? {
                        ...c,
                        nome: clienteAtualizado.nome,
                        cpf: clienteAtualizado.cpf,
                        email: clienteAtualizado.email,
                        telefone: clienteAtualizado.telefone
                    } : c
                ));
                setClienteSelecionado(clienteAtualizado);
                setDadosEditados(clienteAtualizado);
                setEditando(false);
                setMensagem('Informações atualizadas com sucesso!');
                setTipoMensagem('sucesso');
                setTimeout(() => setMensagem(''), 3000);
            } else {
                setMensagem(data.error || 'Erro ao atualizar informações.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setCarregandoModal(false);
        }
    }

    function cancelarEdicao() {
        setEditando(false);
        setDadosEditados(clienteSelecionado);
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
        setInativando(false);
    }

    async function handleInativar() {
        setInativando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/cliente/${clienteInativar.id}/inativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({ ativo: 0 })
            });
            const data = await response.json();
            if (response.ok) {
                setClientes(prev => prev.map(c =>
                    c.id === clienteInativar.id ? { ...c, status: 'inativo' } : c
                ));
                setModalInativarAberto(false);
                setMensagem('Cliente inativado com sucesso!');
                setTipoMensagem('sucesso');
                setTimeout(() => setMensagem(''), 3000);
            } else {
                setMensagem(data.error || 'Erro ao inativar cliente.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
        } finally {
            setInativando(false);
        }
    }

    async function handleAtivar(cliente) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/cliente/${cliente.id}/ativar`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify({ ativo: 1 })
            });
            const data = await response.json();
            if (response.ok) {
                setClientes(prev => prev.map(c =>
                    c.id === cliente.id ? { ...c, status: 'ativo' } : c
                ));
                setMensagem('Cliente ativado com sucesso!');
                setTipoMensagem('sucesso');
                setTimeout(() => setMensagem(''), 3000);
            } else {
                setMensagem(data.error || 'Erro ao ativar cliente.');
                setTipoMensagem('erro');
            }
        } catch (error) {
            setMensagem('Erro de conexão com o servidor.');
            setTipoMensagem('erro');
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
                        <button className={css.botaoAdicionar} onClick={irParaCadastroCliente} name="btn-adicionar-cliente">+</button>
                    </div>
                    {mensagem && !modalAberto && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: tipoMensagem === 'erro' ? '#f8d7da' : '#d4edda',
                            color: tipoMensagem === 'erro' ? '#721c24' : '#155724',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontFamily: 'Clear Sans, sans-serif'
                        }}>
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
                            <input type="text" className={css.inputBusca} placeholder="Pesquisar por nome do cliente..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} name="filtro_nome" />
                            <svg className={css.iconeBusca} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <div className={css.filtrosOpcoes}>
                            <select className={css.selectFiltro} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} name="filtro_tipo">
                                <option value="todos">Filtrar por: Todos os Tipos</option>
                                <option value="fisico">Pessoa Física</option>
                                <option value="juridico">Pessoa Jurídica</option>
                            </select>
                            <select className={css.selectFiltro} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} name="filtro_status">
                                <option value="todos">Filtrar por: Status</option>
                                <option value="ativo">Ativo</option>
                                <option value="novo">Novo</option>
                                <option value="inadimplente">Inadimplente</option>
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
                                        <td>{cliente.telefone}</td>
                                        <td>
                                                <span className={`${css.statusBadge} ${css[cliente.status]}`}>
                                                    {cliente.status === 'ativo' && 'Em dia'}
                                                    {cliente.status === 'novo' && 'Novo'}
                                                    {cliente.status === 'inadimplente' && 'Inadimplente'}
                                                </span>
                                        </td>
                                        <td className={css.colunaAcoes}>
                                            <button className={css.botaoVer} onClick={() => abrirModal(cliente)} name={`btn-ver-${cliente.id}`}>Ver</button>
                                            {cliente.status === 'inativo' ? (
                                                <button className={css.botaoAtivar} onClick={() => handleAtivar(cliente)} name={`btn-ativar-${cliente.id}`}>Ativar</button>
                                            ) : (
                                                <button className={css.botaoInativar} onClick={() => abrirModalInativar(cliente)} name={`btn-inativar-${cliente.id}`}>Inativar</button>
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
            {modalAberto && clienteSelecionado && (
                <div className={css.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) fecharModal(); }}>
                    <div className={css.modalContainer}>
                        <div className={css.modalHeader}>
                            <h2 className={css.modalTitulo}>Cliente {clienteSelecionado.nome}</h2>
                            <button className={css.modalFechar} onClick={fecharModal}>✕</button>
                        </div>
                        <div className={css.modalBody}>
                            {mensagem && (
                                <div className={`${css.mensagemContainer} ${tipoMensagem === 'sucesso' ? css.sucesso : css.erro}`}>
                                    {mensagem}
                                </div>
                            )}
                            <form className={css.formulario} onSubmit={(e) => e.preventDefault()}>
                                <div className={css.secaoTitulo}>
                                    <h3 className={css.secaoSubtitulo}>
                                        {clienteSelecionado.tipo === 'fisico' ? 'Dados do Cliente' : 'Dados do Cliente Jurídico'}
                                    </h3>
                                </div>
                                <div className={css.linha}>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Nome completo</label>
                                        {editando ? (
                                            <input type="text" name="nome" className={css.input} value={dadosEditados.nome || ''} onChange={handleEditChange} maxLength={254} placeholder="Digite o nome completo" />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.nome || ''} readOnly placeholder="Nome completo" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>{clienteSelecionado.tipo === 'fisico' ? 'CPF' : 'CNPJ'}</label>
                                        {editando ? (
                                            <input type="text" name="cpf" className={css.input} value={dadosEditados.cpf || ''} onChange={handleCpfChange} maxLength={clienteSelecionado.tipo === 'fisico' ? 14 : 18} placeholder={clienteSelecionado.tipo === 'fisico' ? 'Digite o CPF' : 'Digite o CNPJ'} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.cpf || ''} readOnly placeholder={clienteSelecionado.tipo === 'fisico' ? 'CPF' : 'CNPJ'} />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>E-mail</label>
                                        {editando ? (
                                            <input type="email" name="email" className={css.input} value={dadosEditados.email || ''} onChange={handleEditChange} maxLength={254} placeholder="Digite o e-mail" />
                                        ) : (
                                            <input type="email" className={css.input} value={clienteSelecionado.email || ''} readOnly placeholder="E-mail" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Telefone</label>
                                        {editando ? (
                                            <input type="text" name="telefone" className={css.input} value={dadosEditados.telefone || ''} onChange={handleTelefoneChange} maxLength={15} placeholder="Digite o telefone" />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.telefone || ''} readOnly placeholder="Telefone" />
                                        )}
                                    </div>
                                    {clienteSelecionado.tipo === 'fisico' && (
                                        <>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Data de nascimento</label>
                                                {editando ? (
                                                    <input type="text" name="data_nascimento" className={css.input} value={dadosEditados.data_nascimento || ''} onChange={handleEditChange} maxLength={10} placeholder="DD/MM/AAAA" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.data_nascimento || ''} readOnly placeholder="Data de nascimento" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Sexo</label>
                                                {editando ? (
                                                    <input type="text" name="sexo" className={css.input} value={dadosEditados.sexo || ''} onChange={handleEditChange} maxLength={20} placeholder="Digite o sexo" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.sexo || ''} readOnly placeholder="Sexo" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>RG</label>
                                                {editando ? (
                                                    <input type="text" name="rg" className={css.input} value={dadosEditados.rg || ''} onChange={handleEditChange} maxLength={15} placeholder="Digite o RG" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.rg || ''} readOnly placeholder="RG" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Órgão expedidor</label>
                                                {editando ? (
                                                    <input type="text" name="orgao_expedidor" className={css.input} value={dadosEditados.orgao_expedidor || ''} onChange={handleEditChange} maxLength={20} placeholder="Digite o órgão expedidor" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.orgao_expedidor || ''} readOnly placeholder="Órgão expedidor" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nacionalidade</label>
                                                {editando ? (
                                                    <input type="text" name="nacionalidade" className={css.input} value={dadosEditados.nacionalidade || ''} onChange={handleEditChange} maxLength={50} placeholder="Digite a nacionalidade" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.nacionalidade || ''} readOnly placeholder="Nacionalidade" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado civil</label>
                                                {editando ? (
                                                    <input type="text" name="estado_civil" className={css.input} value={dadosEditados.estado_civil || ''} onChange={handleEditChange} maxLength={30} placeholder="Digite o estado civil" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.estado_civil || ''} readOnly placeholder="Estado civil" />
                                                )}
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Profissão</label>
                                                {editando ? (
                                                    <input type="text" name="profissao" className={css.input} value={dadosEditados.profissao || ''} onChange={handleEditChange} maxLength={254} placeholder="Digite a profissão" />
                                                ) : (
                                                    <input type="text" className={css.input} value={clienteSelecionado.profissao || ''} readOnly placeholder="Profissão" />
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {clienteSelecionado.tipo === 'juridico' && (
                                        <>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Razão Social</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.razao_social || ''} readOnly placeholder="Razão Social" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nome Fantasia</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.nome_fantasia || ''} readOnly placeholder="Nome Fantasia" />
                                            </div>
                                        </>
                                    )}
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Logradouro</label>
                                        {editando ? (
                                            <input type="text" name="logradouro" className={css.input} placeholder="Digite o logradouro" value={dadosEditados.logradouro || ''} onChange={handleEditChange} maxLength={254} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.logradouro || ''} readOnly placeholder="Logradouro" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Número</label>
                                        {editando ? (
                                            <input type="text" name="numero" className={css.input} placeholder="Digite o número" value={dadosEditados.numero || ''} onChange={handleEditChange} maxLength={20} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.numero || ''} readOnly placeholder="Número" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Complemento</label>
                                        {editando ? (
                                            <input type="text" name="complemento" className={css.input} placeholder="Digite o complemento" value={dadosEditados.complemento || ''} onChange={handleEditChange} maxLength={100} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.complemento || ''} readOnly placeholder="Complemento" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Bairro</label>
                                        {editando ? (
                                            <input type="text" name="bairro" className={css.input} placeholder="Digite o bairro" value={dadosEditados.bairro || ''} onChange={handleEditChange} maxLength={100} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.bairro || ''} readOnly placeholder="Bairro" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Cidade</label>
                                        {editando ? (
                                            <input type="text" name="cidade" className={css.input} placeholder="Digite a cidade" value={dadosEditados.cidade || ''} onChange={handleEditChange} maxLength={100} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.cidade || ''} readOnly placeholder="Cidade" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Estado</label>
                                        {editando ? (
                                            <input type="text" name="estado" className={css.input} placeholder="Digite o estado" value={dadosEditados.estado || ''} onChange={handleEditChange} maxLength={2} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.estado || ''} readOnly placeholder="Estado" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>CEP</label>
                                        {editando ? (
                                            <input type="text" name="cep" className={css.input} placeholder="Digite o CEP" value={dadosEditados.cep || ''} onChange={handleCepChange} maxLength={9} />
                                        ) : (
                                            <input type="text" className={css.input} value={clienteSelecionado.cep || ''} readOnly placeholder="CEP" />
                                        )}
                                    </div>
                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Data de cadastro</label>
                                        <input type="text" className={css.input} value={clienteSelecionado.data_cadastro || ''} readOnly placeholder="Data de cadastro" />
                                    </div>
                                </div>
                                {clienteSelecionado.tipo === 'juridico' && clienteSelecionado.representante && (
                                    <>
                                        <div className={css.secaoTitulo} style={{ marginTop: '2rem' }}>
                                            <h3 className={css.secaoSubtitulo}>Dados do Representante</h3>
                                        </div>
                                        <div className={css.linha}>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nome completo</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.nome || ''} readOnly placeholder="Nome completo" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>CPF</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.cpf || ''} readOnly placeholder="CPF" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Profissão</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.profissao || ''} readOnly placeholder="Profissão" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Sexo</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.sexo || ''} readOnly placeholder="Sexo" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>RG</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.rg || ''} readOnly placeholder="RG" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Órgão expedidor</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.orgao_expedidor || ''} readOnly placeholder="Órgão expedidor" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nacionalidade</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.nacionalidade || ''} readOnly placeholder="Nacionalidade" />
                                            </div>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado civil</label>
                                                <input type="text" className={css.input} value={clienteSelecionado.representante.estado_civil || ''} readOnly placeholder="Estado civil" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className={css.campoInteiro} style={{ marginTop: '0.5rem' }}>
                                    <p className={css.obsCampos}>* Campos editáveis</p>
                                </div>
                                <div className={css.botaoContainer}>
                                    {editando ? (
                                        <>
                                            <button className={css.botaoCadastro} type="button" onClick={handleSalvarEdicao} disabled={carregandoModal}>
                                                {carregandoModal ? 'Salvando...' : 'Atualizar Informações'}
                                            </button>
                                            <button className={css.botaoCancelar} type="button" onClick={cancelarEdicao}>Cancelar</button>
                                        </>
                                    ) : (
                                        <button className={css.botaoEditar} type="button" onClick={() => setEditando(true)}>Editar</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {modalInativarAberto && clienteInativar && (
                <div className={css.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) fecharModalInativar(); }}>
                    <div className={css.modalInativacao}>
                        <button className={css.modalFecharIconeLeft} onClick={fecharModalInativar}>X</button>
                        <h2 className={css.tituloInativacao}>Certeza que gostaria de<br />inativar?</h2>
                        <p className={css.subtituloInativacao}>Essa ação não pode ser desfeita!</p>
                        <div className={css.botoesInativacao}>
                            <button className={css.btnCancelarInativacao} onClick={fecharModalInativar}>Cancelar</button>
                            <button className={css.btnConfirmarInativacao} onClick={handleInativar} disabled={inativando}>
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