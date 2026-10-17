# CASE_COVERAGE — Plantão 3D

Gerado por `python3 tools/scripts/case_coverage.py` a partir do catálogo C001–C120 do SPEC.md e dos arquivos em `src/content/cases`.

- Casos solicitados: 120
- Casos implementados e registrados: **105** (prioritários: 24/24)
- Revisão clínica qualificada: **nenhum caso revisado por profissional** — status `technicallyTested` significa apenas que o schema validou e as trajetórias automáticas passaram.
- Cada caso implementado tem 5+ trajetórias (aceitável, sem intervenção, inadequada, atraso, alternativa) executadas com replay e hash em `tests/content/cases.test.ts`.

| ID | Tema solicitado | Implementado | Status | Trajetórias | Perfil de recursos | Prioritário |
|---|---|---|---|---|---|---|
| C001 | Hipoperfusão em infecção urinária complicada | sim | technicallyTested | 5 | hospital-regional | sim |
| C002 | Hipotensão em infarto extenso | sim | technicallyTested | 6 | hospital-regional | sim |
| C003 | Sangramento digestivo com instabilidade | sim | technicallyTested | 5 | hospital-regional |  |
| C004 | Reação alérgica grave após medicamento | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C005 | Deterioração após procedimento torácico | sim | technicallyTested | 5 | hospital-referencia |  |
| C006 | Parada com ritmo chocável em área monitorizada | sim | technicallyTested | 5 | hospital-regional | sim |
| C007 | Atividade elétrica sem pulso após deterioração | sim | technicallyTested | 5 | hospital-regional | sim |
| C008 | Cuidados após recuperação da circulação | sim | technicallyTested | 5 | upa-porte-ii |  |
| C009 | Dor torácica isquêmica com alteração no ECG | sim | technicallyTested | 5 | hospital-regional | sim |
| C010 | Dor torácica sem elevação persistente do segmento ST | sim | technicallyTested | 5 | hospital-regional |  |
| C011 | Dispneia com congestão pulmonar e hipertensão | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C012 | Palpitações regulares em pessoa estável | sim | technicallyTested | 5 | upa-porte-ii |  |
| C013 | Taquicardia com repercussão hemodinâmica | sim | technicallyTested | 5 | hospital-regional |  |
| C014 | Bradicardia com síncope e hipoperfusão | sim | technicallyTested | 5 | hospital-regional |  |
| C015 | Dor torácica abrupta irradiada para o dorso | sim | technicallyTested | 6 | hospital-regional |  |
| C016 | Dispneia e dor pleurítica após imobilização | sim | technicallyTested | 5 | hospital-regional |  |
| C017 | Crise asmática com dificuldade para falar | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C018 | Exacerbação de doença pulmonar obstrutiva | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C019 | Febre, tosse e hipoxemia em idoso | sim | technicallyTested | 5 | upa-porte-ii |  |
| C020 | Dispneia súbita após tosse intensa | sim | technicallyTested | 5 | hospital-regional |  |
| C021 | Sonolência em paciente com doença respiratória crônica | sim | technicallyTested | 5 | hospital-regional |  |
| C022 | Hipoxemia em pessoa imunossuprimida | sim | technicallyTested | 5 | hospital-regional |  |
| C023 | Dispneia com estridor e progressão rápida | sim | technicallyTested | 5 | hospital-regional |  |
| C024 | Derrame pleural com limitação respiratória | sim | technicallyTested | 5 | hospital-regional |  |
| C025 | Déficit focal de início conhecido | sim | technicallyTested | 6 | hospital-regional | sim |
| C026 | Déficit focal ao despertar | sim | technicallyTested | 5 | hospital-regional |  |
| C027 | Cefaleia explosiva com exame inicialmente preservado | sim | technicallyTested | 5 | hospital-regional |  |
| C028 | Crises convulsivas repetidas sem recuperação | sim | technicallyTested | 5 | hospital-regional | sim |
| C029 | Alteração de consciência por causa metabólica | sim | technicallyTested | 5 | upa-porte-ii |  |
| C030 | Febre, cefaleia e rigidez de nuca | sim | technicallyTested | 5 | hospital-regional |  |
| C031 | Fraqueza ascendente com sintomas respiratórios | sim | technicallyTested | 5 | hospital-regional |  |
| C032 | Vertigem com sinais neurológicos associados | sim | technicallyTested | 5 | hospital-regional |  |
| C033 | Febre após exposição a carrapatos | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C034 | Síndrome febril com sinais de alarme compatíveis com dengue | sim | technicallyTested | 5 | upa-porte-ii |  |
| C035 | Infecção cutânea rapidamente progressiva | sim | technicallyTested | 5 | hospital-regional |  |
| C036 | Febre e dor lombar com instabilidade | sim | technicallyTested | 5 | hospital-referencia |  |
| C037 | Febre persistente e sopro em contexto de risco | sim | technicallyTested | 5 | hospital-regional |  |
| C038 | Febre após enchente, mialgia e disfunção orgânica | sim | technicallyTested | 5 | hospital-regional |  |
| C039 | Síndrome febril em pessoa neutropênica | sim | technicallyTested | 5 | hospital-regional |  |
| C040 | Ferimento com risco infeccioso e vacinal | sim | technicallyTested | 5 | ubs-urbana |  |
| C041 | Colisão com trauma abdominal e hipotensão | sim | technicallyTested | 5 | hospital-regional | sim |
| C042 | Trauma torácico com piora respiratória | sim | technicallyTested | 5 | samu-usa |  |
| C043 | Traumatismo craniano com rebaixamento progressivo | sim | technicallyTested | 5 | hospital-referencia |  |
| C044 | Trauma pélvico com sinais de choque | sim | technicallyTested | 5 | hospital-regional |  |
| C045 | Trauma penetrante de membro com sangramento importante | sim | technicallyTested | 5 | upa-porte-ii |  |
| C046 | Queimadura com suspeita de lesão inalatória | sim | technicallyTested | 5 | hospital-regional |  |
| C047 | Trauma cervical com déficit neurológico | sim | technicallyTested | 5 | hospital-regional |  |
| C048 | Acidente em criança com múltiplas lesões | sim | technicallyTested | 5 | hospital-referencia |  |
| C049 | Poliúria, vômitos e alteração metabólica em jovem | sim | technicallyTested | 5 | hospital-regional | sim |
| C050 | Desidratação e alteração de consciência em pessoa com diabetes | sim | technicallyTested | 5 | hospital-regional |  |
| C051 | Sudorese e confusão em usuário de insulina | sim | technicallyTested | 5 | samu-usa | sim |
| C052 | Vômitos e hipotensão em usuário crônico de corticosteroide | sim | technicallyTested | 5 | upa-porte-ii |  |
| C053 | Febre, taquicardia e alteração de consciência em hipertireoidismo | sim | technicallyTested | 5 | hospital-regional |  |
| C054 | Hipotermia e rebaixamento em hipotireoidismo | sim | technicallyTested | 5 | hospital-regional |  |
| C055 | Fraqueza e distúrbio de cálcio sintomático | sim | technicallyTested | 5 | hospital-regional |  |
| C056 | Hiperglicemia em UBS com sintomas e perda de peso | sim | technicallyTested | 5 | ubs-urbana |  |
| C057 | Fraqueza e alteração de ECG em doença renal | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C058 | Confusão e convulsão com sódio baixo | sim | technicallyTested | 5 | hospital-regional |  |
| C059 | Desidratação com sódio elevado | sim | technicallyTested | 5 | hospital-regional |  |
| C060 | Lesão renal após perdas gastrointestinais | sim | technicallyTested | 5 | hospital-regional |  |
| C061 | Retenção urinária com aumento de creatinina | sim | technicallyTested | 5 | upa-porte-ii |  |
| C062 | Congestão e doença renal avançada | sim | technicallyTested | 5 | hospital-regional |  |
| C063 | Acidose em intoxicação ou hipoperfusão | sim | technicallyTested | 5 | hospital-regional |  |
| C064 | Anemia e doença renal crônica em seguimento | sim | technicallyTested | 5 | ubs-urbana |  |
| C065 | Dor em fossa ilíaca direita com evolução atípica | sim | technicallyTested | 5 | hospital-regional |  |
| C066 | Dor em hipocôndrio direito e febre | sim | technicallyTested | 5 | hospital-referencia |  |
| C067 | Dor epigástrica persistente com vômitos | sim | technicallyTested | 5 | hospital-regional |  |
| C068 | Distensão, vômitos e parada de eliminação de gases | sim | technicallyTested | 5 | hospital-regional |  |
| C069 | Dor abdominal desproporcional ao exame | sim | technicallyTested | 5 | hospital-referencia |  |
| C070 | Ascite, febre e alteração clínica | sim | technicallyTested | 5 | hospital-regional |  |
| C071 | Hemorragia digestiva em pessoa com hepatopatia | sim | technicallyTested | 5 | hospital-regional |  |
| C072 | Diarreia com desidratação e fatores de risco | sim | technicallyTested | 5 | hospital-regional |  |
| C073 | Dor e sangramento no início da gestação | sim | technicallyTested | 5 | hospital-regional | sim |
| C074 | Hipertensão e sintomas neurológicos na gestação | sim | technicallyTested | 5 | hospital-regional | sim |
| C075 | Convulsão em gestante | sim | technicallyTested | 5 | hospital-regional |  |
| C076 | Sangramento após parto | sim | technicallyTested | 5 | hospital-regional | sim |
| C077 | Sangramento no terceiro trimestre | sim | technicallyTested | 5 | hospital-regional |  |
| C078 | Dor pélvica, febre e corrimento | sim | technicallyTested | 5 | ubs-urbana |  |
| C079 | Dor pélvica súbita com náuseas | sim | technicallyTested | 5 | hospital-regional |  |
| C080 | Consulta pré-natal com fator de risco identificado | sim | technicallyTested | 5 | ubs-urbana |  |
| C081 | Lactente com esforço respiratório e dificuldade de alimentação | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C082 | Criança com sibilância intensa | sim | technicallyTested | 5 | upa-porte-ii |  |
| C083 | Diarreia em criança com desidratação | sim | technicallyTested | 5 | upa-porte-ii | sim |
| C084 | Febre em lactente pequeno com aparência alterada | sim | technicallyTested | 5 | hospital-regional |  |
| C085 | Criança com febre e convulsão | sim | technicallyTested | 5 | upa-porte-ii |  |
| C086 | Criança com estridor e tosse característica | sim | technicallyTested | 5 | upa-porte-ii |  |
| C087 | Vômitos, dor abdominal e letargia em criança | sim | technicallyTested | 5 | hospital-regional |  |
| C088 | Recém-nascido com icterícia e fator de risco | sim | technicallyTested | 5 | hospital-regional |  |
| C089 | Ingestão excessiva de paracetamol | sim | technicallyTested | 5 | hospital-regional | sim |
| C090 | Exposição a organofosforado | sim | technicallyTested | 5 | hospital-regional |  |
| C091 | Rebaixamento e hipoventilação após opioide | sim | technicallyTested | 5 | samu-usa |  |
| C092 | Dor torácica e agitação após estimulante | sim | technicallyTested | 5 | upa-porte-ii |  |
| C093 | Picada de escorpião em criança | sim | technicallyTested | 5 | hospital-regional |  |
| C094 | Acidente ofídico com alterações locais e sistêmicas | sim | technicallyTested | 5 | hospital-regional |  |
| C095 | Exposição a monóxido de carbono | sim | technicallyTested | 5 | hospital-regional |  |
| C096 | Intoxicação alcoólica com risco de aspiração | sim | technicallyTested | 5 | hospital-regional |  |
| C097 | Ideação suicida com plano em contexto de crise | sim | technicallyTested | 5 | ubs-urbana | sim |
| C098 | Agitação psicomotora com causa ainda desconhecida | sim | technicallyTested | 5 | upa-porte-ii |  |
| C099 | Primeiro episódio psicótico | sim | technicallyTested | 5 | upa-porte-ii |  |
| C100 | Humor expansivo, insônia e comportamento de risco | sim | technicallyTested | 5 | hospital-regional |  |
| C101 | Ansiedade intensa com sintomas torácicos | sim | technicallyTested | 5 | upa-porte-ii |  |
| C102 | Abstinência alcoólica com sinais de gravidade | sim | technicallyTested | 5 | hospital-regional |  |
| C103 | Alteração aguda e flutuante da atenção no idoso | sim | technicallyTested | 5 | hospital-regional |  |
| C104 | Febre e rigidez em usuário de psicofármaco | sim | technicallyTested | 5 | hospital-regional |  |
| C105 | Hipertensão persistente em seguimento | sim | technicallyTested | 5 | ubs-urbana | sim |
| C106 | Pressão elevada com sintomas de possível lesão aguda | não | — | 0 | — |  |
| C107 | Diabetes fora da meta com esquema inadequado | não | — | 0 | — |  |
| C108 | Polifarmácia, quedas e sintomas inespecíficos no idoso | não | — | 0 | — |  |
| C109 | Asma com uso frequente de alívio em consulta | não | — | 0 | — |  |
| C110 | Sintomas depressivos em consulta de UBS | não | — | 0 | — |  |
| C111 | Sintomas urinários e dúvida sobre local de infecção | não | — | 0 | — |  |
| C112 | Escolha de contracepção com comorbidades | não | — | 0 | — |  |
| C113 | Dor testicular de início súbito | não | — | 0 | — |  |
| C114 | Dor lombar, retenção e alteração neurológica | não | — | 0 | — |  |
| C115 | Dor ocular e perda visual aguda | não | — | 0 | — |  |
| C116 | Epistaxe persistente com repercussão | não | — | 0 | — |  |
| C117 | Dor odontogênica, edema e limitação de abertura oral | não | — | 0 | — |  |
| C118 | Edema de membro com dor e fatores de risco | não | — | 0 | — |  |
| C119 | Lesões cutâneas com febre em usuário de novo fármaco | não | — | 0 | — |  |
| C120 | Dor articular aguda com febre | não | — | 0 | — |  |

Caso técnico adicional: T000 (tutorial do motor; não clínico).
