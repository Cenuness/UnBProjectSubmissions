import React, { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useDisconnect,
  WagmiConfig,
} from "wagmi";
import { contractAddress as CONTRACT_ADDRESS, contractABI as CONTRACT_ABI } from "./config";
import { wagmiConfig } from "./wagmi";
import { ethers } from "ethers";

const scadContract = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};

// Nova paleta baseada na imagem fornecida
const COLORS = {
  // Cores principais da paleta Adobe
  wineRed: "#59252F",      // #59252F - Vermelho vinho escuro
  deepBlue: "#041626",     // #041626 - Azul marinho muito escuro
  forestGreen: "#2D4030",  // #2D4030 - Verde floresta escuro
  warmBeige: "#BF9F86",    // #BF9F86 - Bege quente/terroso
  darkBrown: "#3B302C",    // #3B302C - Marrom muito escuro
  
  // Cores derivadas para interface
  background: "#0A1A2A",           // Fundo escuro baseado no deepBlue
  cardBg: "#1A2A3A",              // Fundo de cards
  cardHover: "#223344",           // Hover de cards
  border: "#2D3B4A",              // Bordas sutis
  accent: "#59252F",              // Cor de destaque (wineRed)
  accentSecondary: "#2D4030",     // Destaque secundário (forestGreen)
  textPrimary: "#FFFFFF",         // Texto primário (branco)
  textSecondary: "#A0B0C0",       // Texto secundário
  success: "#27A286",             // Sucesso (mantido)
  warning: "#E6B45C",             // Aviso (mantido)
  error: "#D84C4C",               // Erro (mantido)
  highlight: "#BF9F86",           // Destaque (warmBeige)
};

const SCADDapp = () => {
  const { address, status: acctStatus } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address, watch: true });
  const { disconnect } = useDisconnect();
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState("meuPerfil");
  
  // Estados para formulários
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [consultHash, setConsultHash] = useState("");
  const [pedidoAddress, setPedidoAddress] = useState("");

  // Dados do cadastro
  const [meuCadastro, setMeuCadastro] = useState(null);
  const [cadastroConsultado, setCadastroConsultado] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  
  // Dados do perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfilPublico, setPerfilPublico] = useState(true);

  // Dados simulados
  const [pedidosPendentes] = useState([
    {
      id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      de: "0x789...def",
      para: address,
      data: "2024-01-15 14:30",
      tipo: "Acesso Completo",
      status: "pendente"
    }
  ]);

  const [meusPedidos] = useState([
    {
      id: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      de: address,
      para: "0x123...456",
      data: "2024-01-13 16:45",
      tipo: "Acesso Completo",
      status: "pendente"
    }
  ]);

  const [contratosVigentes] = useState([
    {
      id: "0xcontract1234567890abcdef1234567890abcdef1234567890abcdef123456",
      partes: [address, "0x123...456"],
      dataInicio: "2024-01-01",
      dataExpiracao: "2024-12-31",
      tipo: "Acesso Completo",
      status: "ativo",
      podeRevogar: true
    }
  ]);

  // --- READ: Verificar se a carteira está registrada ---
  const { refetch: refetchRegistered } = useContractRead({
    ...scadContract,
    functionName: "carteiraRegistrada",
    args: [address],
    enabled: !!address,
    onSuccess: (data) => {
      setIsRegistered(data);
      if (!data) {
        setMeuCadastro(null);
        setIsCompany(false);
      }
    },
    onError: (error) => {
      console.log("Erro ao verificar registro:", error);
      setIsRegistered(false);
    }
  });

  // --- READ: Ver meu cadastro ---
  const { refetch: refetchMeuCadastro } = useContractRead({
    ...scadContract,
    functionName: "verMeuCadastro",
    enabled: !!address && isRegistered,
    onSuccess: (data) => {
      if (data && data[0] !== "" && data[0] !== "0x") {
        setMeuCadastro({
          identificador: data[0],
          isCompany: data[1]
        });
        setIsCompany(data[1]);
      } else {
        setMeuCadastro(null);
        setIsCompany(false);
      }
    },
    onError: (error) => {
      console.log("Erro ao buscar cadastro:", error);
      setMeuCadastro(null);
      setIsCompany(false);
    }
  });

  // --- WRITE: Registrar usuário (CPF) ---
  const { config: configRegistrarUsuario } = usePrepareContractWrite({
    ...scadContract,
    functionName: "registrarUsuario",
    args: [cpf],
    enabled: cpf.length === 11,
  });

  const { write: writeRegistrarUsuario, data: dataUsuario } = useContractWrite(configRegistrarUsuario);

  useWaitForTransaction({
    hash: dataUsuario?.hash,
    onSuccess: () => {
      setStatusMsg("✓ Registro realizado com sucesso.");
      setCpf("");
      setTimeout(() => {
        refetchRegistered();
        refetchMeuCadastro();
        refetchBalance();
      }, 2000);
    },
    onError: (error) => {
      let mensagem = "✗ Erro no registro";
      if (error.message.includes("JaRegistrado")) mensagem = "✗ Esta carteira já possui registro.";
      if (error.message.includes("IdentificadorInvalido")) mensagem = "✗ CPF inválido.";
      if (error.message.includes("revert")) mensagem = "✗ Erro na transação.";
      setStatusMsg(mensagem);
    },
  });

  // --- WRITE: Registrar empresa (CNPJ) ---
  const { config: configRegistrarEmpresa } = usePrepareContractWrite({
    ...scadContract,
    functionName: "registrarEmpresa",
    args: [cnpj],
    enabled: cnpj.length === 14,
  });

  const { write: writeRegistrarEmpresa, data: dataEmpresa } = useContractWrite(configRegistrarEmpresa);

  useWaitForTransaction({
    hash: dataEmpresa?.hash,
    onSuccess: () => {
      setStatusMsg("✓ Empresa registrada com êxito.");
      setCnpj("");
      setTimeout(() => {
        refetchRegistered();
        refetchMeuCadastro();
        refetchBalance();
      }, 2000);
    },
    onError: (error) => {
      let mensagem = "✗ Erro no registro";
      if (error.message.includes("JaRegistrado")) mensagem = "✗ Esta carteira já possui registro.";
      if (error.message.includes("IdentificadorInvalido")) mensagem = "✗ CNPJ inválido.";
      if (error.message.includes("revert")) mensagem = "✗ Erro na transação.";
      setStatusMsg(mensagem);
    },
  });

  // --- READ: Consultar cadastro por hash ---
  const consultarCadastroPorHash = async () => {
    if (!consultHash) {
      setStatusMsg("✗ Informe o hash para consulta.");
      return;
    }
    
    try {
      setStatusMsg("⌛ Buscando perfil...");
      
      // Simulação de busca de perfil
      setTimeout(() => {
        const perfilEncontrado = {
          identificador: "12345678901",
          isCompany: false,
          endereco: "0x15AAc870c870c870c870c870c870c870c870",
          saldo: "150.75 TCESS",
          dataRegistro: "15/01/2024"
        };
        
        setCadastroConsultado(perfilEncontrado);
        setStatusMsg("✓ Perfil encontrado.");
      }, 1000);
      
    } catch (error) {
      setStatusMsg(`✗ Erro: ${error.message}`);
      setCadastroConsultado(null);
    }
  };

  // Funções para processos
  const solicitarAcesso = () => {
    if (!pedidoAddress) {
      setStatusMsg("✗ Informe a carteira de destino.");
      return;
    }
    
    setStatusMsg("✓ Solicitação de acesso enviada.");
    setPedidoAddress("");
  };

  const responderPedido = (pedidoId, aceitar) => {
    if (aceitar) {
      setStatusMsg("✓ Acesso concedido e contrato criado.");
    } else {
      setStatusMsg("✓ Solicitação recusada.");
    }
  };

  const revogarContrato = (contratoId) => {
    setStatusMsg("✓ Contrato revogado com sucesso.");
  };

  const atualizarPerfil = () => {
    if (!nome.trim()) {
      setStatusMsg("✗ Nome é obrigatório.");
      return;
    }
    
    setStatusMsg("✓ Perfil atualizado com sucesso.");
  };

  useEffect(() => {
    if (address && acctStatus === "connected") {
      refetchRegistered();
    }
  }, [address, acctStatus]);

  useEffect(() => {
    if (isRegistered && address) {
      refetchMeuCadastro();
    } else {
      setMeuCadastro(null);
      setIsCompany(false);
    }
  }, [isRegistered, address]);

  const formatarHash = (hash, start = 6, end = 4) => {
    if (!hash) return "";
    if (hash.length <= start + end) return hash;
    return `${hash.slice(0, start)}...${hash.slice(-end)}`;
  };

  const copiarEndereco = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setStatusMsg('✓ Endereço copiado.');
    }
  };

  const abas = [
    { id: 'meuPerfil', label: 'Perfil' },
    { id: 'processos', label: 'Processos' },
    { id: 'consultar', label: 'Consulta' },
    { id: 'registrar', label: 'Registro' },
  ];

  // Estilos com a nova paleta escura
  const styles = {
    container: {
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '0',
      position: 'relative',
      overflowX: 'hidden',
    },

    content: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },

    header: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '2rem',
      background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.forestGreen} 100%)`,
      borderRadius: '16px',
      border: `1px solid ${COLORS.border}`,
    },

    title: {
      fontSize: '3.5rem',
      fontWeight: '800',
      color: COLORS.textPrimary,
      marginBottom: '0.5rem',
      letterSpacing: '-0.5px',
    },

    subtitle: {
      fontSize: '1.2rem',
      color: COLORS.textSecondary,
      fontWeight: '400',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    },

    // Cards com a nova paleta
    glassCard: {
      background: COLORS.cardBg,
      borderRadius: '16px',
      border: `1px solid ${COLORS.border}`,
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
    },

    card: {
      background: COLORS.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        background: COLORS.cardHover,
      },
    },

    // Botões
    buttonPrimary: {
      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.wineRed} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '0.875rem 1.75rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 20px ${COLORS.accent}40`,
      },
    },

    buttonSecondary: {
      background: 'transparent',
      color: COLORS.highlight,
      border: `1px solid ${COLORS.highlight}`,
      borderRadius: '10px',
      padding: '0.875rem 1.75rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: `${COLORS.highlight}20`,
        transform: 'translateY(-2px)',
      },
    },

    buttonOutline: {
      background: 'transparent',
      color: COLORS.textSecondary,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '10px',
      padding: '0.875rem 1.75rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: `${COLORS.border}30`,
        color: COLORS.textPrimary,
      },
    },

    // Tabs
    tabContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      background: COLORS.cardBg,
      borderRadius: '12px',
      padding: '0.5rem',
      border: `1px solid ${COLORS.border}`,
    },

    tabButton: {
      flex: 1,
      padding: '1rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      color: COLORS.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        background: `${COLORS.border}30`,
        color: COLORS.textPrimary,
      },
    },

    tabButtonActive: {
      background: `${COLORS.accent}20`,
      color: COLORS.textPrimary,
      border: `1px solid ${COLORS.accent}40`,
    },

    // Inputs
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '0.95rem',
      borderRadius: '10px',
      border: `1px solid ${COLORS.border}`,
      background: COLORS.cardHover,
      color: COLORS.textPrimary,
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', sans-serif",
      '&:focus': {
        outline: 'none',
        borderColor: COLORS.accent,
        boxShadow: `0 0 0 3px ${COLORS.accent}20`,
      },
    },

    // Badges
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.375rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      letterSpacing: '0.3px',
    },

    badgeSuccess: {
      background: `${COLORS.accentSecondary}30`,
      color: COLORS.accentSecondary,
      border: `1px solid ${COLORS.accentSecondary}50`,
    },

    badgeWarning: {
      background: `${COLORS.warning}20`,
      color: COLORS.warning,
      border: `1px solid ${COLORS.warning}40`,
    },

    // Grids
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
    },

    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
    },

    // Estilos específicos
    walletInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },

    walletAddress: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      background: COLORS.cardBg,
      borderRadius: '10px',
      border: `1px solid ${COLORS.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: COLORS.cardHover,
      },
    },

    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: '1.5rem',
      borderBottom: `1px solid ${COLORS.border}`,
      paddingBottom: '0.5rem',
    },

    dataRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: `1px solid ${COLORS.border}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    },

    dataLabel: {
      color: COLORS.textSecondary,
      fontWeight: '500',
      fontSize: '0.9rem',
    },

    dataValue: {
      color: COLORS.textPrimary,
      fontWeight: '600',
      fontSize: '0.95rem',
    },

    hashDisplay: {
      fontFamily: "'Roboto Mono', monospace",
      fontSize: '0.85rem',
      padding: '1rem',
      background: `${COLORS.deepBlue}`,
      borderRadius: '10px',
      border: `1px solid ${COLORS.border}`,
      wordBreak: 'break-all',
      color: COLORS.highlight,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: `${COLORS.deepBlue}80`,
      },
    },
  };

  // Renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'meuPerfil':
        return (
          <div style={styles.grid2}>
            {/* Dados Pessoais */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>Meu Perfil</h3>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Nome:</span>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>E-mail:</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Telefone:</span>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Saldo TCESS:</span>
                  <span style={{ ...styles.dataValue, color: COLORS.accentSecondary }}>
                    {balanceData ? `${balanceData.formatted} ${balanceData.symbol}` : '0.00 TCESS'}
                  </span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Perfil Público:</span>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={perfilPublico}
                      onChange={(e) => setPerfilPublico(e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
                      {perfilPublico ? 'Visível publicamente' : 'Apenas para autorizados'}
                    </span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={atualizarPerfil}
                style={{ ...styles.buttonPrimary, width: '100%' }}
              >
                Atualizar Perfil
              </button>
            </div>
            
            {/* Identificação na Rede */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>Identificação na Rede</h3>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Carteira:</span>
                  <span style={{ ...styles.dataValue, fontFamily: "'Roboto Mono', monospace" }}>
                    {formatarHash(address)}
                  </span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Rede:</span>
                  <span style={styles.dataValue}>CESS Testnet</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Chain ID:</span>
                  <span style={styles.dataValue}>11330</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Data de Registro:</span>
                  <span style={styles.dataValue}>15/01/2024</span>
                </div>
                
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Status:</span>
                  <span style={{ ...styles.dataValue, color: COLORS.accentSecondary, fontWeight: '700' }}>
                    ATIVO • VERIFICADO
                  </span>
                </div>
              </div>
              
              <button
                onClick={copiarEndereco}
                style={{ ...styles.buttonSecondary, width: '100%' }}
              >
                Copiar Endereço da Carteira
              </button>
            </div>
          </div>
        );

      case 'processos':
        return (
          <div style={styles.grid3}>
            {/* Pedidos Pendentes */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>
                Pedidos Pendentes
                <span style={{ ...styles.badge, ...styles.badgeWarning, marginLeft: 'auto' }}>
                  {pedidosPendentes.length}
                </span>
              </h3>
              
              {pedidosPendentes.map((pedido, index) => (
                <div key={index} style={{ ...styles.card, marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
                      De: {formatarHash(pedido.de)}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.textPrimary }}>
                      {pedido.tipo}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => responderPedido(pedido.id, true)}
                      style={{ ...styles.buttonPrimary, flex: 1, padding: '0.5rem' }}
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => responderPedido(pedido.id, false)}
                      style={{ ...styles.buttonOutline, flex: 1, padding: '0.5rem' }}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Meus Pedidos */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>
                Meus Pedidos
                <span style={{ ...styles.badge, ...styles.badgeWarning, marginLeft: 'auto' }}>
                  {meusPedidos.length}
                </span>
              </h3>
              
              {meusPedidos.map((pedido, index) => (
                <div key={index} style={{ ...styles.card, marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
                      Para: {formatarHash(pedido.para)}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.textPrimary }}>
                      {pedido.tipo}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
                      {pedido.data}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contratos Vigentes */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>
                Contratos Ativos
                <span style={{ ...styles.badge, ...styles.badgeSuccess, marginLeft: 'auto' }}>
                  {contratosVigentes.length}
                </span>
              </h3>
              
              {contratosVigentes.map((contrato, index) => (
                <div key={index} style={{ ...styles.card, marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.textPrimary, marginBottom: '0.5rem' }}>
                      {contrato.tipo}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: COLORS.textSecondary }}>
                      Expira em: {contrato.dataExpiracao}
                    </div>
                  </div>
                  {contrato.podeRevogar && (
                    <button
                      onClick={() => revogarContrato(contrato.id)}
                      style={{ ...styles.buttonOutline, width: '100%', padding: '0.5rem' }}
                    >
                      Revogar Contrato
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'consultar':
        return (
          <div style={styles.grid2}>
            {/* Formulário de Consulta */}
            <div style={styles.glassCard}>
              <h3 style={styles.sectionTitle}>Buscar Perfil</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ ...styles.dataLabel, marginBottom: '0.5rem' }}>
                  Hash do Perfil:
                </div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={consultHash}
                  onChange={(e) => setConsultHash(e.target.value)}
                  style={styles.input}
                />
                <div style={{ fontSize: '0.85rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
                  Insira o hash único do perfil que deseja consultar
                </div>
              </div>
              
              <button
                onClick={consultarCadastroPorHash}
                style={{ ...styles.buttonPrimary, width: '100%' }}
              >
                Buscar Perfil
              </button>
            </div>
            
            {/* Resultado da Consulta */}
            {cadastroConsultado && (
              <div style={styles.glassCard}>
                <h3 style={styles.sectionTitle}>Perfil Consultado</h3>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Carteira:</span>
                    <span style={{ ...styles.dataValue, fontFamily: "'Roboto Mono', monospace" }}>
                      {formatarHash(cadastroConsultado.endereco, 4, 4)}
                    </span>
                  </div>
                  
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Tipo:</span>
                    <span style={styles.dataValue}>
                      {cadastroConsultado.isCompany ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </span>
                  </div>
                  
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Saldo TCESS:</span>
                    <span style={{ ...styles.dataValue, color: COLORS.accentSecondary }}>
                      {cadastroConsultado.saldo}
                    </span>
                  </div>
                  
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Data de Registro:</span>
                    <span style={styles.dataValue}>
                      {cadastroConsultado.dataRegistro}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setStatusMsg("✓ Solicitação de contrato enviada.")}
                    style={styles.buttonPrimary}
                  >
                    Solicitar Contrato
                  </button>
                  
                  <button
                    onClick={() => {
                      // Aqui você mostraria os contratos do perfil
                      setStatusMsg("✓ Exibindo contratos do perfil.");
                    }}
                    style={styles.buttonSecondary}
                  >
                    Ver Contratos
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'registrar':
        return (
          <div>
            {isRegistered ? (
              <div style={{ ...styles.glassCard, textAlign: 'center' }}>
                <h3 style={{ color: COLORS.accentSecondary, marginBottom: '1rem' }}>
                  ✓ Registro Concluído
                </h3>
                <p style={{ color: COLORS.textSecondary, marginBottom: '2rem' }}>
                  Identificação já registrada no arquivo permanente.
                </p>
                <button
                  onClick={() => setActiveTab('meuPerfil')}
                  style={styles.buttonPrimary}
                >
                  Completar Perfil
                </button>
              </div>
            ) : (
              <div style={styles.grid2}>
                {/* Pessoa Física */}
                <div style={styles.glassCard}>
                  <h3 style={styles.sectionTitle}>Pessoa Física</h3>
                  <p style={{ color: COLORS.textSecondary, marginBottom: '1.5rem' }}>
                    Registro civil para indivíduos
                  </p>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ ...styles.dataLabel, marginBottom: '0.5rem' }}>
                      CPF (11 dígitos):
                    </div>
                    <input
                      type="text"
                      placeholder="00011122233"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                      style={{
                        ...styles.input,
                        borderColor: cpf.length === 11 ? COLORS.accentSecondary : cpf.length > 0 ? COLORS.error : COLORS.border,
                      }}
                      maxLength={11}
                    />
                    {cpf && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: cpf.length === 11 ? COLORS.accentSecondary : COLORS.error,
                        marginTop: '0.5rem',
                      }}>
                        {cpf.length === 11 ? '✓ Formato válido' : '✗ 11 dígitos necessários'}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (cpf.length !== 11) {
                        setStatusMsg("✗ Requer 11 dígitos.");
                        return;
                      }
                      setStatusMsg("⌛ Processando registro...");
                      writeRegistrarUsuario?.();
                    }}
                    disabled={!writeRegistrarUsuario || cpf.length !== 11}
                    style={{
                      ...styles.buttonPrimary,
                      width: '100%',
                      opacity: cpf.length === 11 ? 1 : 0.5,
                    }}
                  >
                    Registrar Pessoa Física
                  </button>
                </div>
                
                {/* Pessoa Jurídica */}
                <div style={styles.glassCard}>
                  <h3 style={styles.sectionTitle}>Pessoa Jurídica</h3>
                  <p style={{ color: COLORS.textSecondary, marginBottom: '1.5rem' }}>
                    Registro comercial para empresas
                  </p>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ ...styles.dataLabel, marginBottom: '0.5rem' }}>
                      CNPJ (14 dígitos):
                    </div>
                    <input
                      type="text"
                      placeholder="00111222333344"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                      style={{
                        ...styles.input,
                        borderColor: cnpj.length === 14 ? COLORS.accentSecondary : cnpj.length > 0 ? COLORS.error : COLORS.border,
                      }}
                      maxLength={14}
                    />
                    {cnpj && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: cnpj.length === 14 ? COLORS.accentSecondary : COLORS.error,
                        marginTop: '0.5rem',
                      }}>
                        {cnpj.length === 14 ? '✓ Formato válido' : '✗ 14 dígitos necessários'}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (cnpj.length !== 14) {
                        setStatusMsg("✗ Requer 14 dígitos.");
                        return;
                      }
                      setStatusMsg("⌛ Processando registro...");
                      writeRegistrarEmpresa?.();
                    }}
                    disabled={!writeRegistrarEmpresa || cnpj.length !== 14}
                    style={{
                      ...styles.buttonPrimary,
                      width: '100%',
                      opacity: cnpj.length === 14 ? 1 : 0.5,
                    }}
                  >
                    Registrar Pessoa Jurídica
                  </button>
                </div>
              </div>
            )}
            
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: `${COLORS.warning}15`,
              borderRadius: '12px',
              border: `1px solid ${COLORS.warning}30`,
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textSecondary }}>
                ⚠️ <strong>Atenção:</strong> O registro é permanente e imutável. Verifique os dados antes de confirmar.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>SCAD ARCHIVES</h1>
          <p style={styles.subtitle}>
            Sistema de Consentimento e Auditoria Descentralizada
          </p>
        </header>
        
        {acctStatus !== "connected" ? (
          <ConnectWallet styles={styles} COLORS={COLORS} />
        ) : (
          <>
            {/* Wallet Info */}
            <div style={styles.walletInfo}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div 
                  style={styles.walletAddress}
                  onClick={copiarEndereco}
                  title="Clique para copiar"
                >
                  <span style={{ fontWeight: '600', color: COLORS.textPrimary }}>
                    {formatarHash(address)}
                  </span>
                </div>
                <div style={{ ...styles.badge, ...(isRegistered ? styles.badgeSuccess : styles.badgeWarning) }}>
                  {isRegistered ? 'Registrado' : 'Não Registrado'}
                </div>
              </div>
              
              <button
                onClick={disconnect}
                style={{ ...styles.buttonOutline, padding: '0.5rem 1rem' }}
              >
                Sair
              </button>
            </div>
            
            {/* Navigation Tabs */}
            <div style={styles.tabContainer}>
              {abas.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab.id ? styles.tabButtonActive : {})
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {renderContent()}
            
            {/* Status Message */}
            {statusMsg && (
              <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                padding: '1rem 1.5rem',
                background: statusMsg.includes('✓') ? `${COLORS.accentSecondary}20` : `${COLORS.error}20`,
                color: statusMsg.includes('✓') ? COLORS.accentSecondary : COLORS.error,
                borderRadius: '10px',
                border: `1px solid ${statusMsg.includes('✓') ? COLORS.accentSecondary : COLORS.error}40`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
              }}>
                {statusMsg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Componente de Conexão de Carteira
const ConnectWallet = ({ styles, COLORS }) => {
  const { connect, connectors, error } = useConnect();

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <div style={styles.glassCard}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: COLORS.textPrimary,
            marginBottom: '1rem',
          }}>
            Conectar Carteira
          </h2>
          <p style={{ color: COLORS.textSecondary }}>
            Conecte sua identificação blockchain para acessar os arquivos SCAD
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              style={{
                ...styles.buttonPrimary,
                padding: '1.25rem 2rem',
                fontSize: '1rem',
              }}
            >
              Conectar com {connector.name.toUpperCase()}
            </button>
          ))}
        </div>
        
        {error && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: `${COLORS.error}20`,
            borderRadius: '10px',
            border: `1px solid ${COLORS.error}40`,
            color: COLORS.error,
          }}>
            <strong>Erro:</strong> {error.message}
          </div>
        )}
        
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: `${COLORS.deepBlue}`,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textSecondary, fontStyle: 'italic' }}>
            "A privacidade não é um luxo, é um direito fundamental. Cada consentimento é um capítulo na história do controle sobre seus próprios dados."
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SCADDappWithWagmiProvider() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SCADDapp />
    </WagmiConfig>
  );
}