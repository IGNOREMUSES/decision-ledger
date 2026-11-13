# Decision Ledger

An offline-first decision log for projects. Created by **IGNOREMUSES**.

Keep approved decisions separate from proposals, rejected ideas and superseded choices. Capture attribution, rationale and project context. Built for AI-assisted engineering, product design and software teams.

## Features
- Record decisions with explicit status (`proposed`, `approved`, `rejected`, `superseded`) and source.
- Search and filter decisions; view status counts.
- Browser-local storage, with JSON export/import. No accounts, tracking or backend.
- Responsive interface and no runtime dependencies.

## Run
Serve the repository folder with `python -m http.server 8080` and open http://localhost:8080. Opening `index.html` via `file://` may not work because ES modules are used.

## Test
Install Node.js 20+ and run `npm test`.

## Privacy and limitations
Data stays in the current browser profile and is not encrypted or synchronized. Export backups regularly. JSON import replaces current records after confirmation. Source attribution is self-reported, not a verified authorization system. Do not store secrets.

## License
MIT.
