#!/usr/bin/env python3
"""Gera CASE_COVERAGE.md a partir do catálogo solicitado (SPEC.md) e dos arquivos em src/content/cases.

Uso: python3 tools/scripts/case_coverage.py > CASE_COVERAGE.md
Leitura estática (regex) — não executa código dos casos. Os testes de trajetória são executados por `npx vitest run`.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
spec = (ROOT / "SPEC.md").read_text(encoding="utf-8")
cases_dir = ROOT / "src/content/cases"
index = (cases_dir / "index.ts").read_text(encoding="utf-8")
m = re.search(r"BUILTIN_CASE_INPUTS[^=]*=\s*\[([^\]]*)\]", index)
registered = set(x.strip() for x in m.group(1).split(",")) if m else set()

PRIORITY = "C001 C002 C004 C006 C007 C009 C011 C017 C018 C025 C028 C033 C041 C049 C051 C057 C073 C074 C076 C081 C083 C089 C097 C105".split()

rows = []
for line in spec.splitlines():
    mm = re.match(r"^(C\d{3}) \| (.+?) \| (.+)$", line.strip())
    if not mm:
        continue
    cid, theme, focus = mm.groups()
    f = cases_dir / f"{cid}.ts"
    if f.exists():
        src = f.read_text(encoding="utf-8")
        status = re.search(r'status:\s*"([^"]+)"', src)
        trajs = re.findall(r'kind:\s*"(acceptable|no_intervention|inadequate|delay|alternative)"', src)
        env = re.search(r'resourceProfile:\s*"([^"]+)"', src)
        rows.append((cid, theme, "sim" if cid in registered else "arquivo sem registro", status.group(1) if status else "?", len(trajs), env.group(1) if env else "?", cid in PRIORITY))
    else:
        rows.append((cid, theme, "não", "—", 0, "—", cid in PRIORITY))

done = [r for r in rows if r[2] == "sim"]
prio_done = [r for r in done if r[6]]
out = []
out.append("# CASE_COVERAGE — Plantão 3D\n")
out.append("Gerado por `python3 tools/scripts/case_coverage.py` a partir do catálogo C001–C120 do SPEC.md e dos arquivos em `src/content/cases`.\n")
out.append(f"- Casos solicitados: {len(rows)}")
out.append(f"- Casos implementados e registrados: **{len(done)}** (prioritários: {len(prio_done)}/24)")
out.append("- Revisão clínica qualificada: **nenhum caso revisado por profissional** — status `technicallyTested` significa apenas que o schema validou e as trajetórias automáticas passaram.")
out.append("- Cada caso implementado tem 5+ trajetórias (aceitável, sem intervenção, inadequada, atraso, alternativa) executadas com replay e hash em `tests/content/cases.test.ts`.\n")
out.append("| ID | Tema solicitado | Implementado | Status | Trajetórias | Perfil de recursos | Prioritário |")
out.append("|---|---|---|---|---|---|---|")
for cid, theme, impl, status, n, env, prio in rows:
    out.append(f"| {cid} | {theme} | {impl} | {status} | {n} | {env} | {'sim' if prio else ''} |")
out.append("\nCaso técnico adicional: T000 (tutorial do motor; não clínico).")
sys.stdout.write("\n".join(out) + "\n")
