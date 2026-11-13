export const STATUSES = ['proposed', 'approved', 'rejected', 'superseded'];
export const SOURCES = ['user', 'team', 'assistant', 'external'];

export function makeDecision(input, id = globalThis.crypto?.randomUUID?.()) {
  const title = String(input.title ?? '').trim();
  const rationale = String(input.rationale ?? '').trim();
  if (!title || title.length > 160) throw new Error('Title must contain 1–160 characters.');
  if (rationale.length > 5000) throw new Error('Rationale is too long.');
  if (!STATUSES.includes(input.status)) throw new Error('Unknown status.');
  if (!SOURCES.includes(input.source)) throw new Error('Unknown decision source.');
  if (!id) throw new Error('A unique ID is required.');
  return {
    id, title, rationale, status: input.status, source: input.source,
    project: String(input.project ?? '').trim().slice(0, 100),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
}

export function assertImport(payload) {
  if (!payload || payload.schemaVersion !== 1 || !Array.isArray(payload.decisions)) throw new Error('Not a Decision Ledger v1 export.');
  if (payload.decisions.length > 10000) throw new Error('Too many records.');
  const ids = new Set();
  for (const d of payload.decisions) {
    if (!d || typeof d.id !== 'string' || !d.id || ids.has(d.id)) throw new Error('Invalid or duplicate ID.');
    if (typeof d.title !== 'string' || !d.title.trim() || d.title.length > 160 || typeof d.rationale !== 'string' || d.rationale.length > 5000) throw new Error('Invalid record text.');
    if (typeof d.project !== 'string' || d.project.length > 100 || !STATUSES.includes(d.status) || !SOURCES.includes(d.source)) throw new Error('Invalid record values.');
    if (!Number.isFinite(Date.parse(d.createdAt)) || !Number.isFinite(Date.parse(d.updatedAt))) throw new Error('Invalid record dates.');
    ids.add(d.id);
  }
  return payload.decisions.map(d => ({ id: d.id, title: d.title, rationale: d.rationale, project: d.project,
    status: d.status, source: d.source, createdAt: d.createdAt, updatedAt: d.updatedAt }));
}

export function exportData(decisions) {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), decisions }, null, 2);
}

export function summarize(decisions) {
  return Object.fromEntries(STATUSES.map(s => [s, decisions.filter(d => d.status === s).length]));
}
