# Trustworthy Coding Agents — Study Catalogue

This repository contains the public study catalogue accompanying our review of coding-agent trustworthiness. The site supports full-text search, field-level filters, stable query URLs, record inspection, and filtered downloads.

## Collections

- **Primary studies:** 188 studies used in the lifecycle–property analysis.
- **Screened and background records:** 27 adjacent studies retained from screening and 38 background records used in scope and related-work analysis.
- **Benchmarks and resources:** 65 benchmark, dataset, and trajectory resources.
- **Related surveys:** 17 surveys, including the studies used in the survey-comparison table.

The collections are kept separate in both the interface and the downloadable files.

## Data files

The `data/` directory contains the complete JSON catalogue, collection-specific CSV files, a field schema, a validation summary, and the full Excel workbook. `DATA_RECONCILIATION.md` records the corrections made before publication.

The primary-corpus checks reproduce the manuscript totals for corpus size, publication year and period, lifecycle stage, trustworthiness property, research relation, publication status, and mechanism family.

## Running locally

Serve the repository root with any static web server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. Opening `index.html` directly is not supported because browsers restrict local JSON requests.

## GitHub Pages

The repository is a static site and requires no build step. In the repository settings, select **Pages → Deploy from a branch → main → /(root)**. The empty `.nojekyll` marker prevents Jekyll processing.

Data revision: 28 September 2026. Search cutoff: 21 July 2026.
