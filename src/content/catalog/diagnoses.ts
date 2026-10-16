/**
 * Catálogo de diagnósticos (rótulos pt-BR). Sem códigos CID: códigos só seriam incluídos após verificação.
 * Lista ampla e comum a todos os casos para evitar spoiler pela composição das opções.
 */
export interface DiagnosisEntry {
  id: string;
  label: string;
  group: string;
  synonyms?: string[];
}

const D = (id: string, label: string, group: string, synonyms: string[] = []): DiagnosisEntry => ({ id, label, group, synonyms });

export const DIAGNOSES: DiagnosisEntry[] = [
  // Choque / reanimação
  D("choque_septico", "Choque séptico", "Choque e reanimação", ["sepse grave", "choque infeccioso"]),
  D("sepse", "Sepse sem choque", "Choque e reanimação"),
  D("choque_cardiogenico", "Choque cardiogênico", "Choque e reanimação"),
  D("choque_hipovolemico", "Choque hipovolêmico/hemorrágico", "Choque e reanimação", ["choque hemorrágico"]),
  D("choque_obstrutivo", "Choque obstrutivo", "Choque e reanimação"),
  D("anafilaxia", "Anafilaxia", "Choque e reanimação", ["choque anafilático", "reação anafilática"]),
  D("urticaria_aguda", "Urticária aguda sem critérios de anafilaxia", "Choque e reanimação"),
  D("angioedema_bradicinina", "Angioedema mediado por bradicinina (ex.: IECA)", "Choque e reanimação"),
  D("pcr_fv", "PCR em fibrilação ventricular/TV sem pulso", "Choque e reanimação", ["fibrilação ventricular", "parada chocável"]),
  D("pcr_aesp", "PCR em atividade elétrica sem pulso", "Choque e reanimação", ["AESP"]),
  D("pcr_assistolia", "PCR em assistolia", "Choque e reanimação"),
  D("pneumotorax_hipertensivo", "Pneumotórax hipertensivo", "Choque e reanimação"),
  D("tamponamento", "Tamponamento cardíaco", "Choque e reanimação"),
  D("pielonefrite", "Pielonefrite aguda", "Infectologia"),
  D("itu_complicada", "Infecção urinária complicada", "Infectologia"),
  D("cistite", "Cistite não complicada", "Infectologia"),
  // Cardio
  D("iamcsst", "Infarto agudo do miocárdio com supradesnivelamento de ST", "Cardiologia", ["IAM com supra", "IAMCSST", "infarto com supra"]),
  D("iamssst", "Síndrome coronariana aguda sem supradesnivelamento de ST", "Cardiologia", ["IAM sem supra", "angina instável"]),
  D("pericardite", "Pericardite aguda", "Cardiologia"),
  D("disseccao_aorta", "Síndrome aórtica aguda / dissecção de aorta", "Cardiologia"),
  D("tep", "Tromboembolismo pulmonar", "Cardiologia", ["embolia pulmonar"]),
  D("eap_hipertensivo", "Edema agudo de pulmão hipertensivo", "Cardiologia"),
  D("icc_descompensada", "Insuficiência cardíaca descompensada", "Cardiologia"),
  D("tsv", "Taquicardia supraventricular", "Cardiologia"),
  D("fa_alta_resposta", "Fibrilação atrial com alta resposta", "Cardiologia"),
  D("tv_instavel", "Taquicardia ventricular com pulso e instabilidade", "Cardiologia", ["TV instável", "taquicardia ventricular"]),
  D("bav_total", "Bloqueio atrioventricular total", "Cardiologia"),
  D("dor_toracica_musculoesqueletica", "Dor torácica musculoesquelética", "Cardiologia"),
  // Pneumo
  D("asma_grave", "Crise de asma grave", "Pneumologia", ["exacerbação grave de asma", "asma aguda grave"]),
  D("asma_leve_moderada", "Crise de asma leve a moderada", "Pneumologia"),
  D("dpoc_exacerbado", "Exacerbação de DPOC", "Pneumologia"),
  D("pneumonia", "Pneumonia adquirida na comunidade", "Pneumologia", ["PAC"]),
  D("pneumotorax_espontaneo", "Pneumotórax espontâneo", "Pneumologia"),
  D("bronquiolite", "Bronquiolite viral aguda", "Pediatria"),
  D("crupe", "Laringotraqueobronquite (crupe)", "Pediatria"),
  D("asma_pediatrica", "Crise de asma na criança", "Pediatria"),
  D("coqueluche", "Coqueluche", "Pediatria"),
  D("aspiracao_corpo_estranho", "Aspiração de corpo estranho", "Pediatria"),
  // Neuro
  D("avc_isquemico", "Acidente vascular cerebral isquêmico", "Neurologia", ["AVC isquêmico", "AVCi"]),
  D("avc_hemorragico", "Acidente vascular cerebral hemorrágico", "Neurologia", ["AVCh"]),
  D("ait", "Ataque isquêmico transitório", "Neurologia"),
  D("estado_mal_epileptico", "Estado de mal epiléptico", "Neurologia", ["status epilepticus"]),
  D("crise_epileptica_isolada", "Crise epiléptica isolada", "Neurologia"),
  D("sincope", "Síncope", "Neurologia"),
  D("meningite_bacteriana", "Meningite bacteriana", "Neurologia"),
  D("hemorragia_subaracnoidea", "Hemorragia subaracnóidea", "Neurologia"),
  D("hipoglicemia", "Hipoglicemia", "Endocrinologia", ["hipoglicemia grave"]),
  D("encefalopatia_metabolica", "Encefalopatia metabólica", "Neurologia"),
  D("enxaqueca", "Enxaqueca", "Neurologia"),
  D("paralisia_todd", "Paralisia pós-ictal (Todd)", "Neurologia"),
  // Endócrino
  D("cad", "Cetoacidose diabética", "Endocrinologia", ["CAD"]),
  D("ehh", "Estado hiperglicêmico hiperosmolar", "Endocrinologia"),
  D("dm1_inicio", "Diabetes tipo 1 de início recente (sem descompensação aguda grave)", "Endocrinologia"),
  D("gastroenterite", "Gastroenterite aguda", "Gastroenterologia"),
  D("insuficiencia_adrenal", "Insuficiência adrenal aguda", "Endocrinologia"),
  // Nefro
  D("hipercalemia", "Hipercalemia grave", "Nefrologia e eletrólitos", ["hiperpotassemia"]),
  D("hiponatremia", "Hiponatremia sintomática", "Nefrologia e eletrólitos"),
  D("lra", "Lesão renal aguda", "Nefrologia e eletrólitos"),
  D("drc_agudizada", "Doença renal crônica agudizada", "Nefrologia e eletrólitos"),
  D("hipocalcemia", "Hipocalcemia", "Nefrologia e eletrólitos"),
  // Gastro
  D("apendicite", "Apendicite aguda", "Gastroenterologia"),
  D("hda", "Hemorragia digestiva alta", "Gastroenterologia"),
  D("pancreatite", "Pancreatite aguda", "Gastroenterologia"),
  D("colecistite", "Colecistite aguda", "Gastroenterologia"),
  // GO
  D("gestacao_ectopica_rota", "Gestação ectópica rota", "Obstetrícia e ginecologia", ["prenhez ectópica rota"]),
  D("abortamento", "Abortamento", "Obstetrícia e ginecologia"),
  D("pre_eclampsia_grave", "Pré-eclâmpsia com sinais de gravidade", "Obstetrícia e ginecologia", ["pré-eclâmpsia grave", "DHEG grave"]),
  D("eclampsia", "Eclâmpsia", "Obstetrícia e ginecologia"),
  D("hipertensao_gestacional", "Hipertensão gestacional sem sinais de gravidade", "Obstetrícia e ginecologia"),
  D("hellp", "Síndrome HELLP", "Obstetrícia e ginecologia"),
  D("hpp_atonia", "Hemorragia pós-parto por atonia uterina", "Obstetrícia e ginecologia", ["HPP"]),
  D("hpp_trauma", "Hemorragia pós-parto por laceração de trajeto", "Obstetrícia e ginecologia"),
  D("retencao_placentaria", "Retenção de restos placentários", "Obstetrícia e ginecologia"),
  D("coagulopatia", "Coagulopatia", "Obstetrícia e ginecologia"),
  D("torcao_anexial", "Torção anexial", "Obstetrícia e ginecologia"),
  D("dip", "Doença inflamatória pélvica", "Obstetrícia e ginecologia"),
  // Pediatria
  D("desidratacao_grave", "Desidratação grave por diarreia", "Pediatria"),
  D("desidratacao_algum_grau", "Desidratação (algum grau) por diarreia", "Pediatria"),
  D("sepse_neonatal", "Infecção bacteriana grave do lactente", "Pediatria"),
  D("convulsao_febril", "Crise febril", "Pediatria"),
  // Toxicologia
  D("intox_paracetamol", "Intoxicação por paracetamol", "Toxicologia"),
  D("intox_opioide", "Intoxicação por opioide", "Toxicologia", ["overdose de opioide"]),
  D("intox_organofosforado", "Intoxicação por organofosforado/carbamato", "Toxicologia"),
  D("intox_benzodiazepinico", "Intoxicação por benzodiazepínico", "Toxicologia"),
  D("intox_alcool", "Intoxicação alcoólica aguda", "Toxicologia"),
  D("intox_co", "Intoxicação por monóxido de carbono", "Toxicologia"),
  D("intox_estimulante", "Intoxicação por estimulante (cocaína/anfetamina)", "Toxicologia"),
  // Psiquiatria
  D("risco_suicidio_alto", "Ideação suicida com plano — risco elevado", "Psiquiatria", ["risco de suicídio"]),
  D("episodio_depressivo", "Episódio depressivo", "Psiquiatria", ["depressão"]),
  D("transtorno_ajustamento", "Reação aguda ao estresse / transtorno de ajustamento", "Psiquiatria"),
  D("intox_medicamentosa_intencional", "Intoxicação medicamentosa intencional", "Psiquiatria"),
  D("crise_ansiedade", "Crise de ansiedade / ataque de pânico", "Psiquiatria"),
  D("delirium", "Delirium", "Psiquiatria"),
  D("abstinencia_alcool", "Síndrome de abstinência alcoólica", "Psiquiatria"),
  // APS
  D("has_nao_controlada", "Hipertensão arterial não controlada", "Atenção primária", ["HAS descontrolada"]),
  D("has_estagio1_inicial", "Hipertensão arterial estágio 1 (diagnóstico inicial)", "Atenção primária"),
  D("hipertensao_avental_branco", "Hipertensão do avental branco", "Atenção primária"),
  D("urgencia_hipertensiva_lesao", "Emergência hipertensiva com lesão de órgão-alvo", "Atenção primária"),
  D("pseudocrise_hipertensiva", "Elevação pressórica sem lesão aguda de órgão-alvo", "Atenção primária"),
  D("dm2_descompensado", "Diabetes tipo 2 fora da meta", "Atenção primária"),
  D("febre_maculosa", "Febre maculosa", "Infectologia"),
  D("dengue_alarme", "Dengue com sinais de alarme", "Infectologia"),
  D("leptospirose", "Leptospirose", "Infectologia")
];

export const DIAGNOSES_BY_ID = new Map(DIAGNOSES.map((d) => [d.id, d]));

export function diagnosisLabel(id: string): string {
  return DIAGNOSES_BY_ID.get(id)?.label ?? id;
}
