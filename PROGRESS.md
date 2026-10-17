# PROGRESS — Plantão 3D

Atualizado em 17/10/2026.

## Concluído (verificado)
- Motor determinístico (src/engine): tick fixo 0,1 s, eventos, regras declarativas, tendências, ordens/exames com coleta imutável, prescrição com unidades, replay, desfazer, snapshot com hash.
- Domínio/schemas Zod, catálogos (ações, exames, ~55 medicamentos incluindo alteplase e dobutamina, diagnósticos), registro de fontes com status honesto.
- **Marco intermediário do SPEC 11.2 atingido:** os 24 casos prioritários (C001, C002, C004, C006, C007, C009, C011, C017, C018, C025, C028, C033, C041, C049, C051, C057, C073, C074, C076, C081, C083, C089, C097, C105) + C091 + T000, cada um com 5–6 trajetórias testadas.
- 3D procedural, 6 ambientes, modo 2D, monitor, ECG, áudio sintetizado; interface completa (biblioteca, briefing, atendimento, debriefing, histórico, editor, variantes).
- Persistência SQLite/IndexedDB e backup JSON.
- Testes: 245 Vitest + 2 Playwright (web) aprovados; CI gera APK de debug na Release `latest` (último: commit fca1987).
- Documentação: README, ARCHITECTURE, SPEC, TEST_RESULTS, CLINICAL_REVIEW, ASSET_LICENSES, CASE_COVERAGE, .env.example.
- Ícones e splash próprios (tools/scripts/make_icons.py).

## Em andamento
- Nada em andamento: **os 120 casos do catálogo (C001–C120) + T000 estão implementados**, cada um com 5 trajetórias testadas (1006 testes Vitest aprovados em 17/10/2026).

## Pendente
1. Revisão clínica qualificada (nenhum caso revisado por profissional); várias fontes são resumos secundários ou apenas resumo/localizador — ver `notes` em src/content/references/index.ts.
2. Chave de release: gerar keystore e cadastrar os secrets PLANTAO_KEYSTORE_B64, PLANTAO_KEY_ALIAS, PLANTAO_KEYSTORE_PASSWORD, PLANTAO_KEY_PASSWORD (README).
3. Teste em aparelho Android físico ou emulador (não executado).
4. Opcional: services/ai-gateway, script Blender, pacotes ZIP de casos.

## Próximo comando
Revisar clinicamente os casos (CLINICAL_REVIEW.md), conferir fontes marcadas como `nao_acessado`/`localizador_conferido`, configurar a chave de release e testar o APK em aparelho Android.
