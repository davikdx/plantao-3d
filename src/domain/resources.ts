/**
 * Ambientes 3D, perfis de recursos (ScenarioResourceProfile) e destinos.
 * Perfis são FICTÍCIOS e configuráveis; não representam a estrutura de toda UBS/UPA/ambulância.
 * Organização da rede baseada em BR-UPA, BR-SAMU, BR-RAPS (ver src/content/references).
 */

export const ENVIRONMENTS = ["emergencia", "consultorio", "ambulancia", "pediatria", "obstetricia", "ubs"] as const;
export type EnvironmentId = (typeof ENVIRONMENTS)[number];

export const ENVIRONMENT_LABELS: Record<EnvironmentId, string> = {
  emergencia: "Sala de emergência / reanimação",
  consultorio: "Consultório de baixa complexidade",
  ambulancia: "Ambulância (pré-hospitalar)",
  pediatria: "Sala pediátrica",
  obstetricia: "Ambiente obstétrico",
  ubs: "UBS — consulta e seguimento"
};

export const RESOURCE_TAGS = [
  "monitor",
  "desfibrilador",
  "oxigenio",
  "nebulizacao",
  "vni",
  "intubacao",
  "ventilador",
  "capnografia",
  "acesso_venoso",
  "acesso_io",
  "acesso_central",
  "dreno_torax",
  "glicosimetro",
  "lab_basico",
  "lab_completo",
  "gasometria",
  "ecg12",
  "rx",
  "usg",
  "pocus",
  "tc",
  "rm",
  "hemocomponentes",
  "trombolitico",
  "hemodinamica",
  "centro_cirurgico",
  "uti",
  "medicacoes_basicas",
  "medicacoes_urgencia",
  "obstetricia",
  "cardiotocografia",
  "teste_rapido",
  "imobilizacao",
  "soroterapia_antiveneno"
] as const;
export type ResourceTag = (typeof RESOURCE_TAGS)[number];

export const DESTINATIONS = [
  "alta_orientada",
  "alta_com_seguimento_ubs",
  "retorno_programado",
  "observacao",
  "internacao_enfermaria",
  "uti",
  "centro_cirurgico",
  "hemodinamica",
  "transferencia_regulada",
  "encaminhamento_ambulatorial",
  "caps",
  "permanece_em_sala_vermelha"
] as const;
export type DestinationId = (typeof DESTINATIONS)[number];

export const DESTINATION_LABELS: Record<DestinationId, string> = {
  alta_orientada: "Alta com orientações e sinais de alarme",
  alta_com_seguimento_ubs: "Alta com seguimento na UBS",
  retorno_programado: "Retorno programado (consulta de seguimento)",
  observacao: "Observação na unidade com reavaliação",
  internacao_enfermaria: "Internação em enfermaria",
  uti: "Unidade de terapia intensiva",
  centro_cirurgico: "Centro cirúrgico",
  hemodinamica: "Sala de hemodinâmica",
  transferencia_regulada: "Transferência via central de regulação",
  encaminhamento_ambulatorial: "Encaminhamento ambulatorial (especialidade)",
  caps: "Articulação com CAPS / RAPS",
  permanece_em_sala_vermelha: "Permanece em sala vermelha aguardando vaga"
};

export interface ScenarioResourceProfile {
  id: string;
  label: string;
  kind: "ubs" | "upa" | "samu_usb" | "samu_usa" | "hospital_regional" | "hospital_referencia";
  context: string;
  resources: ResourceTag[];
  /** multiplicador simulado de tempo de exames; documentado no briefing */
  turnaroundMultiplier: number;
  destinations: DestinationId[];
  notes: string;
}

const BASE_UPA: ResourceTag[] = [
  "monitor",
  "desfibrilador",
  "oxigenio",
  "nebulizacao",
  "vni",
  "intubacao",
  "ventilador",
  "acesso_venoso",
  "acesso_io",
  "glicosimetro",
  "lab_basico",
  "gasometria",
  "ecg12",
  "rx",
  "medicacoes_basicas",
  "medicacoes_urgencia",
  "teste_rapido",
  "imobilizacao"
];

export const RESOURCE_PROFILES: ScenarioResourceProfile[] = [
  {
    id: "ubs-urbana",
    label: "UBS urbana (perfil fictício)",
    kind: "ubs",
    context: "Unidade Básica de Saúde em cidade de médio porte, equipe de Saúde da Família, sem laboratório próprio no local.",
    resources: ["oxigenio", "nebulizacao", "glicosimetro", "ecg12", "medicacoes_basicas", "teste_rapido", "acesso_venoso"],
    turnaroundMultiplier: 1,
    destinations: ["alta_orientada", "alta_com_seguimento_ubs", "retorno_programado", "encaminhamento_ambulatorial", "caps", "transferencia_regulada"],
    notes: "Exames laboratoriais são coletados para resultado em outro dia; urgências são estabilizadas com o disponível e reguladas (SAMU 192)."
  },
  {
    id: "ubs-rural",
    label: "UBS rural (perfil fictício)",
    kind: "ubs",
    context: "Unidade em zona rural, a 60 km do hospital de referência; transporte depende do SAMU 192 ou de veículo municipal.",
    resources: ["oxigenio", "glicosimetro", "medicacoes_basicas", "teste_rapido", "acesso_venoso"],
    turnaroundMultiplier: 1,
    destinations: ["alta_orientada", "alta_com_seguimento_ubs", "retorno_programado", "encaminhamento_ambulatorial", "caps", "transferencia_regulada"],
    notes: "Sem ECG no local neste perfil. Tempo de chegada do SAMU simulado é maior."
  },
  {
    id: "upa-porte-ii",
    label: "UPA 24h (perfil fictício)",
    kind: "upa",
    context: "UPA 24h em capital, com sala vermelha, observação, laboratório básico, radiografia e eletrocardiograma.",
    resources: BASE_UPA,
    turnaroundMultiplier: 1,
    destinations: ["alta_orientada", "alta_com_seguimento_ubs", "observacao", "transferencia_regulada", "permanece_em_sala_vermelha", "caps", "encaminhamento_ambulatorial"],
    notes: "Sem tomografia, centro cirúrgico, hemodinâmica ou UTI; esses destinos exigem regulação."
  },
  {
    id: "samu-usa",
    label: "SAMU 192 — Unidade de Suporte Avançado (perfil fictício)",
    kind: "samu_usa",
    context: "Atendimento pré-hospitalar com médico e enfermeiro; contato com a central de regulação médica do SAMU 192.",
    resources: ["monitor", "desfibrilador", "oxigenio", "nebulizacao", "intubacao", "ventilador", "capnografia", "acesso_venoso", "acesso_io", "glicosimetro", "ecg12", "medicacoes_basicas", "medicacoes_urgencia", "imobilizacao"],
    turnaroundMultiplier: 1,
    destinations: ["transferencia_regulada", "alta_orientada"],
    notes: "Destino definido com a regulação médica; 'alta' no local exige registro e orientação."
  },
  {
    id: "samu-usb",
    label: "SAMU 192 — Unidade de Suporte Básico (perfil fictício)",
    kind: "samu_usb",
    context: "Equipe de técnico de enfermagem e condutor-socorrista, orientada pela regulação médica.",
    resources: ["oxigenio", "desfibrilador", "glicosimetro", "imobilizacao"],
    turnaroundMultiplier: 1,
    destinations: ["transferencia_regulada"],
    notes: "Sem medicações de urgência intravenosas neste perfil."
  },
  {
    id: "hospital-regional",
    label: "Pronto-socorro de hospital regional (perfil fictício)",
    kind: "hospital_regional",
    context: "Hospital geral de interior com tomografia, centro cirúrgico, UTI geral e banco de sangue; sem hemodinâmica.",
    resources: [...BASE_UPA, "capnografia", "acesso_central", "dreno_torax", "lab_completo", "usg", "pocus", "tc", "hemocomponentes", "trombolitico", "centro_cirurgico", "uti", "obstetricia", "cardiotocografia", "soroterapia_antiveneno"],
    turnaroundMultiplier: 1,
    destinations: ["alta_orientada", "alta_com_seguimento_ubs", "observacao", "internacao_enfermaria", "uti", "centro_cirurgico", "transferencia_regulada", "encaminhamento_ambulatorial", "caps"],
    notes: "Hemodinâmica exige transferência regulada para hospital de referência."
  },
  {
    id: "hospital-referencia",
    label: "Hospital de referência terciário (perfil fictício)",
    kind: "hospital_referencia",
    context: "Hospital de referência em capital com hemodinâmica 24h, UTI, centro cirúrgico, obstetrícia de alto risco e neurologia.",
    resources: [...BASE_UPA, "capnografia", "acesso_central", "dreno_torax", "lab_completo", "usg", "pocus", "tc", "rm", "hemocomponentes", "trombolitico", "hemodinamica", "centro_cirurgico", "uti", "obstetricia", "cardiotocografia", "soroterapia_antiveneno"],
    turnaroundMultiplier: 1,
    destinations: ["alta_orientada", "alta_com_seguimento_ubs", "observacao", "internacao_enfermaria", "uti", "centro_cirurgico", "hemodinamica", "encaminhamento_ambulatorial", "caps", "transferencia_regulada"],
    notes: "Perfil completo; ainda assim exames têm tempo de processamento."
  }
];

export function getResourceProfile(id: string): ScenarioResourceProfile | undefined {
  return RESOURCE_PROFILES.find((p) => p.id === id);
}

export const DEVICE_IDS = [
  "monitor_ecg",
  "oximetro",
  "manguito",
  "cateter_nasal",
  "mascara_reservatorio",
  "nebulizador",
  "bvm",
  "tot",
  "vni",
  "acesso_periferico",
  "acesso_io",
  "acesso_central",
  "equipo",
  "dreno_torax",
  "tala",
  "colar_cervical",
  "pas_desfibrilador",
  "sonda_vesical",
  "torniquete",
  "capnografo",
  "cardiotoco",
  "curativo_compressivo"
] as const;
export type DeviceId = (typeof DEVICE_IDS)[number];

export const DEVICE_LABELS: Record<DeviceId, string> = {
  monitor_ecg: "Eletrodos do monitor cardíaco",
  oximetro: "Oxímetro de pulso",
  manguito: "Manguito de pressão não invasiva",
  cateter_nasal: "Cânula nasal de O₂",
  mascara_reservatorio: "Máscara com reservatório (não reinalante)",
  nebulizador: "Máscara de nebulização",
  bvm: "Bolsa-válvula-máscara",
  tot: "Tubo orotraqueal com fixação",
  vni: "Máscara de ventilação não invasiva",
  acesso_periferico: "Acesso venoso periférico",
  acesso_io: "Acesso intraósseo",
  acesso_central: "Acesso venoso central",
  equipo: "Equipo de infusão",
  dreno_torax: "Dreno de tórax",
  tala: "Tala de imobilização",
  colar_cervical: "Colar cervical",
  pas_desfibrilador: "Pás/eletrodos do desfibrilador",
  sonda_vesical: "Sonda vesical de demora",
  torniquete: "Torniquete",
  capnografo: "Capnógrafo",
  cardiotoco: "Transdutores de cardiotocografia",
  curativo_compressivo: "Curativo compressivo"
};
