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

    const API_URL = api || 'http://192.168.0.123:5000';


    function formatarTelefone(telefone) {
        if (!telefone) return '--';
        const numeros = telefone.replace(/\D/g, '');
        if (numeros.length === 0) return '--';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 7) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
        if (numeros.length <= 11) return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
        return telefone;
    }

    function formatarDocumento(doc) {
        if (!doc || doc === '--') return '--';
        const numeros = doc.replace(/\D/g, '');
        if (numeros.length === 11) {
            return `${numeros.slice(0,3)}.${numeros.slice(3,6)}.${numeros.slice(6,9)}-${numeros.slice(9)}`;
        }
        if (numeros.length === 14) {
            return `${numeros.slice(0,2)}.${numeros.slice(2,5)}.${numeros.slice(5,8)}/${numeros.slice(8,12)}-${numeros.slice(12)}`;
        }
        return doc;
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
                    setClientes(data.clientes || []);
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
                setClienteSelecionado(data.cliente);
                setDadosEditados(data.cliente);
            } else {
                setClienteSelecionado(cliente);
                setDadosEditados(cliente);
            }
        } catch (error) {
            setClienteSelecionado(cliente);
            setDadosEditados(cliente);
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

    function handleEditChange(e) {
        const { name, value } = e.target;
        setDadosEditados(prev => ({ ...prev, [name]: value }));
    }

    async function handleSalvarEdicao() {
        setCarregandoModal(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/cliente/${clienteSelecionado.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': token
                },
                body: JSON.stringify(dadosEditados)
            });

            const data = await response.json();
            if (response.ok) {
                setClientes(prev => prev.map(c =>
                    c.id === clienteSelecionado.id ? { ...c, ...dadosEditados } : c
                ));
                setClienteSelecionado(prev => ({ ...prev, ...dadosEditados }));
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
                        <button
                            className={css.botaoAdicionar}
                            onClick={irParaCadastroCliente}
                            name="btn-adicionar-cliente"
                        >
                            +
                        </button>
                    </div>

                    {mensagem && (
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
                            <input
                                type="text"
                                className={css.inputBusca}
                                placeholder="Pesquisar por nome do cliente..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                                name="filtro_nome"
                            />
                            <svg className={css.iconeBusca} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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
                                        <td>{formatarTelefone(cliente.telefone)}</td>
                                        <td>
                                            <span className={`${css.statusBadge} ${css[cliente.status]}`}>
                                                {cliente.status === 'ativo' && 'Em dia'}
                                                {cliente.status === 'novo' && 'Novo'}
                                                {cliente.status === 'inadimplente' && 'Inadimplente'}
                                            </span>
                                        </td>
                                        <td className={css.colunaAcoes}>
                                            <button
                                                className={css.botaoVer}
                                                onClick={() => abrirModal(cliente)}
                                                name={`btn-ver-${cliente.id}`}
                                            >
                                                Ver
                                            </button>
                                            {cliente.status === 'inativo' ? (
                                                <button
                                                    className={css.botaoAtivar}
                                                    onClick={() => handleAtivar(cliente)}
                                                    name={`btn-ativar-${cliente.id}`}
                                                >
                                                    Ativar
                                                </button>
                                            ) : (
                                                <button
                                                    className={css.botaoInativar}
                                                    onClick={() => abrirModalInativar(cliente)}
                                                    name={`btn-inativar-${cliente.id}`}
                                                >
                                                    Inativar
                                                </button>
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
                <div className={css.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) fecharModal();
                }}>
                    <div className={css.modalContainer}>
                        <div className={css.modalHeader}>
                            <h2 className={css.modalTitulo}>Cliente {clienteSelecionado.nome}</h2>
                            <button className={css.modalFechar} onClick={fecharModal}>
                                ✕
                            </button>
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
                                            <input
                                                type="text"
                                                name="nome"
                                                className={css.input}
                                                value={dadosEditados.nome || ''}
                                                onChange={handleEditChange}
                                                maxLength={254}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.nome || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>{clienteSelecionado.tipo === 'fisico' ? 'CPF' : 'CNPJ'}</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="cpf"
                                                className={css.input}
                                                value={dadosEditados.cpf || ''}
                                                onChange={handleEditChange}
                                                maxLength={clienteSelecionado.tipo === 'fisico' ? 14 : 18}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={formatarDocumento(clienteSelecionado.cpf) || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>E-mail</label>
                                        {editando ? (
                                            <input
                                                type="email"
                                                name="email"
                                                className={css.input}
                                                value={dadosEditados.email || ''}
                                                onChange={handleEditChange}
                                                maxLength={254}
                                            />
                                        ) : (
                                            <input
                                                type="email"
                                                className={css.input}
                                                value={clienteSelecionado.email || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Telefone</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="telefone"
                                                className={css.input}
                                                value={dadosEditados.telefone || ''}
                                                onChange={handleEditChange}
                                                maxLength={15}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={formatarTelefone(clienteSelecionado.telefone) || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>


                                    {clienteSelecionado.tipo === 'fisico' && (
                                        <>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Data de nascimento</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="data_nascimento"
                                                        className={css.input}
                                                        value={dadosEditados.data_nascimento || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={10}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.data_nascimento || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Sexo</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="sexo"
                                                        className={css.input}
                                                        value={dadosEditados.sexo || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={20}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.sexo || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>RG</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="rg"
                                                        className={css.input}
                                                        value={dadosEditados.rg || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={15}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.rg || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Órgão expedidor</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="orgao_expedidor"
                                                        className={css.input}
                                                        value={dadosEditados.orgao_expedidor || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={20}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.orgao_expedidor || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nacionalidade</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="nacionalidade"
                                                        className={css.input}
                                                        value={dadosEditados.nacionalidade || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={50}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.nacionalidade || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado civil</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="estado_civil"
                                                        className={css.input}
                                                        value={dadosEditados.estado_civil || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={30}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.estado_civil || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Profissão</label>
                                                {editando ? (
                                                    <input
                                                        type="text"
                                                        name="profissao"
                                                        className={css.input}
                                                        value={dadosEditados.profissao || ''}
                                                        onChange={handleEditChange}
                                                        maxLength={254}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={css.input}
                                                        value={clienteSelecionado.profissao || '--'}
                                                        readOnly
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}


                                    {clienteSelecionado.tipo === 'juridico' && (
                                        <>
                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Razão Social</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.razao_social || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nome Fantasia</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.nome_fantasia || '--'}
                                                    readOnly
                                                />
                                            </div>
                                        </>
                                    )}


                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Logradouro</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="logradouro"
                                                className={css.input}
                                                placeholder="Digite o logradouro"
                                                value={dadosEditados.logradouro || ''}
                                                onChange={handleEditChange}
                                                maxLength={254}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.logradouro || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Número</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="numero"
                                                className={css.input}
                                                placeholder="Digite o número"
                                                value={dadosEditados.numero || ''}
                                                onChange={handleEditChange}
                                                maxLength={20}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.numero || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Complemento</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="complemento"
                                                className={css.input}
                                                placeholder="Digite o complemento"
                                                value={dadosEditados.complemento || ''}
                                                onChange={handleEditChange}
                                                maxLength={100}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.complemento || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Bairro</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="bairro"
                                                className={css.input}
                                                placeholder="Digite o bairro"
                                                value={dadosEditados.bairro || ''}
                                                onChange={handleEditChange}
                                                maxLength={100}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.bairro || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Cidade</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="cidade"
                                                className={css.input}
                                                placeholder="Digite a cidade"
                                                value={dadosEditados.cidade || ''}
                                                onChange={handleEditChange}
                                                maxLength={100}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.cidade || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Estado</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="estado"
                                                className={css.input}
                                                placeholder="Digite o estado"
                                                value={dadosEditados.estado || ''}
                                                onChange={handleEditChange}
                                                maxLength={2}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.estado || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>CEP</label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                name="cep"
                                                className={css.input}
                                                placeholder="Digite o CEP"
                                                value={dadosEditados.cep || ''}
                                                onChange={handleEditChange}
                                                maxLength={9}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className={css.input}
                                                value={clienteSelecionado.cep || '--'}
                                                readOnly
                                            />
                                        )}
                                    </div>

                                    <div className={css.campoMetade}>
                                        <label className={css.label}>Data de cadastro</label>
                                        <input
                                            type="text"
                                            className={css.input}
                                            value={clienteSelecionado.data_cadastro || '--'}
                                            readOnly
                                        />
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
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.nome || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>CPF</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.cpf ? formatarDocumento(clienteSelecionado.representante.cpf) : '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Profissão</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.profissao || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Sexo</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.sexo || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>RG</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.rg || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Órgão expedidor</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.orgao_expedidor || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Nacionalidade</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.nacionalidade || '--'}
                                                    readOnly
                                                />
                                            </div>

                                            <div className={css.campoMetade}>
                                                <label className={css.label}>Estado civil</label>
                                                <input
                                                    type="text"
                                                    className={css.input}
                                                    value={clienteSelecionado.representante.estado_civil || '--'}
                                                    readOnly
                                                />
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
                                            <button
                                                className={css.botaoCadastro}
                                                type="button"
                                                onClick={handleSalvarEdicao}
                                                disabled={carregandoModal}
                                            >
                                                {carregandoModal ? 'Salvando...' : 'Atualizar Informações'}
                                            </button>
                                            <button
                                                className={css.botaoCancelar}
                                                type="button"
                                                onClick={cancelarEdicao}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className={css.botaoEditar}
                                            type="button"
                                            onClick={() => setEditando(true)}
                                        >
                                            Editar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {modalInativarAberto && clienteInativar && (
                <div className={css.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) fecharModalInativar();
                }}>
                    <div className={css.modalInativacao}>
                        <button className={css.modalFecharIconeLeft} onClick={fecharModalInativar}>
                            X
                        </button>

                        <h2 className={css.tituloInativacao}>
                            Certeza que gostaria de<br />inativar?
                        </h2>

                        <p className={css.subtituloInativacao}>
                            Essa ação não pode ser desfeita!
                        </p>

                        <div className={css.botoesInativacao}>
                            <button className={css.btnCancelarInativacao} onClick={fecharModalInativar}>
                                Cancelar
                            </button>
                            <button
                                className={css.btnConfirmarInativacao}
                                onClick={handleInativar}
                                disabled={inativando}
                            >
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