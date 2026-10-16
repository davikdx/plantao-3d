# ASSET_LICENSES — Plantão 3D

## Recursos visuais e sonoros
O app **não inclui** modelos 3D, texturas, imagens clínicas, fontes tipográficas nem gravações de áudio de terceiros.

| Recurso | Origem | Licença |
|---|---|---|
| Paciente 3D, ambientes e dispositivos | Gerados por código (`src/renderer3d/*`) com primitivas do Three.js | Código do projeto |
| Traçados do monitor e ECG | Gerados por código (`src/ui/monitor/waveforms.ts`, `src/ui/encounter/Ecg12.tsx`) | Código do projeto |
| Bipes, alarmes e sons de ausculta | Sintetizados em tempo real (WebAudio, `src/ui/audio.ts`); ilustrativos, não gravações clínicas | Código do projeto |
| Ícone/favicon (`public/favicon.svg`), ícones do launcher e splash do Android | Criados para o projeto; PNGs do Android gerados por `tools/scripts/make_icons.py` | Código do projeto |
| Demais arquivos do projeto Android (`android/`, incluindo vetores não usados em `drawable*/ic_launcher_*.xml`) | Template do Capacitor 8.5.3 (`@capacitor/cli`) | MIT |
| Tipografia | Fontes do sistema (sem download) | — |

## Dependências de software (versões fixadas no package-lock.json)
| Pacote | Versão | Licença (declarada pelo projeto upstream) |
|---|---|---|
| react, react-dom | 19.3.1 | MIT |
| three | 0.186.1 | MIT |
| zod | 4.6.7 | MIT |
| dexie | 4.4.6 | Apache-2.0 |
| @capacitor/core, android, cli | 8.5.3 | MIT |
| @capacitor/app, preferences, filesystem, share | 8.1.2 / 8.0.1 / 8.1.5 / 8.0.3 | MIT |
| @capacitor-community/sqlite | 8.1.1 | MIT |
| vite, @vitejs/plugin-react, vitest | 8.3.4 / 6.1.2 / 5.0.5 | MIT |
| typescript | 7.0.2 | Apache-2.0 |
| @playwright/test | 1.64.1 | Apache-2.0 |

As licenças acima foram anotadas a partir do campo `license` dos pacotes; confira `node_modules/<pacote>/LICENSE` antes de redistribuição comercial.

## Conteúdo clínico
Textos dos casos foram escritos para o projeto. Documentos citados (Ministério da Saúde, sociedades, diretrizes internacionais) são referenciados por link e **não** são reproduzidos; veja [CLINICAL_REVIEW.md](CLINICAL_REVIEW.md).
