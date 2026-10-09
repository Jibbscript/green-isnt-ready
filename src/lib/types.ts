export type ModuleId = 'a' | 'b' | 'c' | 'd' | 'e';
export type Tier = 'CORE' | 'EXTENDED';

export interface ModuleMeta { id: ModuleId; label: string; icon: string; title: string; intro: string; selfCheck: string[] }

export interface Entry {
  id: string; module: ModuleId; title: string; tier: Tier;
  refresher: string; whyHere: string;
  resources: string[]; startHere: string;
  prereqs: string[]; related: string[]; aliases: string[]; flags: string[];
  anchors: string[]; seenIn: string[]; cards: string[]; formulas: string[]; paths: string[];
}

export interface Resource {
  id: string; url: string; title: string; org: string; year: number | null;
  type: string; access: 'free' | 'registration' | 'paywalled'; level: 'refresher' | 'intermediate' | 'deep';
  minutes: number | null; verified: string | null; why: string;
  site: 'learn-inference' | 'inferenceengineering' | null; provenance: string | null; vendor: boolean;
  status: 'verified' | 'main-spec' | 'listed' | 'seed' | 'derived' | 'link-checked' | 'unverified';
  usedBy: string[]; modules: string[]; check?: string;
}

export interface Formula {
  id: string; title: string; expr: string; vars: Record<string, string>; assumptions: string;
  sources: string[]; sourceNote?: string; entries: string[]; anchors: string[]; cards: string[];
}

export interface CardNumber { v: string; date: string; src: string | null; note?: string }
export type Coverage = 'yes' | 'partial' | 'proposed' | 'no';
export interface Card {
  id: string; title: string; why: string; numbers: CardNumber[]; levers: string[];
  gains: string; costs: string; signatures: string[]; extra?: { label: string; text: string }[];
  nvcre: string; coverage: Coverage; links: string[]; formulas: string[]; resources: string[];
  matrix: { lever: string; gain: string; cost: string; check: string }; anchors: string[];
}

export interface Path { id: string; title: string; minutes: number; steps: string[]; external: string | null; relation: string }
export interface Anchor { id: string; loc: string; term: string; entries: string[]; kind: 'N' | 'F' }
export interface XLink { path?: string; rid?: string; text?: string; ok?: boolean }
export interface CrosswalkRow {
  book: string; topic: string; li: XLink[]; ie: XLink[]; entries: string[];
  module: string; tier: string; out: string | null; note: string | null;
}

export interface AppendixData {
  version: string;
  modules: ModuleMeta[];
  entries: Entry[];
  resources: Resource[];
  formulas: Formula[];
  cards: Card[];
  paths: Path[];
  anchors: Anchor[];
  crosswalk: CrosswalkRow[];
  gapAudit: {
    added: string[]; addedNote: string; sitesMiss: string[]; sitesMissNote: string;
    outOfScope: string[]; credibility: string[]; siteRule: string;
  };
  researchLimits: string[];
  openQuestions: string[];
  additionalSources: string[];
}

export type TargetKind = 'entry' | 'card' | 'formula';
