import type { Catalog } from "../../engine/types";
import { ACTIONS_BY_ID } from "./actions";
import { DRUGS_BY_ID } from "./drugs";
import { TESTS_BY_ID } from "./tests";

export const CATALOG: Catalog = {
  actions: ACTIONS_BY_ID,
  drugs: DRUGS_BY_ID,
  tests: TESTS_BY_ID
};

export { ACTIONS, ACTIONS_BY_ID } from "./actions";
export { DRUGS, DRUGS_BY_ID } from "./drugs";
export { TESTS, TESTS_BY_ID } from "./tests";
export { DIAGNOSES, DIAGNOSES_BY_ID, diagnosisLabel } from "./diagnoses";
