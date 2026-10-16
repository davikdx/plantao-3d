import { DrugDefinitionSchema, type DrugDefinition } from "../../domain/schema";
import type { UnitId } from "../../domain/units";

/**
 * Catálogo por princípio ativo (DCB). Apresentações são exemplos usuais no Brasil que EXIGEM
 * conferência no Bulário/registro da Anvisa (BR-ANVISA). Faixas de dose são transcritas pelo autor
 * a partir das fontes citadas; status "pendente" até revisão clínica qualificada.
 * Estas faixas alimentam apenas ALERTAS educativos — o simulador não sugere dose.
 */
const REV = "2026-10-15";
type Q = { value: number; unit: UnitId };
const q = (value: number, unit: UnitId): Q => ({ value, unit });

type DR = DrugDefinition["doseRules"][number];
const r = (
  id: string,
  population: DR["population"],
  indication: string,
  route: DR["route"],
  mode: DR["mode"],
  min: Q,
  max: Q,
  sourceIds: string[],
  extra: Partial<DR> = {}
): DR => ({ id, population, indication, route, mode, min, max, sourceIds, ...extra });

const drugsRaw: DrugDefinition[] = [
  {
    id: "adrenalina", name: "Adrenalina (epinefrina)", drugClass: "Simpaticomimético / vasopressor",
    presentations: [{ id: "amp1mg", label: "Ampola 1 mg/mL (1 mL)", concentration: q(1, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IM", "IV", "IO"],
    indications: ["Anafilaxia (IM)", "Parada cardiorrespiratória (IV/IO)", "Choque refratário (infusão)"],
    contraindications: ["Na anafilaxia não há contraindicação absoluta à adrenalina IM"],
    interactions: ["Betabloqueadores podem reduzir resposta"],
    onset: "IM: minutos; IV: imediato", duration: "Curta (minutos)",
    doseRules: [
      r("adr-ana-adulto", "adulto", "Anafilaxia", "IM", "bolus", q(0.3, "mg"), q(0.5, "mg"), ["INT-WAO-ANAFILAXIA"], { maxSingle: q(0.5, "mg"), frequency: "pode repetir a cada 5–15 min se necessário" }),
      r("adr-ana-idoso", "idoso", "Anafilaxia", "IM", "bolus", q(0.3, "mg"), q(0.5, "mg"), ["INT-WAO-ANAFILAXIA"]),
      r("adr-ana-ped", "pediatrico", "Anafilaxia", "IM", "bolus", q(0.01, "mg/kg"), q(0.01, "mg/kg"), ["INT-WAO-ANAFILAXIA"], { maxSingle: q(0.5, "mg") }),
      r("adr-pcr-adulto", "adulto", "PCR", "IV", "bolus", q(1, "mg"), q(1, "mg"), ["INT-AHA-ALS"], { frequency: "a cada 3–5 min" }),
      r("adr-pcr-idoso", "idoso", "PCR", "IV", "bolus", q(1, "mg"), q(1, "mg"), ["INT-AHA-ALS"]),
      r("adr-pcr-io", "adulto", "PCR", "IO", "bolus", q(1, "mg"), q(1, "mg"), ["INT-AHA-ALS"]),
      r("adr-inf", "adulto", "Choque/anafilaxia refratária", "IV", "infusao", q(0.01, "mcg/kg/min"), q(0.5, "mcg/kg/min"), ["BR-SAMU-SAV"], { notes: "Faixa a conferir; titulação em ambiente monitorizado." })
    ],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-WAO-ANAFILAXIA", "INT-AHA-ALS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "noradrenalina", name: "Noradrenalina (norepinefrina)", drugClass: "Vasopressor",
    presentations: [{ id: "amp4mg", label: "Ampola 4 mg/4 mL (1 mg/mL de base; conferir sal na bula)", concentration: q(1, "mg/mL"), form: "ampola", volumeMl: 4 }, { id: "sol64", label: "Solução preparada 16 mg/250 mL SG5% (64 microgramas/mL)", concentration: q(64, "mcg/mL"), form: "bolsa", volumeMl: 250 }],
    routes: ["IV"], indications: ["Choque com hipotensão persistente após volume (ou concomitante)"], contraindications: ["Hipovolemia não corrigida (relativa)"], interactions: [],
    onset: "1–2 min", duration: "Enquanto infundida",
    doseRules: [r("nora-adulto", "adulto", "Choque", "IV", "infusao", q(0.02, "mcg/kg/min"), q(1, "mcg/kg/min"), ["INT-SSC-2021"], { notes: "Faixa usual a conferir; titular para PAM ≥ 65 mmHg." }), r("nora-idoso", "idoso", "Choque", "IV", "infusao", q(0.02, "mcg/kg/min"), q(1, "mcg/kg/min"), ["INT-SSC-2021"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-SSC-2021"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "amiodarona", name: "Amiodarona", drugClass: "Antiarrítmico classe III",
    presentations: [{ id: "amp150", label: "Ampola 50 mg/mL (3 mL = 150 mg)", concentration: q(50, "mg/mL"), form: "ampola", volumeMl: 3 }],
    routes: ["IV", "IO"], indications: ["FV/TV sem pulso refratária ao choque", "Taquiarritmias estáveis selecionadas"], contraindications: ["Bradicardia/BAV sem marca-passo (fora da PCR)"], interactions: ["Prolongamento de QT"],
    onset: "Minutos", duration: "Longa",
    doseRules: [r("amio-pcr1", "adulto", "PCR — FV/TV refratária", "IV", "bolus", q(150, "mg"), q(300, "mg"), ["INT-AHA-ALS"], { notes: "300 mg na primeira dose e 150 mg na segunda: conferir na seção completa da diretriz (pendente)." }), r("amio-pcr-idoso", "idoso", "PCR — FV/TV refratária", "IV", "bolus", q(150, "mg"), q(300, "mg"), ["INT-AHA-ALS"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AHA-ALS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "sf09", name: "Cloreto de sódio 0,9%", drugClass: "Cristaloide",
    presentations: [{ id: "bolsa500", label: "Bolsa 500 mL", concentration: q(9, "mg/mL"), form: "bolsa", volumeMl: 500 }, { id: "bolsa1000", label: "Bolsa 1000 mL", concentration: q(9, "mg/mL"), form: "bolsa", volumeMl: 1000 }],
    routes: ["IV", "IO"], indications: ["Expansão volêmica", "Reposição hidroeletrolítica"], contraindications: ["Congestão/sobrecarga volêmica (cautela)"], interactions: [],
    onset: "Imediato", duration: "Variável",
    doseRules: [
      r("sf-adulto", "adulto", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["INT-SSC-2021"], { notes: "Reavaliar após cada alíquota." }),
      r("sf-idoso", "idoso", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["INT-SSC-2021"]),
      r("sf-gest", "gestante", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["BR-GESTACAO"]),
      r("sf-ped", "pediatrico", "Expansão", "IV", "infusao_volume", q(10, "mL/kg"), q(20, "mL/kg"), ["BR-SAMU-SAV"], { notes: "Alíquotas com reavaliação; cautela em lactente com bronquiolite e em choque cardiogênico." }),
      r("sf-ped-io", "pediatrico", "Expansão", "IO", "infusao_volume", q(10, "mL/kg"), q(20, "mL/kg"), ["BR-SAMU-SAV"])
    ],
    availability: ["acesso_venoso"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "ringer_lactato", name: "Ringer com lactato", drugClass: "Cristaloide balanceado",
    presentations: [{ id: "bolsa500", label: "Bolsa 500 mL", concentration: q(6, "mg/mL"), form: "bolsa", volumeMl: 500 }, { id: "bolsa1000", label: "Bolsa 1000 mL", concentration: q(6, "mg/mL"), form: "bolsa", volumeMl: 1000 }],
    routes: ["IV", "IO"], indications: ["Expansão volêmica"], contraindications: [], interactions: ["Não infundir no mesmo acesso de hemocomponentes"],
    onset: "Imediato", duration: "Variável",
    doseRules: [r("rl-adulto", "adulto", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["INT-SSC-2021"]), r("rl-idoso", "idoso", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["INT-SSC-2021"]), r("rl-gest", "gestante", "Expansão", "IV", "infusao_volume", q(250, "mL"), q(2000, "mL"), ["BR-GESTACAO"]), r("rl-ped", "pediatrico", "Expansão", "IV", "infusao_volume", q(10, "mL/kg"), q(20, "mL/kg"), ["BR-SAMU-SAV"])],
    availability: ["acesso_venoso"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "concentrado_hemacias", name: "Concentrado de hemácias", drugClass: "Hemocomponente",
    presentations: [{ id: "unidade", label: "Unidade (~300 mL)", concentration: q(1, "mg/mL"), form: "bolsa", volumeMl: 300 }],
    routes: ["IV", "IO"], indications: ["Hemorragia com instabilidade", "Anemia sintomática conforme critérios"], contraindications: [], interactions: ["Exige tipagem/prova cruzada salvo emergência (O negativo/positivo conforme protocolo)"],
    onset: "Imediato", duration: "—",
    doseRules: [r("ch-adulto", "adulto", "Hemorragia", "IV", "infusao_volume", q(250, "mL"), q(1200, "mL"), ["BR-SAMU-SAV"]), r("ch-gest", "gestante", "Hemorragia", "IV", "infusao_volume", q(250, "mL"), q(1200, "mL"), ["BR-GESTACAO"])],
    availability: ["hemocomponentes"], sourceIds: ["BR-SAMU-SAV"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "ceftriaxona", name: "Ceftriaxona", drugClass: "Cefalosporina de 3ª geração",
    presentations: [{ id: "fa1g", label: "Frasco-ampola 1 g (reconstituir)", concentration: q(100, "mg/mL"), form: "frasco_ampola", volumeMl: 10 }],
    routes: ["IV", "IM"], indications: ["Infecções bacterianas graves conforme foco e epidemiologia"], contraindications: ["Alergia grave a betalactâmicos", "Neonatos com hiperbilirrubinemia/cálcio IV"], interactions: [],
    onset: "—", duration: "24 h (meia-vida longa)",
    doseRules: [r("cef-adulto", "adulto", "Infecção grave", "IV", "bolus", q(1000, "mg"), q(2000, "mg"), ["INT-SSC-2021"], { notes: "Escolha do antimicrobiano depende do foco e protocolo local." }), r("cef-idoso", "idoso", "Infecção grave", "IV", "bolus", q(1000, "mg"), q(2000, "mg"), ["INT-SSC-2021"]), r("cef-ped", "pediatrico", "Infecção grave", "IV", "bolus", q(50, "mg/kg"), q(100, "mg/kg"), ["BR-SAMU-SAV"], { maxSingle: q(2000, "mg") })],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "piperacilina_tazobactam", name: "Piperacilina + tazobactam", drugClass: "Penicilina + inibidor de betalactamase",
    presentations: [{ id: "fa45", label: "Frasco-ampola 4 g + 0,5 g", concentration: q(225, "mg/mL"), form: "frasco_ampola", volumeMl: 20 }],
    routes: ["IV"], indications: ["Infecção grave com risco de germe resistente, conforme protocolo"], contraindications: ["Alergia a penicilinas"], interactions: [],
    onset: "—", duration: "6–8 h",
    doseRules: [r("pt-adulto", "adulto", "Infecção grave", "IV", "bolus", q(4500, "mg"), q(4500, "mg"), ["INT-SSC-2021"], { notes: "Dose total do frasco (4 g + 0,5 g); ajustar em disfunção renal." }), r("pt-idoso", "idoso", "Infecção grave", "IV", "bolus", q(4500, "mg"), q(4500, "mg"), ["INT-SSC-2021"])],
    renalHepatic: "Ajuste renal necessário",
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "glicose50", name: "Glicose 50%", drugClass: "Carboidrato hipertônico",
    presentations: [{ id: "amp10", label: "Ampola 50% 10 mL (500 mg/mL)", concentration: q(500, "mg/mL"), form: "ampola", volumeMl: 10 }],
    routes: ["IV"], indications: ["Hipoglicemia com alteração de consciência", "Associada à insulina na hipercalemia"], contraindications: ["Extravasamento causa lesão tecidual — acesso calibroso"], interactions: [],
    onset: "Minutos", duration: "Curta — reavaliar glicemia",
    doseRules: [r("g50-adulto", "adulto", "Hipoglicemia", "IV", "bolus", q(10, "g"), q(25, "g"), ["BR-SAMU-SAV"], { notes: "Faixa a conferir no protocolo; reavaliar glicemia em 10–15 min." }), r("g50-idoso", "idoso", "Hipoglicemia", "IV", "bolus", q(10, "g"), q(25, "g"), ["BR-SAMU-SAV"])],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-SAMU-SAV"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "glicose10", name: "Glicose 10%", drugClass: "Carboidrato",
    presentations: [{ id: "frasco250", label: "Frasco 250 mL (100 mg/mL)", concentration: q(100, "mg/mL"), form: "frasco", volumeMl: 250 }],
    routes: ["IV", "IO"], indications: ["Hipoglicemia em criança", "Manutenção"], contraindications: [], interactions: [],
    onset: "Minutos", duration: "Curta",
    doseRules: [r("g10-ped", "pediatrico", "Hipoglicemia", "IV", "bolus", q(0.2, "g/kg"), q(0.5, "g/kg"), ["BR-SAMU-SAV"], { notes: "Equivale a 2–5 mL/kg de glicose 10%; conferir protocolo pediátrico." })],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "sg5", name: "Glicose 5% (soro glicosado)", drugClass: "Solução de glicose para manutenção",
    presentations: [{ id: "bolsa500", label: "Bolsa 500 mL (50 mg/mL)", concentration: q(50, "mg/mL"), form: "bolsa", volumeMl: 500 }],
    routes: ["IV"], indications: ["Associar à hidratação na CAD quando a glicemia cai (~200–250 mg/dL), mantendo a insulina"], contraindications: [], interactions: [],
    onset: "Imediato", duration: "Enquanto infundida",
    doseRules: [r("sg5-cad", "adulto", "CAD — glicemia em queda", "IV", "infusao_volume", q(250, "mL"), q(1000, "mL"), ["BR-SBD-CAD"], { notes: "Volume/velocidade a conferir no protocolo." }), r("sg5-ado", "pediatrico", "CAD — glicemia em queda", "IV", "infusao_volume", q(5, "mL/kg"), q(15, "mL/kg"), ["BR-SBD-CAD"])],
    availability: ["acesso_venoso"], sourceIds: ["BR-ANVISA", "BR-SBD-CAD"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "glucagon", name: "Glucagon", drugClass: "Hormônio hiperglicemiante",
    presentations: [{ id: "fa1mg", label: "Frasco-ampola 1 mg (reconstituído 1 mg/mL)", concentration: q(1, "mg/mL"), form: "frasco_ampola", volumeMl: 1 }],
    routes: ["IM", "SC"], indications: ["Hipoglicemia grave sem acesso venoso"], contraindications: ["Feocromocitoma"], interactions: [],
    onset: "10–15 min", duration: "1–1,5 h",
    doseRules: [r("glucagon-adulto", "adulto", "Hipoglicemia grave", "IM", "bolus", q(1, "mg"), q(1, "mg"), ["BR-SBD"]), r("glucagon-idoso", "idoso", "Hipoglicemia grave", "IM", "bolus", q(1, "mg"), q(1, "mg"), ["BR-SBD"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-SBD"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "insulina_regular", name: "Insulina humana regular", drugClass: "Insulina de ação rápida",
    presentations: [{ id: "fr100", label: "Frasco 100 UI/mL (10 mL)", concentration: q(100, "UI/mL"), form: "frasco", volumeMl: 10 }],
    routes: ["IV", "SC"], indications: ["Cetoacidose/estado hiperosmolar (infusão IV)", "Hipercalemia (com glicose)"], contraindications: ["K⁺ < 3,3 mmol/L na CAD antes de repor potássio"], interactions: [],
    onset: "IV: minutos", duration: "IV: curta",
    doseRules: [
      r("ins-cad", "adulto", "Cetoacidose diabética", "IV", "infusao", q(0.05, "UI/kg/h"), q(0.14, "UI/kg/h"), ["BR-SBD-CAD"], { notes: "Faixa a conferir no capítulo da SBD; só após K⁺ ≥ 3,3 mmol/L." }),
      r("ins-shh-idoso", "idoso", "Estado hiperglicêmico hiperosmolar", "IV", "infusao", q(0.05, "UI/kg/h"), q(0.1, "UI/kg/h"), ["BR-SBD-SHH-2025"], { notes: "Após reidratação inicial e K⁺ ≥ 3,3 mEq/L; queda de glicemia 50–70 mg/dL/h." }),
      r("ins-hiperk", "adulto", "Hipercalemia", "IV", "bolus", q(5, "UI"), q(10, "UI"), ["INT-UKKA-HIPERK"], { notes: "Sempre associada à glicose; dose a conferir no PDF da diretriz." }),
      r("ins-hiperk-idoso", "idoso", "Hipercalemia", "IV", "bolus", q(5, "UI"), q(10, "UI"), ["INT-UKKA-HIPERK"])
    ],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-SBD-CAD"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "kcl", name: "Cloreto de potássio 19,1%", drugClass: "Eletrólito",
    presentations: [{ id: "amp10", label: "Ampola 19,1% 10 mL (2,56 mEq/mL) — diluir obrigatoriamente", concentration: q(2.56, "mEq/mL"), form: "ampola", volumeMl: 10 }],
    routes: ["IV"], indications: ["Reposição de potássio"], contraindications: ["Hipercalemia", "Bolus IV direto (proibido)"], interactions: [],
    onset: "—", duration: "—",
    doseRules: [r("kcl-cad", "adulto", "Reposição na CAD", "IV", "infusao_volume", q(10, "mEq"), q(40, "mEq"), ["BR-SBD-CAD"], { notes: "Diluído no soro; velocidade máxima em veia periférica a conferir no protocolo." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-SBD-CAD"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "gluconato_calcio", name: "Gluconato de cálcio 10%", drugClass: "Eletrólito / estabilizador de membrana",
    presentations: [{ id: "amp10", label: "Ampola 10% 10 mL (100 mg/mL)", concentration: q(100, "mg/mL"), form: "ampola", volumeMl: 10 }],
    routes: ["IV"], indications: ["Hipercalemia com alteração eletrocardiográfica", "Hipocalcemia sintomática", "Intoxicação por magnésio"], contraindications: ["Uso de digitálico (cautela)"], interactions: ["Precipita com bicarbonato"],
    onset: "1–3 min", duration: "30–60 min",
    doseRules: [r("gc-adulto", "adulto", "Hipercalemia com ECG alterado", "IV", "bolus", q(1000, "mg"), q(3000, "mg"), ["INT-UKKA-HIPERK"], { notes: "Pode repetir se ECG não melhorar; dose a conferir." }), r("gc-idoso", "idoso", "Hipercalemia com ECG alterado", "IV", "bolus", q(1000, "mg"), q(3000, "mg"), ["INT-UKKA-HIPERK"]), r("gc-gest", "gestante", "Intoxicação por magnésio", "IV", "bolus", q(1000, "mg"), q(1000, "mg"), ["BR-GESTACAO"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-UKKA-HIPERK"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "salbutamol", name: "Salbutamol", drugClass: "Beta-2 agonista de curta ação",
    presentations: [{ id: "spray100", label: "Aerossol 100 microgramas/jato (com espaçador)", concentration: q(100, "mcg/mL"), form: "spray" }, { id: "neb5", label: "Solução para nebulização 5 mg/mL", concentration: q(5, "mg/mL"), form: "solucao_nebulizacao" }],
    routes: ["inalatoria", "nebulizacao"], indications: ["Broncoespasmo", "Adjuvante na hipercalemia (nebulização)"], contraindications: [], interactions: ["Hipocalemia, taquicardia"],
    onset: "5 min", duration: "4–6 h",
    doseRules: [
      r("sal-spray-adulto", "adulto", "Crise de asma/broncoespasmo", "inalatoria", "bolus", q(400, "mcg"), q(1000, "mcg"), ["INT-GINA", "BR-ASMA"], { frequency: "a cada 20 min na primeira hora" }),
      r("sal-spray-ped", "pediatrico", "Crise de asma", "inalatoria", "bolus", q(200, "mcg"), q(1000, "mcg"), ["INT-GINA", "BR-ASMA"]),
      r("sal-neb-adulto", "adulto", "Broncoespasmo/hipercalemia", "nebulizacao", "bolus", q(2.5, "mg"), q(10, "mg"), ["INT-GINA", "INT-UKKA-HIPERK"]),
      r("sal-neb-idoso", "idoso", "Broncoespasmo", "nebulizacao", "bolus", q(2.5, "mg"), q(5, "mg"), ["INT-GINA"]),
      r("sal-neb-ped", "pediatrico", "Crise de asma", "nebulizacao", "bolus", q(2.5, "mg"), q(5, "mg"), ["INT-GINA"])
    ],
    availability: ["nebulizacao", "medicacoes_basicas"], sourceIds: ["BR-ANVISA", "INT-GINA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "ipratropio", name: "Brometo de ipratrópio", drugClass: "Anticolinérgico inalatório",
    presentations: [{ id: "neb025", label: "Solução para nebulização 0,25 mg/mL", concentration: q(0.25, "mg/mL"), form: "solucao_nebulizacao" }],
    routes: ["nebulizacao"], indications: ["Crise de asma moderada/grave (associado ao beta-2)", "Exacerbação de DPOC"], contraindications: [], interactions: [],
    onset: "15 min", duration: "4–6 h",
    doseRules: [r("ipra-adulto", "adulto", "Crise grave", "nebulizacao", "bolus", q(0.25, "mg"), q(0.5, "mg"), ["INT-GINA"]), r("ipra-idoso", "idoso", "Exacerbação", "nebulizacao", "bolus", q(0.25, "mg"), q(0.5, "mg"), ["INT-GOLD"]), r("ipra-ped", "pediatrico", "Crise grave", "nebulizacao", "bolus", q(0.125, "mg"), q(0.25, "mg"), ["INT-GINA"])],
    availability: ["nebulizacao", "medicacoes_basicas"], sourceIds: ["BR-ANVISA", "INT-GINA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "metilprednisolona", name: "Metilprednisolona", drugClass: "Corticosteroide sistêmico",
    presentations: [{ id: "fa125", label: "Frasco-ampola 125 mg", concentration: q(62.5, "mg/mL"), form: "frasco_ampola", volumeMl: 2 }],
    routes: ["IV"], indications: ["Crise de asma grave", "Exacerbação de DPOC (via oral é equivalente quando possível)"], contraindications: [], interactions: ["Hiperglicemia"],
    onset: "Horas", duration: "12–36 h",
    doseRules: [r("mp-adulto", "adulto", "Asma/DPOC", "IV", "bolus", q(40, "mg"), q(125, "mg"), ["INT-GINA", "INT-GOLD"]), r("mp-idoso", "idoso", "Asma/DPOC", "IV", "bolus", q(40, "mg"), q(125, "mg"), ["INT-GOLD"]), r("mp-ped", "pediatrico", "Asma", "IV", "bolus", q(1, "mg/kg"), q(2, "mg/kg"), ["INT-GINA"], { maxSingle: q(60, "mg") })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "hidrocortisona", name: "Hidrocortisona", drugClass: "Corticosteroide sistêmico",
    presentations: [{ id: "fa100", label: "Frasco-ampola 100 mg", concentration: q(50, "mg/mL"), form: "frasco_ampola", volumeMl: 2 }, { id: "fa500", label: "Frasco-ampola 500 mg", concentration: q(125, "mg/mL"), form: "frasco_ampola", volumeMl: 4 }],
    routes: ["IV", "IM"], indications: ["Insuficiência adrenal aguda", "Adjuvante em anafilaxia/asma (não substitui adrenalina)"], contraindications: [], interactions: ["Hiperglicemia"],
    onset: "Horas", duration: "8–12 h",
    doseRules: [r("hc-adulto", "adulto", "Adjuvante / insuficiência adrenal", "IV", "bolus", q(100, "mg"), q(200, "mg"), ["BR-SAMU-SAV"]), r("hc-idoso", "idoso", "Adjuvante / insuficiência adrenal", "IV", "bolus", q(100, "mg"), q(200, "mg"), ["BR-SAMU-SAV"]), r("hc-ped", "pediatrico", "Adjuvante", "IV", "bolus", q(2, "mg/kg"), q(4, "mg/kg"), ["BR-SAMU-SAV"], { maxSingle: q(100, "mg") })],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "prednisona", name: "Prednisona", drugClass: "Corticosteroide oral",
    presentations: [{ id: "cp20", label: "Comprimido 20 mg", concentration: q(20, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Crise de asma", "Exacerbação de DPOC"], contraindications: [], interactions: [],
    onset: "Horas", duration: "12–36 h",
    doseRules: [r("pred-adulto", "adulto", "Asma/DPOC", "VO", "bolus", q(40, "mg"), q(50, "mg"), ["INT-GINA", "INT-GOLD"]), r("pred-idoso", "idoso", "DPOC", "VO", "bolus", q(40, "mg"), q(40, "mg"), ["INT-GOLD"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "prednisolona", name: "Prednisolona (solução oral)", drugClass: "Corticosteroide oral",
    presentations: [{ id: "sol3", label: "Solução oral 3 mg/mL", concentration: q(3, "mg/mL"), form: "frasco" }],
    routes: ["VO"], indications: ["Crise de asma pediátrica"], contraindications: [], interactions: [],
    onset: "Horas", duration: "12–36 h",
    doseRules: [r("predl-ped", "pediatrico", "Asma", "VO", "bolus", q(1, "mg/kg"), q(2, "mg/kg"), ["INT-GINA"], { maxSingle: q(40, "mg") })],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "sulfato_magnesio", name: "Sulfato de magnésio", drugClass: "Eletrólito / anticonvulsivante obstétrico / broncodilatador adjuvante",
    presentations: [{ id: "amp50", label: "Ampola 50% 10 mL (500 mg/mL)", concentration: q(500, "mg/mL"), form: "ampola", volumeMl: 10 }, { id: "amp10", label: "Ampola 10% 10 mL (100 mg/mL)", concentration: q(100, "mg/mL"), form: "ampola", volumeMl: 10 }],
    routes: ["IV", "IM"], indications: ["Pré-eclâmpsia grave/eclâmpsia", "Crise de asma grave refratária"], contraindications: ["Miastenia gravis", "Insuficiência renal (ajustar/monitorar)"], interactions: ["Potencializa bloqueadores neuromusculares"],
    onset: "Imediato (IV)", duration: "Enquanto infundido",
    doseRules: [
      r("mg-ataque-gest", "gestante", "Pré-eclâmpsia grave — ataque", "IV", "infusao_volume", q(4000, "mg"), q(6000, "mg"), ["BR-GESTACAO"], { notes: "Ataque em 10–20 min (a conferir); monitorar reflexos, FR e diurese." }),
      r("mg-manut-gest", "gestante", "Pré-eclâmpsia grave — manutenção", "IV", "infusao", q(1000, "mg/h"), q(2000, "mg/h"), ["BR-GESTACAO"]),
      r("mg-asma", "adulto", "Asma grave", "IV", "infusao_volume", q(2000, "mg"), q(2000, "mg"), ["INT-GINA"], { notes: "Em 20 min; dose a conferir." })
    ],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "prometazina", name: "Prometazina", drugClass: "Anti-histamínico H1",
    presentations: [{ id: "amp25", label: "Ampola 25 mg/mL (2 mL)", concentration: q(25, "mg/mL"), form: "ampola", volumeMl: 2 }],
    routes: ["IM"], indications: ["Sintomas cutâneos de reação alérgica (adjuvante; não trata choque/broncoespasmo)"], contraindications: ["Menores de 2 anos"], interactions: ["Sedação aditiva"],
    onset: "20 min", duration: "4–6 h",
    doseRules: [r("prom-adulto", "adulto", "Adjuvante em reação alérgica", "IM", "bolus", q(25, "mg"), q(50, "mg"), ["BR-SAMU-SAV"])],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "naloxona", name: "Naloxona", drugClass: "Antagonista opioide",
    presentations: [{ id: "amp04", label: "Ampola 0,4 mg/mL (1 mL)", concentration: q(0.4, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IV", "IM", "IN"], indications: ["Depressão respiratória por opioide"], contraindications: [], interactions: ["Abstinência aguda em usuários dependentes"],
    onset: "IV 1–2 min", duration: "30–90 min (pode ser menor que o opioide)",
    doseRules: [r("nal-iv", "adulto", "Intoxicação por opioide", "IV", "bolus", q(0.04, "mg"), q(2, "mg"), ["INT-AHA"], { notes: "Titular para ventilação adequada; doses iniciais baixas em dependentes." }), r("nal-im", "adulto", "Intoxicação por opioide", "IM", "bolus", q(0.4, "mg"), q(2, "mg"), ["INT-AHA"]), r("nal-in", "adulto", "Intoxicação por opioide", "IN", "bolus", q(0.4, "mg"), q(4, "mg"), ["INT-AHA"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AHA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "diazepam", name: "Diazepam", drugClass: "Benzodiazepínico",
    presentations: [{ id: "amp10", label: "Ampola 5 mg/mL (2 mL)", concentration: q(5, "mg/mL"), form: "ampola", volumeMl: 2 }],
    routes: ["IV", "retal"], indications: ["Crise convulsiva prolongada"], contraindications: ["Via IM (absorção errática)"], interactions: ["Depressão respiratória com outros depressores"],
    onset: "1–3 min", duration: "Curta (redistribuição)",
    doseRules: [r("dz-adulto", "adulto", "Estado de mal — 1ª fase", "IV", "bolus", q(0.15, "mg/kg"), q(0.2, "mg/kg"), ["INT-AES-2016"], { maxSingle: q(10, "mg") }), r("dz-gest", "gestante", "Crise convulsiva", "IV", "bolus", q(0.15, "mg/kg"), q(0.2, "mg/kg"), ["INT-AES-2016"], { maxSingle: q(10, "mg") }), r("dz-ped", "pediatrico", "Crise prolongada", "IV", "bolus", q(0.15, "mg/kg"), q(0.2, "mg/kg"), ["INT-AES-2016"], { maxSingle: q(10, "mg") })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AES-2016"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "midazolam", name: "Midazolam", drugClass: "Benzodiazepínico",
    presentations: [{ id: "amp15", label: "Ampola 5 mg/mL (3 mL)", concentration: q(5, "mg/mL"), form: "ampola", volumeMl: 3 }],
    routes: ["IM", "IV", "IN"], indications: ["Crise convulsiva prolongada (IM sem acesso)", "Sedação"], contraindications: [], interactions: ["Depressão respiratória"],
    onset: "IM 5 min", duration: "1–2 h",
    doseRules: [r("mdz-im", "adulto", "Estado de mal — 1ª fase", "IM", "bolus", q(10, "mg"), q(10, "mg"), ["INT-AES-2016"], { notes: "Adulto > 40 kg." }), r("mdz-im-ped", "pediatrico", "Crise prolongada", "IM", "bolus", q(5, "mg"), q(10, "mg"), ["INT-AES-2016"], { notes: "5 mg para 13–40 kg; 10 mg > 40 kg." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AES-2016"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "fenitoina", name: "Fenitoína", drugClass: "Anticonvulsivante",
    presentations: [{ id: "amp250", label: "Ampola 50 mg/mL (5 mL)", concentration: q(50, "mg/mL"), form: "ampola", volumeMl: 5 }],
    routes: ["IV"], indications: ["Estado de mal — 2ª fase"], contraindications: ["Bradicardia/BAV", "Diluir apenas em SF 0,9%"], interactions: ["Múltiplas (indutor enzimático)"],
    onset: "10–30 min", duration: "Longa",
    doseRules: [r("fnt-adulto", "adulto", "Estado de mal — 2ª fase", "IV", "infusao_volume", q(18, "mg/kg"), q(20, "mg/kg"), ["INT-AES-2016"], { notes: "Velocidade máxima de infusão a conferir (risco cardiovascular)." }), r("fnt-ped", "pediatrico", "Estado de mal — 2ª fase", "IV", "infusao_volume", q(18, "mg/kg"), q(20, "mg/kg"), ["INT-AES-2016"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AES-2016"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "aas", name: "Ácido acetilsalicílico", drugClass: "Antiagregante plaquetário",
    presentations: [{ id: "cp100", label: "Comprimido 100 mg", concentration: q(100, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Síndrome coronariana aguda"], contraindications: ["Alergia a AAS", "Sangramento ativo"], interactions: [],
    onset: "Minutos (mastigado)", duration: "Vida da plaqueta",
    doseRules: [r("aas-sca", "adulto", "SCA — ataque", "VO", "bolus", q(150, "mg"), q(325, "mg"), ["INT-ESC-SCA-2023"], { notes: "Faixa de ataque a conferir na diretriz; mastigar." }), r("aas-sca-idoso", "idoso", "SCA — ataque", "VO", "bolus", q(150, "mg"), q(325, "mg"), ["INT-ESC-SCA-2023"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "clopidogrel", name: "Clopidogrel", drugClass: "Inibidor P2Y12",
    presentations: [{ id: "cp75", label: "Comprimido 75 mg", concentration: q(75, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["SCA (associado ao AAS)"], contraindications: ["Sangramento ativo"], interactions: [],
    onset: "Horas", duration: "Vida da plaqueta",
    doseRules: [r("clopi-adulto", "adulto", "SCA — ataque", "VO", "bolus", q(300, "mg"), q(600, "mg"), ["INT-ESC-SCA-2023"], { notes: "Dose depende da estratégia (fibrinólise × angioplastia) e idade — conferir." }), r("clopi-idoso", "idoso", "SCA — ataque (≥ 75 anos, fibrinólise)", "VO", "bolus", q(75, "mg"), q(600, "mg"), ["INT-ESC-SCA-2023"])],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "enoxaparina", name: "Enoxaparina", drugClass: "Heparina de baixo peso molecular",
    presentations: [{ id: "ser80", label: "Seringa 80 mg/0,8 mL (100 mg/mL)", concentration: q(100, "mg/mL"), form: "seringa", volumeMl: 0.8 }],
    routes: ["SC", "IV"], indications: ["SCA", "Tromboembolismo venoso"], contraindications: ["Sangramento ativo", "Plaquetopenia induzida por heparina"], interactions: [],
    onset: "SC 3–5 h; IV imediato", duration: "12 h",
    renalHepatic: "Ajuste em ClCr < 30 mL/min",
    doseRules: [r("enox-sc", "adulto", "SCA", "SC", "bolus", q(1, "mg/kg"), q(1, "mg/kg"), ["INT-ESC-SCA-2023"]), r("enox-iv", "adulto", "SCA — bolus com fibrinólise", "IV", "bolus", q(30, "mg"), q(30, "mg"), ["INT-ESC-SCA-2023"]), r("enox-tev", "adulto", "TEP/TVP", "SC", "bolus", q(1, "mg/kg"), q(1, "mg/kg"), ["INT-ESC-TEP-2019"], { frequency: "12/12 h (conferir ajuste renal)" })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "tenecteplase", name: "Tenecteplase", drugClass: "Fibrinolítico",
    presentations: [{ id: "fa40", label: "Frasco-ampola 40 mg (5 mg/mL reconstituído)", concentration: q(5, "mg/mL"), form: "frasco_ampola", volumeMl: 8 }, { id: "fa50", label: "Frasco-ampola 50 mg (5 mg/mL reconstituído)", concentration: q(5, "mg/mL"), form: "frasco_ampola", volumeMl: 10 }],
    routes: ["IV"], indications: ["IAM com supra de ST quando a angioplastia primária não pode ser feita no tempo recomendado"], contraindications: ["AVC hemorrágico prévio", "Sangramento ativo", "Dissecção de aorta suspeita"], interactions: [],
    onset: "Minutos", duration: "—",
    doseRules: [r("tnk-adulto", "adulto", "IAMCSST", "IV", "bolus", q(30, "mg"), q(50, "mg"), ["INT-ESC-SCA-2023"], { notes: "Dose por faixa de peso; metade da dose ≥ 75 anos (conferir)." })],
    availability: ["trombolitico"], sourceIds: ["BR-ANVISA", "INT-ESC-SCA-2023"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "alteplase", name: "Alteplase", drugClass: "Fibrinolítico",
    presentations: [{ id: "fa50", label: "Frasco-ampola 50 mg (1 mg/mL reconstituído)", concentration: q(1, "mg/mL"), form: "frasco_ampola", volumeMl: 50 }],
    routes: ["IV"], indications: ["AVC isquêmico agudo em até 4 h 30 min do início, após TC sem hemorragia e sem contraindicações"], contraindications: ["Hemorragia intracraniana", "PA > 185/110 mmHg sem resposta à correção", "Plaquetas < 100.000/µL, RNI > 1,7", "Cirurgia de grande porte < 14 dias"], interactions: ["Anticoagulantes e antiagregantes nas 24 h seguintes"],
    onset: "Minutos", duration: "—",
    doseRules: [r("alt-avc", "adulto", "AVC isquêmico agudo", "IV", "infusao_volume", q(0.9, "mg/kg"), q(0.9, "mg/kg"), ["BR-PCDT-AVC"], { maxSingle: q(90, "mg"), notes: "10% em bolus e o restante em 60 min (PCDT AVCi 2023)." }), r("alt-avc-idoso", "idoso", "AVC isquêmico agudo", "IV", "infusao_volume", q(0.9, "mg/kg"), q(0.9, "mg/kg"), ["BR-PCDT-AVC"], { maxSingle: q(90, "mg") }), r("alt-tep", "adulto", "TEP de alto risco", "IV", "infusao_volume", q(100, "mg"), q(100, "mg"), ["INT-ESC-TEP-2019"], { notes: "100 mg em 2 h (conferir esquemas alternativos)." })],
    availability: ["trombolitico"], sourceIds: ["BR-ANVISA", "BR-PCDT-AVC"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "dobutamina", name: "Dobutamina", drugClass: "Inotrópico (agonista beta-1)",
    presentations: [{ id: "amp250", label: "Ampola 12,5 mg/mL (20 mL) — diluir", concentration: q(12.5, "mg/mL"), form: "ampola", volumeMl: 20 }, { id: "sol1000", label: "Solução preparada 250 mg/250 mL (1000 microgramas/mL)", concentration: q(1000, "mcg/mL"), form: "bolsa", volumeMl: 250 }],
    routes: ["IV"], indications: ["Baixo débito com hipoperfusão (choque cardiogênico), associada a vasopressor se hipotensão"], contraindications: ["Hipovolemia não corrigida", "Obstrução da via de saída do VE"], interactions: ["Betabloqueadores reduzem efeito"],
    onset: "1–2 min", duration: "Curta",
    doseRules: [r("dobu-adulto", "adulto", "Baixo débito", "IV", "infusao", q(2, "mcg/kg/min"), q(20, "mcg/kg/min"), ["INT-ESC-IC-2021"], { notes: "Faixa usual a conferir; titular por perfusão." }), r("dobu-idoso", "idoso", "Baixo débito", "IV", "infusao", q(2, "mcg/kg/min"), q(20, "mcg/kg/min"), ["INT-ESC-IC-2021"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-ESC-IC-2021"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "adenosina", name: "Adenosina", drugClass: "Antiarrítmico (bloqueio nodal transitório)",
    presentations: [{ id: "amp6", label: "Ampola 3 mg/mL (2 mL)", concentration: q(3, "mg/mL"), form: "ampola", volumeMl: 2 }],
    routes: ["IV"], indications: ["Taquicardia regular de QRS estreito (reentrada nodal/AV) estável após manobra vagal"], contraindications: ["Asma grave/broncoespasmo ativo (relativa)", "Pré-excitação com FA"], interactions: ["Dipiridamol potencializa; metilxantinas reduzem"],
    onset: "Segundos", duration: "< 10 s",
    doseRules: [r("ade-adulto", "adulto", "TSV", "IV", "bolus", q(6, "mg"), q(12, "mg"), ["INT-AHA-ALS"], { notes: "Bolus rápido seguido de flush de SF; 6 mg e, se necessário, 12 mg (conferir)." }), r("ade-idoso", "idoso", "TSV", "IV", "bolus", q(6, "mg"), q(12, "mg"), ["INT-AHA-ALS"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AHA-ALS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "metoprolol", name: "Metoprolol (tartarato, IV)", drugClass: "Betabloqueador seletivo",
    presentations: [{ id: "amp5", label: "Ampola 1 mg/mL (5 mL)", concentration: q(1, "mg/mL"), form: "ampola", volumeMl: 5 }],
    routes: ["IV"], indications: ["Controle de frequência/força de ejeção (ex.: síndrome aórtica aguda, FA com resposta rápida sem IC descompensada)"], contraindications: ["Choque, IC descompensada, BAV avançado, broncoespasmo grave"], interactions: ["Bloqueadores de canal de cálcio não di-hidropiridínicos: bradicardia/BAV"],
    onset: "Minutos", duration: "Horas",
    doseRules: [r("meto-adulto", "adulto", "Controle de FC", "IV", "bolus", q(2.5, "mg"), q(5, "mg"), ["INT-ESC-AORTA-2024"], { frequency: "a cada 5 min, até 15 mg (conferir)" }), r("meto-idoso", "idoso", "Controle de FC", "IV", "bolus", q(2.5, "mg"), q(5, "mg"), ["INT-ESC-AORTA-2024"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "nitroprussiato", name: "Nitroprussiato de sódio", drugClass: "Vasodilatador arterial e venoso",
    presentations: [{ id: "sol200", label: "Solução preparada 50 mg/250 mL SG5% (200 microgramas/mL), protegida da luz", concentration: q(200, "mcg/mL"), form: "bolsa", volumeMl: 250 }],
    routes: ["IV"], indications: ["Emergência hipertensiva com necessidade de controle titulável (após betabloqueio na síndrome aórtica)"], contraindications: ["Hipotensão"], interactions: ["Toxicidade por cianeto/tiocianato em doses altas/prolongadas"],
    onset: "Segundos", duration: "Minutos",
    doseRules: [r("nps-adulto", "adulto", "Emergência hipertensiva", "IV", "infusao", q(0.25, "mcg/kg/min"), q(10, "mcg/kg/min"), ["INT-ESC-AORTA-2024"], { notes: "Titular; faixa a conferir." }), r("nps-idoso", "idoso", "Emergência hipertensiva", "IV", "infusao", q(0.25, "mcg/kg/min"), q(10, "mcg/kg/min"), ["INT-ESC-AORTA-2024"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "heparina", name: "Heparina não fracionada", drugClass: "Anticoagulante",
    presentations: [{ id: "fa5000", label: "Frasco-ampola 5.000 UI/mL (5 mL)", concentration: q(5000, "UI/mL"), form: "frasco_ampola", volumeMl: 5 }],
    routes: ["IV", "SC"], indications: ["TEP/TVP (especialmente instável ou candidato a trombólise)", "SCA"], contraindications: ["Sangramento ativo", "Plaquetopenia induzida por heparina"], interactions: ["Antiagregantes e trombolíticos aumentam sangramento"],
    onset: "Imediato (IV)", duration: "Horas",
    doseRules: [r("hnf-bolus", "adulto", "TEP", "IV", "bolus", q(80, "UI/kg"), q(80, "UI/kg"), ["INT-ESC-TEP-2019"], { notes: "Seguido de infusão ajustada por TTPa (conferir nomograma)." }), r("hnf-inf", "adulto", "TEP", "IV", "infusao", q(18, "UI/kg/h"), q(18, "UI/kg/h"), ["INT-ESC-TEP-2019"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "omeprazol", name: "Omeprazol (IV)", drugClass: "Inibidor de bomba de prótons",
    presentations: [{ id: "fa40", label: "Frasco-ampola 40 mg", concentration: q(40, "mg"), form: "frasco_ampola" }],
    routes: ["IV"], indications: ["Hemorragia digestiva alta presumivelmente péptica (antes e após endoscopia)"], contraindications: [], interactions: ["Clopidogrel (interação discutida)"],
    onset: "Horas", duration: "—",
    doseRules: [r("ome-adulto", "adulto", "HDA", "IV", "bolus", q(40, "mg"), q(80, "mg"), ["INT-ACG-HDA-2021"], { notes: "Esquemas variam (bolus + infusão ou intermitente); conferir." }), r("ome-idoso", "idoso", "HDA", "IV", "bolus", q(40, "mg"), q(80, "mg"), ["INT-ACG-HDA-2021"])],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "terlipressina", name: "Terlipressina", drugClass: "Análogo da vasopressina (vasoconstritor esplâncnico)",
    presentations: [{ id: "fa1mg", label: "Frasco-ampola 1 mg", concentration: q(1, "mg"), form: "frasco_ampola" }],
    routes: ["IV"], indications: ["Suspeita de hemorragia varicosa em hepatopata"], contraindications: ["Doença isquêmica coronariana/periférica grave (cautela)"], interactions: [],
    onset: "Minutos", duration: "4–6 h",
    doseRules: [r("terli-adulto", "adulto", "HDA varicosa", "IV", "bolus", q(1, "mg"), q(2, "mg"), ["INT-BAVENO-VII"], { frequency: "a cada 4 h (conferir)" }), r("terli-idoso", "idoso", "HDA varicosa", "IV", "bolus", q(1, "mg"), q(2, "mg"), ["INT-BAVENO-VII"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-BAVENO-VII"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "azitromicina", name: "Azitromicina", drugClass: "Macrolídeo",
    presentations: [{ id: "cp500", label: "Comprimido 500 mg", concentration: q(500, "mg"), form: "comprimido" }, { id: "fa500", label: "Frasco-ampola 500 mg (IV)", concentration: q(500, "mg"), form: "frasco_ampola" }],
    routes: ["VO", "IV"], indications: ["Cobertura de atípicos na pneumonia adquirida na comunidade (associada a betalactâmico quando indicado)"], contraindications: ["QT longo (cautela)"], interactions: ["Prolongamento de QT"],
    onset: "—", duration: "—",
    doseRules: [r("azi-adulto", "adulto", "PAC", "VO", "bolus", q(500, "mg"), q(500, "mg"), ["INT-ATS-PAC-2019"], { frequency: "1x/dia (conferir duração)" }), r("azi-adulto-iv", "adulto", "PAC", "IV", "bolus", q(500, "mg"), q(500, "mg"), ["INT-ATS-PAC-2019"]), r("azi-idoso", "idoso", "PAC", "VO", "bolus", q(500, "mg"), q(500, "mg"), ["INT-ATS-PAC-2019"]), r("azi-idoso-iv", "idoso", "PAC", "IV", "bolus", q(500, "mg"), q(500, "mg"), ["INT-ATS-PAC-2019"])],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "smx_tmp", name: "Sulfametoxazol + trimetoprima", drugClass: "Sulfonamida + inibidor da di-hidrofolato redutase",
    presentations: [{ id: "amp400", label: "Ampola 400 mg + 80 mg (5 mL) — dose expressa pelo componente trimetoprima: 80 mg", concentration: q(16, "mg/mL"), form: "ampola", volumeMl: 5 }, { id: "cp800", label: "Comprimido 800 mg + 160 mg (dose pela trimetoprima: 160 mg)", concentration: q(160, "mg"), form: "comprimido" }],
    routes: ["IV", "VO"], indications: ["Pneumocistose (dose pelo componente trimetoprima)"], contraindications: ["Alergia a sulfa", "Deficiência de G6PD (cautela)"], interactions: ["Hipercalemia, mielotoxicidade"],
    onset: "—", duration: "—",
    doseRules: [r("smx-pcp", "adulto", "Pneumocistose", "IV", "bolus", q(3.75, "mg/kg"), q(5, "mg/kg"), ["BR-PCDT-HIV"], { frequency: "6/6 h ou 8/8 h (TMP 15–20 mg/kg/dia; conferir)", notes: "Dose expressa pelo componente trimetoprima." }), r("smx-pcp-vo", "adulto", "Pneumocistose", "VO", "bolus", q(3.75, "mg/kg"), q(5, "mg/kg"), ["BR-PCDT-HIV"])],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-PCDT-HIV"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "nimodipino", name: "Nimodipino", drugClass: "Bloqueador de canal de cálcio (di-hidropiridínico)",
    presentations: [{ id: "cp30", label: "Comprimido 30 mg", concentration: q(30, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hemorragia subaracnóidea aneurismática (prevenção de isquemia tardia)"], contraindications: ["Hipotensão"], interactions: ["Hipotensão com outros anti-hipertensivos"],
    onset: "—", duration: "4 h",
    doseRules: [r("nimo-hsa", "adulto", "HSA", "VO", "bolus", q(60, "mg"), q(60, "mg"), ["INT-AHA-HSA-2023"], { frequency: "4/4 h por 21 dias (conferir)" })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-AHA-HSA-2023"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "dexametasona", name: "Dexametasona", drugClass: "Corticosteroide",
    presentations: [{ id: "amp10", label: "Ampola 4 mg/mL (2,5 mL = 10 mg)", concentration: q(4, "mg/mL"), form: "ampola", volumeMl: 2.5 }],
    routes: ["IV", "IM"], indications: ["Meningite bacteriana suspeita (antes ou junto da 1ª dose do antibiótico)", "Edema vasogênico", "Crupe"], contraindications: [], interactions: [],
    onset: "Horas", duration: "36–54 h",
    doseRules: [r("dexa-meningite", "adulto", "Meningite bacteriana", "IV", "bolus", q(10, "mg"), q(10, "mg"), ["INT-ESCMID-MENINGITE-2016"], { frequency: "6/6 h por 4 dias (conferir)" }), r("dexa-crupe", "pediatrico", "Crupe", "VO", "bolus", q(0.15, "mg/kg"), q(0.6, "mg/kg"), ["INT-AHA-ALS"], { notes: "Faixa a conferir em diretriz pediátrica." })],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "imunoglobulina", name: "Imunoglobulina humana IV", drugClass: "Imunomodulador",
    presentations: [{ id: "fa5g", label: "Frasco 5 g (50 mg/mL, 100 mL)", concentration: q(50, "mg/mL"), form: "frasco", volumeMl: 100 }],
    routes: ["IV"], indications: ["Síndrome de Guillain-Barré com incapacidade (até 2–4 semanas do início)"], contraindications: ["Deficiência de IgA com anticorpos (anafilaxia)"], interactions: ["Trombose, lesão renal"],
    onset: "Dias", duration: "—",
    doseRules: [r("igiv-sgb", "adulto", "Guillain-Barré", "IV", "infusao_volume", q(0.4, "g/kg"), q(0.4, "g/kg"), ["BR-PCDT-SGB"], { frequency: "1x/dia por 5 dias (conferir)" })],
    availability: ["hemocomponentes"], sourceIds: ["BR-ANVISA", "BR-PCDT-SGB"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "nitroglicerina", name: "Nitroglicerina", drugClass: "Nitrato / vasodilatador",
    presentations: [{ id: "amp25", label: "Ampola 5 mg/mL (5 mL) — diluir", concentration: q(5, "mg/mL"), form: "ampola", volumeMl: 5 }, { id: "sol200", label: "Solução preparada 50 mg/250 mL (200 microgramas/mL)", concentration: q(200, "mcg/mL"), form: "bolsa", volumeMl: 250 }],
    routes: ["IV"], indications: ["Edema agudo de pulmão hipertensivo", "Dor isquêmica persistente"], contraindications: ["PAS < 90 mmHg", "Inibidor de fosfodiesterase recente", "Infarto de VD"], interactions: [],
    onset: "1–2 min", duration: "Enquanto infundida",
    doseRules: [r("ntg-adulto", "adulto", "EAP/isquemia", "IV", "infusao", q(5, "mcg/min"), q(200, "mcg/min"), ["INT-ESC-SCA-2023"], { notes: "Titular conforme PA e sintomas; faixa a conferir." }), r("ntg-idoso", "idoso", "EAP/isquemia", "IV", "infusao", q(5, "mcg/min"), q(200, "mcg/min"), ["INT-ESC-SCA-2023"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "furosemida", name: "Furosemida", drugClass: "Diurético de alça",
    presentations: [{ id: "amp20", label: "Ampola 10 mg/mL (2 mL)", concentration: q(10, "mg/mL"), form: "ampola", volumeMl: 2 }],
    routes: ["IV"], indications: ["Congestão pulmonar", "Hipercalemia com função renal preservada (adjuvante)"], contraindications: ["Hipovolemia"], interactions: ["Hipocalemia"],
    onset: "5 min", duration: "2 h",
    doseRules: [r("furo-adulto", "adulto", "Congestão", "IV", "bolus", q(20, "mg"), q(120, "mg"), ["BR-SAMU-SAV"]), r("furo-idoso", "idoso", "Congestão", "IV", "bolus", q(20, "mg"), q(120, "mg"), ["BR-SAMU-SAV"])],
    availability: ["medicacoes_urgencia", "medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "ocitocina", name: "Ocitocina", drugClass: "Uterotônico",
    presentations: [{ id: "amp5", label: "Ampola 5 UI/mL (1 mL)", concentration: q(5, "UI/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IM", "IV"], indications: ["Prevenção e tratamento da hemorragia pós-parto"], contraindications: [], interactions: [],
    onset: "IV imediato; IM 3–5 min", duration: "Curta (IV)",
    doseRules: [r("oci-im", "gestante", "HPP", "IM", "bolus", q(10, "UI"), q(10, "UI"), ["BR-GESTACAO"]), r("oci-iv", "gestante", "HPP", "IV", "bolus", q(5, "UI"), q(10, "UI"), ["BR-GESTACAO"], { notes: "IV lento; esquema a conferir." }), r("oci-inf", "gestante", "HPP — manutenção", "IV", "infusao", q(2, "UI/h"), q(10, "UI/h"), ["BR-GESTACAO"], { notes: "Faixa de manutenção a conferir no protocolo de HPP." })],
    availability: ["obstetricia", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "acido_tranexamico", name: "Ácido tranexâmico", drugClass: "Antifibrinolítico",
    presentations: [{ id: "amp250", label: "Ampola 50 mg/mL (5 mL)", concentration: q(50, "mg/mL"), form: "ampola", volumeMl: 5 }],
    routes: ["IV"], indications: ["Hemorragia pós-parto (até 3 h)", "Trauma com sangramento significativo (até 3 h)"], contraindications: ["Tromboembolismo ativo"], interactions: [],
    onset: "Minutos", duration: "Horas",
    doseRules: [r("atx-gest", "gestante", "HPP", "IV", "bolus", q(1000, "mg"), q(1000, "mg"), ["BR-GESTACAO"], { notes: "Em 10 min; pode repetir uma vez — conferir." }), r("atx-adulto", "adulto", "Trauma", "IV", "bolus", q(1000, "mg"), q(1000, "mg"), ["BR-SAMU-SAV", "INT-CRASH2"], { notes: "Em 10 min, até 3 h do trauma; seguida de 1 g em 8 h (conferir)." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "misoprostol", name: "Misoprostol", drugClass: "Análogo de prostaglandina",
    presentations: [{ id: "cp200", label: "Comprimido 200 microgramas (uso hospitalar)", concentration: q(200, "mcg"), form: "comprimido" }],
    routes: ["retal", "SL"], indications: ["HPP por atonia (2ª linha)"], contraindications: [], interactions: [],
    onset: "15–30 min", duration: "2–3 h",
    doseRules: [r("miso-hpp", "gestante", "HPP", "retal", "bolus", q(800, "mcg"), q(800, "mcg"), ["BR-GESTACAO"]), r("miso-hpp-sl", "gestante", "HPP", "SL", "bolus", q(800, "mcg"), q(800, "mcg"), ["BR-GESTACAO"])],
    availability: ["obstetricia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "metilergometrina", name: "Metilergometrina", drugClass: "Derivado do ergot / uterotônico",
    presentations: [{ id: "amp02", label: "Ampola 0,2 mg/mL (1 mL)", concentration: q(0.2, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IM"], indications: ["HPP por atonia"], contraindications: ["Hipertensão/pré-eclâmpsia", "Cardiopatia"], interactions: [],
    onset: "2–5 min", duration: "3 h",
    doseRules: [r("mte-hpp", "gestante", "HPP", "IM", "bolus", q(0.2, "mg"), q(0.2, "mg"), ["BR-GESTACAO"])],
    availability: ["obstetricia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "hidralazina", name: "Hidralazina", drugClass: "Vasodilatador arterial",
    presentations: [{ id: "amp20", label: "Ampola 20 mg/mL (1 mL) — diluir", concentration: q(20, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IV"], indications: ["Crise hipertensiva na gestação"], contraindications: [], interactions: [],
    onset: "10–20 min", duration: "2–4 h",
    doseRules: [r("hidra-gest", "gestante", "PA ≥ 160/110 na gestação", "IV", "bolus", q(5, "mg"), q(10, "mg"), ["BR-GESTACAO"], { frequency: "a cada 20 min, conforme PA (conferir dose máxima)" })],
    availability: ["obstetricia", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "nifedipino", name: "Nifedipino", drugClass: "Bloqueador de canal de cálcio",
    presentations: [{ id: "cp10", label: "Comprimido 10 mg (liberação imediata)", concentration: q(10, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Crise hipertensiva na gestação (alternativa VO)"], contraindications: ["Uso sublingual"], interactions: ["Hipotensão com sulfato de magnésio (cautela)"],
    onset: "20–30 min", duration: "4–6 h",
    doseRules: [r("nife-gest", "gestante", "PA ≥ 160/110 na gestação", "VO", "bolus", q(10, "mg"), q(20, "mg"), ["BR-GESTACAO"])],
    availability: ["medicacoes_basicas", "obstetricia"], sourceIds: ["BR-ANVISA", "BR-GESTACAO"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "dipirona", name: "Dipirona (metamizol)", drugClass: "Analgésico/antitérmico",
    presentations: [{ id: "amp1g", label: "Ampola 500 mg/mL (2 mL)", concentration: q(500, "mg/mL"), form: "ampola", volumeMl: 2 }, { id: "cp500", label: "Comprimido 500 mg", concentration: q(500, "mg"), form: "comprimido" }],
    routes: ["IV", "VO", "IM"], indications: ["Dor e febre"], contraindications: ["Alergia a pirazolonas", "Discrasias sanguíneas"], interactions: [],
    onset: "30 min", duration: "4–6 h",
    doseRules: [r("dip-iv", "adulto", "Dor/febre", "IV", "bolus", q(500, "mg"), q(1000, "mg"), ["BR-ANVISA"]), r("dip-vo", "adulto", "Dor/febre", "VO", "bolus", q(500, "mg"), q(1000, "mg"), ["BR-ANVISA"]), r("dip-ped", "pediatrico", "Dor/febre", "IV", "bolus", q(10, "mg/kg"), q(25, "mg/kg"), ["BR-ANVISA"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "paracetamol", name: "Paracetamol", drugClass: "Analgésico/antitérmico",
    presentations: [{ id: "cp500", label: "Comprimido 500 mg", concentration: q(500, "mg"), form: "comprimido" }, { id: "gotas200", label: "Solução oral 200 mg/mL", concentration: q(200, "mg/mL"), form: "frasco" }],
    routes: ["VO"], indications: ["Dor e febre"], contraindications: ["Hepatopatia grave"], interactions: [],
    onset: "30–60 min", duration: "4–6 h",
    doseRules: [r("pcm-adulto", "adulto", "Dor/febre", "VO", "bolus", q(500, "mg"), q(1000, "mg"), ["BR-ANVISA"]), r("pcm-ped", "pediatrico", "Dor/febre", "VO", "bolus", q(10, "mg/kg"), q(15, "mg/kg"), ["BR-ANVISA"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "ondansetrona", name: "Ondansetrona", drugClass: "Antiemético (antagonista 5-HT3)",
    presentations: [{ id: "amp4", label: "Ampola 2 mg/mL (2 mL)", concentration: q(2, "mg/mL"), form: "ampola", volumeMl: 2 }],
    routes: ["IV"], indications: ["Náuseas e vômitos"], contraindications: ["QT longo"], interactions: [],
    onset: "Minutos", duration: "6–8 h",
    doseRules: [r("ond-adulto", "adulto", "Vômitos", "IV", "bolus", q(4, "mg"), q(8, "mg"), ["BR-ANVISA"]), r("ond-ped", "pediatrico", "Vômitos", "IV", "bolus", q(0.1, "mg/kg"), q(0.15, "mg/kg"), ["BR-ANVISA"], { maxSingle: q(4, "mg") })],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "morfina", name: "Morfina", drugClass: "Analgésico opioide",
    presentations: [{ id: "amp10", label: "Ampola 10 mg/mL (1 mL)", concentration: q(10, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IV", "SC"], indications: ["Dor intensa"], contraindications: ["Depressão respiratória", "Hipotensão"], interactions: ["Depressores do SNC"],
    onset: "5–10 min IV", duration: "3–4 h",
    doseRules: [r("mor-adulto", "adulto", "Dor intensa", "IV", "bolus", q(1, "mg"), q(4, "mg"), ["BR-SAMU-SAV"], { notes: "Titulação em alíquotas com reavaliação." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "cetamina", name: "Cetamina (escetamina/cetamina racêmica — conferir apresentação)", drugClass: "Agente de indução dissociativo",
    presentations: [{ id: "fa50", label: "Frasco 50 mg/mL (10 mL)", concentration: q(50, "mg/mL"), form: "frasco" }],
    routes: ["IV"], indications: ["Indução em sequência rápida"], contraindications: [], interactions: [],
    onset: "30–60 s", duration: "10–15 min",
    doseRules: [r("ket-isr", "adulto", "Indução", "IV", "bolus", q(1, "mg/kg"), q(2, "mg/kg"), ["BR-SAMU-SAV"])],
    availability: ["intubacao"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "rocuronio", name: "Rocurônio", drugClass: "Bloqueador neuromuscular não despolarizante",
    presentations: [{ id: "fa50", label: "Frasco 10 mg/mL (5 mL)", concentration: q(10, "mg/mL"), form: "frasco" }],
    routes: ["IV"], indications: ["Intubação em sequência rápida"], contraindications: ["Via aérea difícil sem plano de resgate"], interactions: ["Magnésio potencializa"],
    onset: "60 s", duration: "30–60 min",
    doseRules: [r("roc-isr", "adulto", "Sequência rápida", "IV", "bolus", q(1, "mg/kg"), q(1.2, "mg/kg"), ["BR-SAMU-SAV"])],
    availability: ["intubacao"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "atropina", name: "Atropina", drugClass: "Anticolinérgico",
    presentations: [{ id: "amp05", label: "Ampola 0,5 mg/mL (1 mL) — conferir concentração disponível", concentration: q(0.5, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IV"], indications: ["Bradicardia sintomática", "Intoxicação por organofosforado (doses tituladas)"], contraindications: [], interactions: [],
    onset: "1 min", duration: "30–60 min",
    doseRules: [r("atr-bradi", "adulto", "Bradicardia", "IV", "bolus", q(0.5, "mg"), q(1, "mg"), ["INT-AHA-ALS"], { maxCumulative: q(3, "mg"), notes: "Conferir dose na diretriz vigente." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "acetilcisteina", name: "Acetilcisteína (IV)", drugClass: "Antídoto do paracetamol",
    presentations: [{ id: "amp300", label: "Ampola 100 mg/mL (3 mL) — conferir apresentação IV disponível", concentration: q(100, "mg/mL"), form: "ampola", volumeMl: 3 }],
    routes: ["IV", "VO"], indications: ["Intoxicação por paracetamol conforme nomograma/tempo"], contraindications: [], interactions: ["Reações anafilactoides relacionadas à infusão"],
    onset: "—", duration: "—",
    doseRules: [r("nac-1bolsa", "adulto", "Paracetamol — primeira etapa", "IV", "infusao_volume", q(150, "mg/kg"), q(150, "mg/kg"), ["BR-CIATOX"], { notes: "Regime em etapas; conferir protocolo do CIATox (há esquemas de 2 e 3 bolsas)." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "BR-CIATOX"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "carvao_ativado", name: "Carvão ativado", drugClass: "Adsorvente",
    presentations: [{ id: "po50", label: "Pó para suspensão oral (dose por massa)", concentration: q(1000, "mg"), form: "frasco" }],
    routes: ["VO"], indications: ["Ingestão recente de tóxico adsorvível com via aérea protegida"], contraindications: ["Rebaixamento sem via aérea protegida", "Cáusticos, hidrocarbonetos"], interactions: ["Adsorve acetilcisteína oral"],
    onset: "—", duration: "—",
    doseRules: [r("carvao-adulto", "adulto", "Descontaminação", "VO", "bolus", q(25, "g"), q(50, "g"), ["BR-CIATOX"], { notes: "Benefício maior até 1–2 h da ingestão (conferir)." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-CIATOX"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "losartana", name: "Losartana potássica", drugClass: "Bloqueador do receptor de angiotensina",
    presentations: [{ id: "cp50", label: "Comprimido 50 mg", concentration: q(50, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hipertensão arterial"], contraindications: ["Gestação", "Hipercalemia"], interactions: ["IECA (não associar)"],
    onset: "Horas", duration: "24 h",
    doseRules: [r("los-has", "adulto", "HAS", "VO", "bolus", q(25, "mg"), q(100, "mg"), ["BR-SBC-HAS"], { frequency: "1–2 vezes ao dia" }), r("los-has-idoso", "idoso", "HAS", "VO", "bolus", q(25, "mg"), q(100, "mg"), ["BR-SBC-HAS"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-RENAME", "BR-SBC-HAS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "hidroclorotiazida", name: "Hidroclorotiazida", drugClass: "Diurético tiazídico",
    presentations: [{ id: "cp25", label: "Comprimido 25 mg", concentration: q(25, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hipertensão arterial"], contraindications: ["Gota (relativa)", "Hiponatremia"], interactions: [],
    onset: "Horas", duration: "24 h",
    doseRules: [r("hctz-has", "adulto", "HAS", "VO", "bolus", q(12.5, "mg"), q(25, "mg"), ["BR-SBC-HAS"]), r("hctz-idoso", "idoso", "HAS", "VO", "bolus", q(12.5, "mg"), q(25, "mg"), ["BR-SBC-HAS"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-RENAME", "BR-SBC-HAS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "anlodipino", name: "Besilato de anlodipino", drugClass: "Bloqueador de canal de cálcio",
    presentations: [{ id: "cp5", label: "Comprimido 5 mg", concentration: q(5, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hipertensão arterial"], contraindications: [], interactions: [],
    onset: "Horas", duration: "24 h",
    doseRules: [r("anlo-has", "adulto", "HAS", "VO", "bolus", q(2.5, "mg"), q(10, "mg"), ["BR-SBC-HAS"]), r("anlo-idoso", "idoso", "HAS", "VO", "bolus", q(2.5, "mg"), q(10, "mg"), ["BR-SBC-HAS"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-RENAME", "BR-SBC-HAS"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "tiamina", name: "Tiamina (vitamina B1)", drugClass: "Vitamina",
    presentations: [{ id: "amp100", label: "Ampola 100 mg/mL — conferir apresentação", concentration: q(100, "mg/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["IV", "IM"], indications: ["Risco de encefalopatia de Wernicke (etilismo, desnutrição)"], contraindications: [], interactions: [],
    onset: "—", duration: "—",
    doseRules: [r("tia-adulto", "adulto", "Prevenção/tratamento de Wernicke", "IV", "bolus", q(100, "mg"), q(500, "mg"), ["BR-SAMU-SAV"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "vacina_antirrabica", name: "Vacina antirrábica humana (cultivo celular)", drugClass: "Imunobiológico (vacina inativada)",
    presentations: [{ id: "fr05", label: "Frasco-ampola 0,5 mL (dose IM conforme fabricante)", concentration: q(1, "mg/mL"), form: "frasco_ampola", volumeMl: 0.5 }],
    routes: ["IM"], indications: ["Profilaxia pós-exposição da raiva (esquema D0, D3, D7, D14)"], contraindications: ["Não há contraindicação na pós-exposição"], interactions: [],
    onset: "Anticorpos em ~7–14 dias", duration: "—",
    doseRules: [r("vac-raiva-im", "todos", "Pós-exposição", "IM", "bolus", q(0.5, "mL"), q(1, "mL"), ["BR-RAIVA-TETANO-RJ"], { notes: "Volume total do frasco conforme laboratório; não aplicar no glúteo; via intradérmica (0,2 mL em 2 sítios) não modelada." })],
    availability: ["sala_vacina", "imunobiologicos_especiais"], sourceIds: ["BR-RAIVA-TETANO-RJ"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "soro_antirrabico", name: "Soro antirrábico humano (heterólogo, SARH)", drugClass: "Imunobiológico (imunização passiva)",
    presentations: [{ id: "amp1000", label: "Ampola 200 UI/mL (5 mL) — conferir apresentação", concentration: q(200, "UI/mL"), form: "ampola", volumeMl: 5 }],
    routes: ["IM"], indications: ["Lesão grave por animal não observável ou com suspeita de raiva (D0, junto à 1ª dose da vacina)"], contraindications: [], interactions: ["Reações de hipersensibilidade: aplicar em serviço preparado para anafilaxia"],
    onset: "Imediato (anticorpos passivos)", duration: "—",
    doseRules: [r("sarh", "todos", "Pós-exposição — lesão grave", "IM", "bolus", q(40, "UI/kg"), q(40, "UI/kg"), ["BR-RAIVA-TETANO-RJ"], { notes: "Infiltrar o máximo possível dentro e ao redor da lesão; restante IM. Contraindicado após o 7º dia da 1ª dose da vacina." })],
    availability: ["imunobiologicos_especiais"], sourceIds: ["BR-RAIVA-TETANO-RJ"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "imunoglobulina_antirrabica", name: "Imunoglobulina antirrábica humana (IGHAR)", drugClass: "Imunobiológico (imunização passiva)",
    presentations: [{ id: "fr150", label: "Frasco 150 UI/mL — conferir apresentação", concentration: q(150, "UI/mL"), form: "frasco_ampola", volumeMl: 2 }],
    routes: ["IM"], indications: ["Alternativa ao SARH na lesão grave"], contraindications: [], interactions: [],
    onset: "Imediato", duration: "—",
    doseRules: [r("ighar", "todos", "Pós-exposição — lesão grave", "IM", "bolus", q(20, "UI/kg"), q(20, "UI/kg"), ["BR-RAIVA-TETANO-RJ"], { notes: "Infiltração na lesão; mesmas regras de prazo do soro." })],
    availability: ["imunobiologicos_especiais"], sourceIds: ["BR-RAIVA-TETANO-RJ"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "vacina_dt", name: "Vacina dupla adulto (dT — difteria e tétano)", drugClass: "Imunobiológico (toxoides)",
    presentations: [{ id: "fr05", label: "Dose 0,5 mL", concentration: q(1, "mg/mL"), form: "frasco_ampola", volumeMl: 0.5 }],
    routes: ["IM"], indications: ["Reforço/esquema antitetânico conforme história vacinal e risco do ferimento"], contraindications: ["Reação anafilática prévia a componente"], interactions: [],
    onset: "—", duration: "—",
    doseRules: [r("dt", "todos", "Profilaxia do tétano", "IM", "bolus", q(0.5, "mL"), q(0.5, "mL"), ["BR-RAIVA-TETANO-RJ"])],
    availability: ["sala_vacina", "imunobiologicos_especiais"], sourceIds: ["BR-RAIVA-TETANO-RJ"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "manitol", name: "Manitol 20%", drugClass: "Diurético osmótico (terapia hiperosmolar)",
    presentations: [{ id: "fr250", label: "Frasco 20% 250 mL (200 mg/mL)", concentration: q(200, "mg/mL"), form: "frasco", volumeMl: 250 }],
    routes: ["IV"], indications: ["Hipertensão intracraniana com sinais de herniação (ponte até o tratamento definitivo)"], contraindications: ["Hipovolemia/hipotensão (cautela)", "Anúria"], interactions: ["Diurese osmótica: repor volume e monitorar sódio"],
    onset: "Minutos", duration: "Horas",
    doseRules: [],
    availability: ["medicacoes_urgencia"], sourceIds: ["INT-ENLS-TCE-6", "BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "propranolol", name: "Propranolol", drugClass: "Betabloqueador não seletivo",
    presentations: [{ id: "cp40", label: "Comprimido 40 mg", concentration: q(40, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Controle adrenérgico na tireotoxicose"], contraindications: ["Asma/broncoespasmo", "Choque cardiogênico", "BAV avançado"], interactions: ["Bloqueadores de canal de cálcio não di-hidropiridínicos (bradicardia)"],
    onset: "1–2 h (VO)", duration: "6–12 h",
    doseRules: [r("prop-tireo", "adulto", "Tireotoxicose", "VO", "bolus", q(20, "mg"), q(80, "mg"), ["BR-SBEM-HIPER-2013"], { frequency: "a cada 6–12 h (faixa geral da tireotoxicose; na crise, conferir)" })],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-SBEM-HIPER-2013", "BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "propiltiouracil", name: "Propiltiouracil (PTU)", drugClass: "Tionamida (antitireoidiano)",
    presentations: [{ id: "cp100", label: "Comprimido 100 mg", concentration: q(100, "mg"), form: "comprimido" }],
    routes: ["VO", "SNG"], indications: ["Crise tireotóxica (primeira escolha: também reduz conversão de T4 em T3)"], contraindications: ["Hepatotoxicidade prévia"], interactions: [],
    onset: "1–2 h", duration: "—",
    doseRules: [],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-SBEM-HIPER-2013"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "metimazol", name: "Metimazol (tiamazol)", drugClass: "Tionamida (antitireoidiano)",
    presentations: [{ id: "cp10", label: "Comprimido 10 mg", concentration: q(10, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hipertireoidismo; alternativa ao PTU na crise"], contraindications: ["Agranulocitose prévia por tionamida"], interactions: [],
    onset: "1–2 h", duration: "—",
    doseRules: [],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-SBEM-HIPER-2013"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "lugol", name: "Solução de Lugol (iodo + iodeto de potássio)", drugClass: "Iodo inorgânico",
    presentations: [{ id: "gotas5", label: "Solução oral 5% (gotas)", concentration: q(50, "mg/mL"), form: "frasco" }],
    routes: ["VO"], indications: ["Crise tireotóxica — bloqueio da liberação hormonal, sempre após a tionamida"], contraindications: ["Antes da tionamida (pode aumentar a síntese)"], interactions: [],
    onset: "Horas", duration: "—",
    doseRules: [],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-SBEM-HIPER-2013"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "levotiroxina", name: "Levotiroxina", drugClass: "Hormônio tireoidiano",
    presentations: [{ id: "cp100", label: "Comprimido 100 microgramas", concentration: q(0.1, "mg"), form: "comprimido" }],
    routes: ["VO", "SNG"], indications: ["Hipotireoidismo; coma mixedematoso (por sonda quando a forma IV não está disponível)"], contraindications: ["Insuficiência adrenal não tratada (dar corticoide antes)"], interactions: [],
    onset: "Dias (VO)", duration: "Longa",
    doseRules: [],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "zoledronato", name: "Ácido zoledrônico", drugClass: "Bisfosfonato",
    presentations: [{ id: "fr4mg", label: "Frasco 4 mg/100 mL", concentration: q(0.04, "mg/mL"), form: "frasco", volumeMl: 100 }],
    routes: ["IV"], indications: ["Hipercalcemia grave (efeito em 2–4 dias)"], contraindications: ["Hipocalcemia", "Insuficiência renal grave (ajustar/evitar)"], interactions: [],
    onset: "48–72 h", duration: "Semanas",
    doseRules: [r("zol-hcm", "adulto", "Hipercalcemia da malignidade", "IV", "infusao_volume", q(3, "mg"), q(4, "mg"), ["INT-ES-HCM-2023"], { notes: "Infundir em 15–30 min (60 min se TFG < 60); ajustar dose se TFG < 60 mL/min." }), r("zol-hcm-idoso", "idoso", "Hipercalcemia da malignidade", "IV", "infusao_volume", q(3, "mg"), q(4, "mg"), ["INT-ES-HCM-2023"], { notes: "Ajustar à função renal." })],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-ES-HCM-2023"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "calcitonina", name: "Calcitonina", drugClass: "Hormônio hipocalcemiante",
    presentations: [{ id: "amp100", label: "Ampola 100 UI/mL", concentration: q(100, "UI/mL"), form: "ampola", volumeMl: 1 }],
    routes: ["SC", "IM"], indications: ["Hipercalcemia grave — ponte de ação rápida (taquifilaxia em 48 h)"], contraindications: ["Alergia"], interactions: [],
    onset: "4–6 h", duration: "6–8 h",
    doseRules: [],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "insulina_nph", name: "Insulina humana NPH", drugClass: "Insulina de ação intermediária (basal)",
    presentations: [{ id: "fr100", label: "Frasco/caneta 100 UI/mL", concentration: q(100, "UI/mL"), form: "frasco", volumeMl: 10 }],
    routes: ["SC"], indications: ["DM2 com sintomas de deficiência de insulina ou falha de antidiabéticos orais", "DM1 (esquema basal-bolus)"], contraindications: ["Hipoglicemia"], interactions: ["Betabloqueadores podem mascarar hipoglicemia"],
    onset: "1–2 h", duration: "12–18 h",
    doseRules: [r("nph-inicio", "adulto", "DM2 — início de insulina basal (ao deitar)", "SC", "bolus", q(0.1, "UI/kg"), q(0.2, "UI/kg"), ["BR-SBD-SUS-2026"], { notes: "Cerca de 10 UI ou 0,2 UI/kg ao deitar; ajustar 2–4 UI pela glicemia de jejum." }), r("nph-inicio-idoso", "idoso", "DM2 — início de insulina basal (ao deitar)", "SC", "bolus", q(0.1, "UI/kg"), q(0.2, "UI/kg"), ["BR-SBD-SUS-2026"])],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-SBD-SUS-2026", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "metformina", name: "Metformina", drugClass: "Biguanida",
    presentations: [{ id: "cp500", label: "Comprimido 500 mg", concentration: q(500, "mg"), form: "comprimido" }, { id: "cp850", label: "Comprimido 850 mg", concentration: q(850, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["DM2 — primeira linha"], contraindications: ["TFG < 30 mL/min/1,73 m²", "Acidose, choque, hipóxia"], interactions: ["Contraste iodado (suspender conforme função renal)"],
    onset: "Dias", duration: "—",
    doseRules: [r("met-inicio", "adulto", "DM2 — dose inicial", "VO", "bolus", q(500, "mg"), q(850, "mg"), ["BR-SBD-SUS-2026"], { frequency: "1–2 vezes ao dia, com refeição; titular gradualmente (conferir)", notes: "Máximo 1000 mg/dia se TFG < 45; suspender se < 30." })],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-SBD-SUS-2026", "BR-RENAME"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "salina_hipertonica", name: "Cloreto de sódio 3% (salina hipertônica)", drugClass: "Solução hipertônica",
    presentations: [{ id: "bolsa150", label: "Solução 3% preparada — 150 mL (513 mmol/L de Na⁺)", concentration: q(30, "mg/mL"), form: "bolsa", volumeMl: 150 }],
    routes: ["IV"], indications: ["Hiponatremia com sintomas graves ou moderadamente graves"], contraindications: ["Hiponatremia crônica assintomática"], interactions: [],
    onset: "Minutos", duration: "—",
    doseRules: [r("nacl3-adulto", "adulto", "Hiponatremia sintomática", "IV", "infusao_volume", q(150, "mL"), q(150, "mL"), ["INT-SFE-HIPONA"], { notes: "Bolus de 150 mL em 20 min; meta +5 mmol/L na 1ª hora; repetir conforme sódio e sintomas; máximo +10 mmol/L em 24 h." }), r("nacl3-idoso", "idoso", "Hiponatremia sintomática", "IV", "infusao_volume", q(150, "mL"), q(150, "mL"), ["INT-SFE-HIPONA"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["INT-SFE-HIPONA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "tansulosina", name: "Tansulosina", drugClass: "Alfa-1 bloqueador uroseletivo",
    presentations: [{ id: "cp04", label: "Cápsula 0,4 mg", concentration: q(0.4, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Hiperplasia prostática benigna; antes da retirada da sonda após retenção urinária aguda"], contraindications: ["Hipotensão ortostática importante"], interactions: ["Outros alfabloqueadores e anti-hipertensivos (hipotensão)"],
    onset: "Horas", duration: "24 h",
    doseRules: [],
    availability: ["medicacoes_basicas"], sourceIds: ["INT-EAU-RU-2019", "BR-ANVISA"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "cefepima", name: "Cefepima", drugClass: "Cefalosporina de 4ª geração (antipseudomonas)",
    presentations: [{ id: "fa2g", label: "Frasco-ampola 2 g (reconstituir)", concentration: q(200, "mg/mL"), form: "frasco_ampola", volumeMl: 10 }],
    routes: ["IV"], indications: ["Neutropenia febril (monoterapia empírica em alto risco)", "Infecções graves com risco de Pseudomonas"], contraindications: ["Alergia grave a betalactâmicos"], interactions: ["Neurotoxicidade em insuficiência renal sem ajuste"],
    onset: "—", duration: "8–12 h",
    renalHepatic: "Ajuste renal necessário",
    doseRules: [r("cefep-nf", "adulto", "Neutropenia febril", "IV", "bolus", q(2000, "mg"), q(2000, "mg"), ["INT-IDSA-NF-2010"], { frequency: "8/8 h (conferir)", notes: "Dose usual a conferir na bula/protocolo; a diretriz conferida cita o fármaco, não a dose." }), r("cefep-nf-idoso", "idoso", "Neutropenia febril", "IV", "bolus", q(2000, "mg"), q(2000, "mg"), ["INT-IDSA-NF-2010"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-IDSA-NF-2010"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "vancomicina", name: "Vancomicina", drugClass: "Glicopeptídeo",
    presentations: [{ id: "fa500", label: "Frasco-ampola 500 mg (diluir; infusão lenta)", concentration: q(50, "mg/mL"), form: "frasco_ampola", volumeMl: 10 }, { id: "fa1g", label: "Frasco-ampola 1 g (diluir; infusão lenta)", concentration: q(50, "mg/mL"), form: "frasco_ampola", volumeMl: 20 }],
    routes: ["IV"], indications: ["Cobertura de MRSA em infecção grave de pele/partes moles e outras infecções graves"], contraindications: [], interactions: ["Nefrotoxicidade aditiva (aminoglicosídeos, piperacilina-tazobactam)", "Reação infusional se infundida rápido"],
    onset: "—", duration: "8–12 h (função renal)",
    renalHepatic: "Ajuste renal e monitorização de nível sérico",
    doseRules: [r("vanco-adulto", "adulto", "Infecção grave de partes moles (MRSA)", "IV", "bolus", q(15, "mg/kg"), q(20, "mg/kg"), ["INT-IDSA-SSTI-2014"], { notes: "30 mg/kg/dia em 2 doses (IDSA, Tabela 2); dose de ataque e intervalo conforme protocolo e função renal." }), r("vanco-idoso", "idoso", "Infecção grave de partes moles (MRSA)", "IV", "bolus", q(15, "mg/kg"), q(20, "mg/kg"), ["INT-IDSA-SSTI-2014"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-IDSA-SSTI-2014"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "clindamicina", name: "Clindamicina", drugClass: "Lincosamida",
    presentations: [{ id: "amp600", label: "Ampola 150 mg/mL (4 mL = 600 mg)", concentration: q(150, "mg/mL"), form: "ampola", volumeMl: 4 }],
    routes: ["IV", "VO"], indications: ["Infecção estreptocócica grave de partes moles (efeito antitoxina, associada)", "Infecções por anaeróbios"], contraindications: [], interactions: ["Diarreia por C. difficile"],
    onset: "—", duration: "8 h",
    doseRules: [r("clinda-adulto", "adulto", "Infecção estreptocócica de partes moles", "IV", "bolus", q(600, "mg"), q(900, "mg"), ["INT-IDSA-SSTI-2014"], { frequency: "8/8 h" }), r("clinda-idoso", "idoso", "Infecção estreptocócica de partes moles", "IV", "bolus", q(600, "mg"), q(900, "mg"), ["INT-IDSA-SSTI-2014"])],
    availability: ["medicacoes_urgencia"], sourceIds: ["BR-ANVISA", "INT-IDSA-SSTI-2014"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "doxiciclina", name: "Doxiciclina", drugClass: "Tetraciclina",
    presentations: [{ id: "cp100", label: "Comprimido 100 mg", concentration: q(100, "mg"), form: "comprimido" }],
    routes: ["VO"], indications: ["Febre maculosa (todas as idades, conforme MS)", "Leptospirose (formas leves)"], contraindications: [], interactions: ["Antiácidos reduzem absorção"],
    onset: "—", duration: "12 h",
    doseRules: [r("doxi-adulto", "adulto", "Febre maculosa", "VO", "bolus", q(100, "mg"), q(100, "mg"), ["BR-FM", "BR-FM-2026"], { frequency: "12/12 h (conferir duração)" })],
    availability: ["medicacoes_basicas", "medicacoes_urgencia"], sourceIds: ["BR-FM", "BR-FM-2026"], reviewedAt: REV, validation: "pendente"
  },
  {
    id: "sro", name: "Sais para reidratação oral (SRO)", drugClass: "Solução de reidratação",
    presentations: [{ id: "env", label: "Envelope para 1 L", concentration: q(1, "mg/mL"), form: "frasco", volumeMl: 1000 }],
    routes: ["VO"], indications: ["Desidratação por diarreia (plano B)"], contraindications: ["Vômitos incoercíveis", "Rebaixamento", "Choque"], interactions: [],
    onset: "—", duration: "—",
    doseRules: [r("sro-ped", "pediatrico", "Plano B", "VO", "infusao_volume", q(50, "mL/kg"), q(100, "mL/kg"), ["BR-PCDT"], { notes: "Em 4 h na unidade, conforme esquema do MS (conferir)." })],
    availability: ["medicacoes_basicas"], sourceIds: ["BR-RENAME"], reviewedAt: REV, validation: "pendente"
  }
];

export const DRUGS: DrugDefinition[] = drugsRaw.map((d) => DrugDefinitionSchema.parse(d));
export const DRUGS_BY_ID = new Map(DRUGS.map((d) => [d.id, d]));
