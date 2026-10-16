# ARCHITECTURE — Plantão 3D

## Visão geral
```
src/
  domain/      tipos e schemas (Zod): unidades, variáveis fisiológicas, flags, recursos/perfis, schema de caso
  engine/      motor determinístico puro (sem DOM): estado, fila de eventos, regras, prescrição, pontuação, views
  content/     catálogos (ações, exames, medicamentos, diagnósticos), referências, casos C###, validação, variantes
  renderer3d/  Three.js: paciente procedural, ambientes, dispositivos, cena e raycast
  ui/          React: telas, atendimento (palco 3D/2D, monitor, abas), áudio sintetizado, estilos
  app/         bootstrap, rotas, SessionController (relógio, persistência, pausa em segundo plano)
  storage/     adaptadores SQLite (Capacitor) / IndexedDB (Dexie) / memória; backup JSON com hash
  ai/          adaptadores locais (paciente estruturado, tutor) e gateway generativo opcional
  i18n/pt-BR/  textos de interface
android/       projeto Capacitor (gerado e versionado)
tests/         Vitest (motor, domínio, conteúdo) e Playwright (fluxo web)
tools/         scripts de captura, caminhada de UI e cobertura de casos
```

## Fluxo de dados
1. `loadBuiltinCases()` valida cada caso com o schema e referências cruzadas (catálogos, fontes, perfil de recursos). Caso inválido não executa.
2. `createSession(ctx, seed)` cria o `SimState` a partir de `initial`. `ctx` = caso + catálogos + perfil de recursos.
3. A UI envia **comandos** (`askHistory`, `examine`, `performAction`, `orderTest`, `prescribe`, `setFinalDiagnosis`, `setDisposition`…) via `dispatch`. Cada comando é idempotente por id, validado e registrado no `commandLog`.
4. `advanceTo(tick)` avança em ticks inteiros de 0,1 s: processa a fila (conclusão de ações, coleta/liberação de exames, administrações), aplica tendências e avalia regras.
5. `views.ts` gera três projeções separadas: `learnerView` (sem diagnóstico oculto), `visualState` (para o 3D/2D) e `publicPatientFacts` (para o adaptador de paciente). Testes garantem que o diagnóstico não vaza.
6. Ao finalizar, `scoring.ts` calcula 6 domínios (história 20, priorização 20, exames 15, tratamento 25, reavaliação 10, destino 10), normalizados, com evidências e penalidades.

## Invariantes
- **Determinismo:** mesmo caso + seed + comandos ⇒ mesmo estado (hash FNV-1a). `replay` reproduz; `undo` cria nova ramificação a partir do snapshot.
- **Conteúdo é dado, não código:** casos usam linguagem declarativa de condições/efeitos; sem `eval`/funções no JSON.
- **Tendências:** `x = alvo + (x − alvo)·e^(−dt/τ)` por slot, com prioridade; maior prioridade prevalece.
- **Exames:** a amostra é congelada na coleta; tratamentos posteriores não alteram o resultado já coletado.
- **Prescrição:** via e disponibilidade checadas; unidades convertidas por dimensão; faixas de dose geram apenas alertas (o simulador não sugere dose).
- **Recursos:** ações, exames, medicamentos e destinos dependem do perfil (UBS, UPA, SAMU USA/USB, hospital regional/referência).
- **Sem segredos:** nenhuma chave no app; `server.url` do Capacitor não é usado (app empacotado offline).

## Decisões
- React + TypeScript + Vite; Three.js sem modelos externos (paciente procedural por hierarquia de grupos, sem skinning) para evitar licenças e peso.
- Capacitor 8.5.3 com SQLite comunitário no Android; Dexie na web; memória como último recurso.
- Build Android exclusivamente no GitHub Actions (o ambiente de desenvolvimento não tem SDK Android); erros do Gradle expostos como anotações.
- Fontes clínicas com status honesto (`conteudo_conferido`, `localizador_conferido`, `nao_acessado`); simplificações didáticas marcadas com `AUTOR-SIMPLIFICACAO`.
