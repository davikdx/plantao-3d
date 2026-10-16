# Plantão 3D

Simulador clínico em pt-BR para estudantes de medicina, com paciente 3D procedural, motor fisiológico determinístico e casos no contexto do SUS (UBS, UPA, SAMU 192, hospital regional e de referência, regulação).

> **Uso educacional.** Não é dispositivo médico, não substitui protocolos institucionais nem supervisão. Doses e condutas têm status de validação **pendente** até revisão clínica qualificada (veja [CLINICAL_REVIEW.md](CLINICAL_REVIEW.md)).

## Baixar o APK
O GitHub Actions gera um APK de **debug** a cada push em `main` e o publica na Release `latest`:
https://github.com/davikdx/plantao-3d/releases/tag/latest (arquivo `plantao3d-debug.apk` + `SHA256SUMS.txt`).

- Android 8.0+ (minSdk 26). Instale permitindo "fontes desconhecidas".
- O APK de debug é assinado com uma chave gerada em cada build. Para atualizar, pode ser necessário **desinstalar a versão anterior** (o histórico local é perdido; use Configurações → Exportar backup antes). A chave de release fixa depende dos secrets descritos abaixo.
- **Ainda não foi testado em aparelho físico nem em emulador** (veja [TEST_RESULTS.md](TEST_RESULTS.md)).

## O que existe
- 25 casos clínicos completos (os 24 prioritários do SPEC + C091) e 1 caso técnico (T000). Cobertura detalhada em [CASE_COVERAGE.md](CASE_COVERAGE.md).
- Motor determinístico (tick de 0,1 s): regras declarativas, tendências exponenciais, exames com coleta e liberação, prescrição com checagem de unidades, replay, desfazer e snapshot com hash.
- Paciente 3D procedural (Three.js), 6 ambientes, dispositivos, modo 2D acessível, monitor multiparamétrico, ECG de 12 derivações, sons sintetizados.
- Pontuação em 6 domínios, debriefing, histórico, editor de casos e variantes, tutor local por regras, prova oral por rubrica.
- Funciona offline. Persistência em SQLite (Android) ou IndexedDB (web), com backup em JSON.

## Requisitos (desenvolvimento)
- Node.js 22–24 (CI usa 24; desenvolvimento local testado com 22.22.0) e npm.
- Para Android: JDK 21 e Android SDK (o CI instala). Não é necessário Android Studio para o fluxo de CI.

## Comandos
```bash
npm ci                     # dependências pelo lockfile (versões fixadas)
npm run dev                # servidor web local em http://127.0.0.1:5173
npm run typecheck          # TypeScript
npx vitest run             # testes do motor, domínio e conteúdo (inclui todas as trajetórias dos casos)
npm run validate:content   # apenas validação de casos/trajetórias
npm run build              # build web em dist/
PW_CHROMIUM_PATH=/caminho/do/chromium npx playwright test   # testes de interface web (Chromium)
npm run android:sync       # build + cap sync android
cd android && ./gradlew assembleDebug                         # APK de debug local
python3 tools/scripts/case_coverage.py > CASE_COVERAGE.md     # regenera a cobertura de casos
```

## Assinatura de release (opcional)
O workflow assina um APK de release se existirem os secrets do repositório:
`PLANTAO_KEYSTORE_B64` (keystore em base64), `PLANTAO_KEY_ALIAS`, `PLANTAO_KEYSTORE_PASSWORD`, `PLANTAO_KEY_PASSWORD`.
Gerar a chave (uma vez, guardar em local seguro e **nunca** commitar):
```bash
keytool -genkeypair -v -keystore plantao3d.jks -alias plantao3d -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 plantao3d.jks   # valor do secret PLANTAO_KEYSTORE_B64
```

## IA opcional
O app funciona sem IA externa (paciente e tutor por regras locais). Um gateway próprio pode ser configurado em Configurações (`VITE_AI_GATEWAY_URL` em `.env.example`). Nenhuma chave de API vai no APK.

## Limitações verificadas
- Sem teste em Android real/emulador; sem instalação por `adb` executada.
- 95 dos 120 casos do catálogo ainda não foram escritos.
- Nenhum caso passou por revisão clínica qualificada; várias fontes estão como "localizador conferido" ou "não acessado".
- Modelo 3D é procedural (sem skinning); expressões e animações são simplificadas.
- Sons de ausculta são sintetizados e ilustrativos.

## Documentação
[ARCHITECTURE.md](ARCHITECTURE.md) · [SPEC.md](SPEC.md) · [PROGRESS.md](PROGRESS.md) · [TEST_RESULTS.md](TEST_RESULTS.md) · [CLINICAL_REVIEW.md](CLINICAL_REVIEW.md) · [ASSET_LICENSES.md](ASSET_LICENSES.md) · [CASE_COVERAGE.md](CASE_COVERAGE.md)
