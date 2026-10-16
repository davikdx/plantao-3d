# TEST_RESULTS — Plantão 3D

Resultados reais da última execução registrada (16/10/2026). Nada aqui foi estimado.

## Ambiente de desenvolvimento
- Linux 6.18 (contêiner de desenvolvimento), Node.js 22.22.0, npm, Chromium do Playwright em `/opt/pw-browsers/chromium` (renderização por software, swiftshader).
- Sem Android SDK local: o build Android é feito apenas no GitHub Actions.

## 1. Tipagem
```
npx tsc --noEmit -p tsconfig.json   → sem erros
```

## 2. Motor, domínio e conteúdo (Vitest 5.0.5, Node)
```
npx vitest run   → 4 arquivos, 245 testes, 245 aprovados
```
| Arquivo | Testes | O que cobre |
|---|---|---|
| tests/engine/technical.test.ts | 16 | determinismo, tendência exponencial (fixture do cap. 27), exames com coleta imutável, replay, desfazer, idempotência |
| tests/domain/units.test.ts | 12 | conversões, parse decimal pt-BR, dose total, volume e vazão |
| tests/domain/patient-adapter.test.ts | 9 | intenções do paciente local e ausência de vazamento |
| tests/content/cases.test.ts | 208 | schema e referências cruzadas de 26 casos; testes de rejeição; 5–6 trajetórias por caso com aceitação de todos os comandos, replay com hash idêntico, diagnóstico oculto não vaza, título público sem diagnóstico |

## 3. Build web
```
npm run build   → concluído (Vite 8.3.4); aviso de tamanho de chunk (Three.js)
```

## 4. Interface web (Playwright 1.64.1, Chromium, NÃO é teste Android)
```
PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npx playwright test   → 2 testes, 2 aprovados (52 s)
```
- Atendimento completo do tutorial até o debriefing, com recuperação após recarregar a página.
- Modo 2D acessível, biblioteca com filtros, editor/variante e funcionamento sem rede.

## 5. Android
| Etapa | Status |
|---|---|
| `npx cap sync android` + `./gradlew assembleDebug` no GitHub Actions (ubuntu-latest, JDK 21, Node 24) | **executado, sucesso** — run 38844940093 (commit fca1987) |
| Verificação do APK no CI (apksigner verify, zipalign -c, ABIs) | executado no workflow, sucesso |
| APK publicado na Release `latest` (`plantao3d-debug.apk`, 13,9 MB, com SHA256SUMS.txt) | sucesso |
| Instalação por `adb` | **não executado** |
| Execução em emulador Android | **não executado** |
| Teste em aparelho físico | **não executado** (aguardando o usuário) |
| APK de release assinado com chave fixa | **não gerado** (secrets não configurados) |
