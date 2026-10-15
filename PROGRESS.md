# PROGRESS — Plantão 3D

Atualizado em 15/10/2026.

## Concluído (verificado)
- Motor determinístico (src/engine): tick fixo 0,1 s, eventos, regras declarativas, tendências, ordens/exames com coleta imutável, prescrição com unidades, replay, desfazer, snapshot com hash.
- Domínio/schemas Zod (src/domain), catálogos de ações, exames, 45+ medicamentos e diagnósticos (src/content/catalog), registro de fontes com status honesto de verificação.
- Caso técnico T000 e caso clínico C004 (anafilaxia) com 5 trajetórias.
- 3D procedural (src/renderer3d): paciente articulado (hierarquia de grupos, sem skinning), 6 ambientes, dispositivos, câmera, raycast, animações.
- Interface completa (src/ui): início, biblioteca, briefing, atendimento 3D/2D, monitor, abas, tutor, debriefing, histórico, configurações, editor, variantes, inspeção 3D.
- Persistência: SQLite (Android) e IndexedDB (web), backup JSON.
- Testes: 51 unitários (Vitest) + 2 ponta a ponta (Playwright, Chromium web) passando.
- CI do GitHub Actions gera APK de debug na Release "latest".

## Pendente
1. Casos clínicos: apenas C004 está pronto. Próximos prioritários: C006, C017, C049, C051, C001, C009, C057, C081, C076, C097, C105 (depois os demais dos 24 e dos 120).
2. Docs: README, ARCHITECTURE, SPEC, TEST_RESULTS, CLINICAL_REVIEW, ASSET_LICENSES, CASE_COVERAGE.
3. Chave de release: gerar keystore e cadastrar os secrets PLANTAO_KEYSTORE_B64, PLANTAO_KEY_ALIAS, PLANTAO_KEYSTORE_PASSWORD e PLANTAO_KEY_PASSWORD (o APK debug muda de assinatura a cada build).
4. Teste em aparelho Android real ou emulador (não executado).
5. Opcional: services/ai-gateway, script Blender, pacotes ZIP.

## Próximo comando
Continue a implementação a partir de PROGRESS.md e SPEC (prompt original), preserve o que funciona, escreva os próximos casos em src/content/cases (modelo: C004.ts + helpers.ts), registre em cases/index.ts e rode `npx vitest run`.
