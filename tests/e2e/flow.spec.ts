import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
}

async function tab(page: Page, name: string) {
  await page.getByRole("tab", { name }).click();
}

test("atendimento completo do tutorial até o debriefing, com recuperação após recarregar", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboard(page);
  await page.getByRole("button", { name: "Começar tutorial" }).click();
  await expect(page.getByText("Mal-estar súbito na sala de medicação").first()).toBeVisible();
  await page.getByRole("button", { name: "Iniciar atendimento" }).click();
  await expect(page.locator("canvas.three")).toBeVisible();

  // pausar para controlar o tempo do teste
  await page.getByRole("button", { name: /Pausar/ }).click();

  // monitorização
  await tab(page, "Procedimentos");
  const mon = page.locator(".item", { hasText: "Monitorização multiparamétrica" });
  await mon.getByRole("button", { name: "Realizar" }).click();
  await page.getByRole("button", { name: "+1 min" }).click();
  await expect(page.locator(".monitor")).not.toContainText("Monitor não instalado");

  // conversa livre interpretada localmente
  await tab(page, "Paciente");
  await page.getByLabel("Pergunta ao paciente").fill("A senhora tem alergia a algum remédio?");
  await page.getByRole("button", { name: "Perguntar" }).click();
  await expect(page.locator(".bubble.pt").last()).toContainText("dipirona");

  // exame por clique na região 3D (tórax) — coordenada calculada pela própria cena
  await page.getByRole("button", { name: "Tórax", exact: true }).click();
  await page.waitForTimeout(1200);
  const pos = await page.evaluate(() => (window as unknown as { __scene: { regionScreenPosition(id: string): { x: number; y: number } | null } }).__scene.regionScreenPosition("torax_anterior"));
  expect(pos).not.toBeNull();
  await page.mouse.click(pos!.x, pos!.y);
  const pop = page.getByRole("dialog", { name: /Exame:/ });
  await expect(pop).toBeVisible();
  await pop.getByRole("button", { name: "Ausculta" }).click();
  await page.getByRole("button", { name: "+1 min" }).click();
  await tab(page, "Exame físico");
  await expect(page.locator(".tabpanel")).toContainText(/sibilos|Murmúrio|Bulhas|Nenhuma alteração/i);

  // prescrição parametrizada com vírgula decimal
  await tab(page, "Tratamento");
  await page.getByLabel("Buscar medicamento").fill("adrenalina");
  await page.getByRole("button", { name: /Adrenalina \(epinefrina\)/ }).click();
  await page.getByLabel("Via").selectOption("IM");
  await page.getByLabel("Dose", { exact: true }).fill("0,5");
  await page.getByLabel("Unidade").first().selectOption("mg");
  await page.getByRole("button", { name: "Conferir ordem" }).click();
  await expect(page.locator(".tabpanel")).toContainText("Volume da apresentação");
  await page.getByRole("button", { name: "Confirmar e administrar" }).click();
  await page.getByRole("button", { name: "+1 min" }).click();
  await expect(page.locator(".tabpanel")).toContainText("Administrados");

  // exame complementar com atraso
  await tab(page, "Exames");
  await page.locator(".item", { hasText: "Gasometria venosa" }).getByRole("button", { name: "Solicitar" }).click();
  await expect(page.locator(".tabpanel")).toContainText("Em andamento");
  await page.getByRole("button", { name: "Aguardar 15 min" }).click();
  await expect(page.locator(".tabpanel")).toContainText("Resultados");
  await expect(page.locator(".tabpanel")).toContainText("Lactato");

  // recarregar no meio do atendimento e retomar
  await page.reload();
  await page.getByRole("button", { name: /Continuar atendimento/ }).click();
  await expect(page.locator(".clock")).not.toHaveText(/00:00$/);
  await page.getByRole("button", { name: /Pausar/ }).click();
  await tab(page, "Tratamento");
  await expect(page.locator(".tabpanel")).toContainText("Administrados");

  // diagnóstico e destino
  await tab(page, "Diagnósticos");
  await page.getByLabel("Buscar diagnóstico").fill("anafil");
  await page.locator(".item", { hasText: /^Anafilaxia ·/ }).getByRole("button", { name: "Definir como final" }).click();
  await tab(page, "Destino");
  await page.getByRole("button", { name: /Observação na unidade/ }).click();
  await page.locator(".tabpanel").getByRole("button", { name: "Encerrar atendimento" }).click();
  await page.getByRole("button", { name: "Encerrar e ver debriefing" }).click();
  await expect(page.getByText("Debriefing", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Critérios avaliados")).toBeVisible();
  await expect(page.getByText(/Adrenalina IM nos primeiros 5 minutos/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("modo 2D acessível, biblioteca com filtros, editor/variante e funcionamento sem rede", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel(/Usar modo 2D/).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /Pular/ }).click();
  await context.setOffline(true);
  await page.getByRole("button", { name: /Biblioteca de casos/ }).click();
  await page.getByLabel(/Buscar por queixa/).fill("medicação");
  await expect(page.locator("article").first()).toBeVisible();
  await page.locator("article").first().getByRole("button", { name: "Abrir" }).click();
  await page.getByRole("radio", { name: "Prova", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar atendimento" }).click();
  await expect(page.locator(".body2d svg")).toBeVisible();
  await page.getByRole("button", { name: "Tórax anterior" }).click();
  await expect(page.getByRole("dialog", { name: /Exame: Tórax anterior/ })).toBeVisible();
  // prova: tutor não dá dica
  await page.getByRole("button", { name: /Tutor/ }).click();
  await expect(page.getByText(/Modo prova: sem dicas/)).toBeVisible();
  await page.getByRole("dialog", { name: /Tutor/ }).getByRole("button", { name: "Fechar" }).click();
  await page.getByRole("button", { name: /Sair para o início/ }).click();
  await page.getByRole("button", { name: /Gerar variações/ }).click();
  await page.getByRole("button", { name: "Gerar variante" }).click();
  await expect(page.locator(".item").first()).toContainText(/criada|recusada|duplicad/);
  await page.getByRole("button", { name: /Voltar/ }).click();
  await page.getByRole("button", { name: /Criar\/editar caso/ }).click();
  await page.getByRole("button", { name: "Validar" }).click();
  await expect(page.getByText(/Schema e referências cruzadas válidos/)).toBeVisible();
  await page.getByRole("button", { name: "Salvar caso próprio" }).click();
  await expect(page.getByText(/Salvo: U001/)).toBeVisible();
});
