import { makeDecision, assertImport, exportData, summarize, STATUSES } from './src/core.js';
const KEY = 'ignoremuses.decision-ledger.v1';
const $ = id => document.getElementById(id);
let decisions = [];
let storageAvailable = true;
try { const raw = localStorage.getItem(KEY); if (raw) decisions = assertImport(JSON.parse(raw)); }
catch (error) { storageAvailable = false; showNotice('Could not load browser storage. Export any decisions before closing the page.'); }

function showNotice(message) {
  let el = $('notice');
  if (!el) { el = document.createElement('p'); el.id = 'notice'; el.className = 'notice'; document.querySelector('header').append(el); }
  el.textContent = message;
}
function persist() {
  try { localStorage.setItem(KEY, exportData(decisions)); storageAvailable = true; }
  catch { storageAvailable = false; showNotice('Browser storage unavailable or full. Export JSON to preserve your decisions.'); }
}
function render() {
  const counts = summarize(decisions);
  $('total').textContent = String(decisions.length);
  $('approved').textContent = String(counts.approved);
  $('proposed').textContent = String(counts.proposed);
  $('rejected').textContent = String(counts.rejected);
  const query = $('search').value.trim().toLowerCase();
  const status = $('filter').value;
  const visible = decisions.filter(d => (status === 'all' || d.status === status) &&
    [d.title, d.project, d.rationale, d.source].join(' ').toLowerCase().includes(query));
  const list = $('list'); list.replaceChildren();
  if (!visible.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No matching decisions. Add one to start your project log.'; list.append(p); return; }
  for (const d of [...visible].reverse()) {
    const card = document.createElement('article'); card.className = 'decision';
    const top = document.createElement('div'); top.className = 'decision-top';
    const h = document.createElement('h3'); h.textContent = d.title;
    const tag = document.createElement('span'); tag.className = 'tag ' + d.status; tag.textContent = d.status;
    top.append(h, tag);
    const meta = document.createElement('p'); meta.className = 'muted meta'; meta.textContent = `${d.project || 'General'} · ${d.source} · ${new Date(d.createdAt).toLocaleDateString()}`;
    const reason = document.createElement('p'); reason.className = 'reason'; reason.textContent = d.rationale || 'No rationale recorded.';
    const actions = document.createElement('div'); actions.className = 'card-actions';
    const select = document.createElement('select'); select.setAttribute('aria-label', `Status of ${d.title}`);
    for (const value of STATUSES) { const opt = document.createElement('option'); opt.value = value; opt.textContent = value; select.append(opt); }
    select.value = d.status;
    select.addEventListener('change', () => {
      // Any change to an approved decision is explicitly made by the person controlling this browser.
      d.status = select.value; d.updatedAt = new Date().toISOString(); persist(); render();
    });
    const del = document.createElement('button'); del.type = 'button'; del.className = 'delete'; del.textContent = 'Delete';
    del.addEventListener('click', () => { if (!confirm(`Delete “${d.title}”? This cannot be undone.`)) return; decisions = decisions.filter(x => x.id !== d.id); persist(); render(); });
    actions.append(select, del); card.append(top, meta, reason, actions); list.append(card);
  }
}
$('form').addEventListener('submit', e => {
  e.preventDefault();
  try {
    const d = makeDecision({ title: $('title').value, project: $('project').value, source: $('source').value,
      status: $('status').value, rationale: $('rationale').value });
    decisions.push(d); persist(); $('form').reset(); render();
  } catch (err) { showNotice(err.message); }
});
$('search').addEventListener('input', render);
$('filter').addEventListener('change', render);
$('export').addEventListener('click', () => {
  const blob = new Blob([exportData(decisions)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url;
  link.download = `decision-ledger-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 500);
});
$('import').addEventListener('change', async e => {
  const file = e.target.files?.[0]; if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Import file exceeds 5 MB.');
    const imported = assertImport(JSON.parse(await file.text()));
    if (!confirm(`Replace ${decisions.length} current decisions with ${imported.length} imported decisions? Export a backup first.`)) return;
    decisions = imported; persist(); render(); showNotice(`Imported ${imported.length} decisions.`);
  } catch (error) { showNotice('Import failed: ' + error.message); }
  finally { e.target.value = ''; }
});
render();
