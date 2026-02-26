import { Link } from "react-router-dom";

export const mockLeads = [
  { id: "1", nome: "João Pereira", telefone: "(11) 98765-4321", email: "joao@email.com", tipo: "carro", mensagem: "Quero um SUV zero", criadoEm: "2026-02-25T10:30:00", status: "pendente" as const, atendente: null as string | null },
  { id: "2", nome: "Fernanda Costa", telefone: "(11) 91234-5678", email: "fer@email.com", tipo: "moto", mensagem: "Honda CB 500", criadoEm: "2026-02-25T09:15:00", status: "pendente" as const, atendente: null as string | null },
  { id: "3", nome: "Ricardo Santos", telefone: "(21) 99876-5432", email: "ricardo@email.com", tipo: "caminhao", mensagem: "Caminhão para frete", criadoEm: "2026-02-24T16:45:00", status: "em_atendimento" as const, atendente: "Ana Silva" },
  { id: "4", nome: "Mariana Oliveira", telefone: "(31) 98765-1234", email: "mari@email.com", tipo: "carro", mensagem: "Sedan completo", criadoEm: "2026-02-24T14:20:00", status: "em_atendimento" as const, atendente: "Carlos Mendes" },
  { id: "5", nome: "Bruno Almeida", telefone: "(41) 91234-9876", email: "bruno@email.com", tipo: "carro", mensagem: "Hatch econômico", criadoEm: "2026-02-24T11:00:00", status: "concluido" as const, atendente: "Ana Silva" },
  { id: "6", nome: "Patrícia Lima", telefone: "(51) 99999-8888", email: "pat@email.com", tipo: "moto", mensagem: "Moto custom", criadoEm: "2026-02-23T09:30:00", status: "concluido" as const, atendente: "Carlos Mendes" },
  { id: "7", nome: "Lucas Ferreira", telefone: "(11) 97777-6666", email: "lucas@email.com", tipo: "carro", mensagem: "Pickup diesel", criadoEm: "2026-02-25T11:45:00", status: "pendente" as const, atendente: null },
  { id: "8", nome: "Camila Rocha", telefone: "(21) 96666-5555", email: "camila@email.com", tipo: "carro", mensagem: "SUV 7 lugares", criadoEm: "2026-02-25T08:00:00", status: "pendente" as const, atendente: null },
];

export const mockAtendentes = [
  { id: "a1", nome: "Ana Silva", ativos: 1 },
  { id: "a2", nome: "Carlos Mendes", ativos: 1 },
  { id: "a3", nome: "Juliana Souza", ativos: 0 },
];

export const mockStats = {
  acessosHoje: 347,
  acessosSemana: 2140,
  cadastrosHoje: 4,
  cadastrosSemana: 23,
  taxaConversao: 6.8,
  emAtendimento: 2,
  concluidos: 2,
  pendentes: 4,
};

export const mockAccessByDay = [
  { dia: "Seg", acessos: 280, cadastros: 3 },
  { dia: "Ter", acessos: 320, cadastros: 5 },
  { dia: "Qua", acessos: 410, cadastros: 4 },
  { dia: "Qui", acessos: 370, cadastros: 6 },
  { dia: "Sex", acessos: 450, cadastros: 3 },
  { dia: "Sáb", acessos: 200, cadastros: 1 },
  { dia: "Dom", acessos: 110, cadastros: 1 },
];

export const mockGeoData = [
  { cidade: "São Paulo", estado: "SP", acessos: 892, percentual: 41.7 },
  { cidade: "Rio de Janeiro", estado: "RJ", acessos: 421, percentual: 19.7 },
  { cidade: "Belo Horizonte", estado: "MG", acessos: 287, percentual: 13.4 },
  { cidade: "Curitiba", estado: "PR", acessos: 198, percentual: 9.3 },
  { cidade: "Porto Alegre", estado: "RS", acessos: 156, percentual: 7.3 },
  { cidade: "Brasília", estado: "DF", acessos: 112, percentual: 5.2 },
  { cidade: "Outros", estado: "", acessos: 74, percentual: 3.4 },
];

export const mockTipoVeiculo = [
  { tipo: "Carro", valor: 65 },
  { tipo: "Moto", valor: 22 },
  { tipo: "Caminhão", valor: 10 },
  { tipo: "Outro", valor: 3 },
];

export type Lead = typeof mockLeads[number];
export type Atendente = typeof mockAtendentes[number];
