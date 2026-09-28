# Catalogue data schema

The site reads `dist/data/catalogue.json`. All visible counts are calculated from this file; the interface does not insert example records or hard-code corpus totals.

## Top-level structure

```json
{
  "meta": {},
  "research": [],
  "resources": [],
  "surveys": [],
  "codebook": {},
  "validation": {}
}
```

`meta` records the search cutoff, data revision, schema version, primary-corpus size, and a short method note. `codebook` preserves the exact lifecycle, property, mechanism, relation, and T/M/E labels used in the manuscript. `validation` stores reconciled totals and machine-checkable invariants.

## Research records

The `research` collection combines three auditable subgroups without conflating their counts:

- `collection_group: "primary"` — included studies counted in the primary corpus;
- `collection_group: "adjacent_screened"` — full-text records retained to audit the inclusion boundary; and
- `collection_group: "related_background"` — relevant background literature not counted as a primary study.

Core fields include `id`, `citekey`, `title`, `authors`, `year`, `publication_period`, `venue_status`, `publication_status`, `research_type`, `coding_agent_scope`, `lifecycle_stage`, `primary_property`, `secondary_properties`, `specific_concern`, `primary_mechanism_code`, `primary_mechanism_family`, `trustworthiness_contribution`, `evaluation_setting`, `metrics_evidence`, `relation_code`, `relation`, `source_url`, and verified `bibtex` where available.

## Evaluation-resource records

The `resources` collection keeps benchmark, dataset, trajectory, metric, and closely related evaluation records separate from trustworthiness interventions. Fields include `resource_type`, `scope`, `supported_task`, `scale`, `oracle_observable`, `trustworthiness_role`, `main_contribution`, bibliographic metadata, and the source URL.

## Related-survey records

The `surveys` collection records each survey's `system_boundary`, `organizing_lens`, and a `tme` object with three comparison fields:

- `taxonomy_coverage` (T): a dedicated taxonomy of coding-agent trustworthiness;
- `mechanism_coverage` (M): systematic extraction, comparison, and quantification of trustworthiness mechanisms; and
- `evidence_coverage` (E): mapping of benchmark tasks, observables, oracles, and metrics to trustworthiness claims.

The `tme` keys are `taxonomy`, `mechanisms`, and `evidence`. Coverage values are `systematic`, `partial`, `none`, or `not_assessed`; the longer comparison text is retained in `main_distinction`.

## Data rules

- Keep titles and bibliographic metadata aligned with the verified canonical version.
- Use the manuscript's exact lifecycle, property, mechanism, relation, and collection labels.
- Keep primary, adjacent, background, resource, and survey collections distinguishable at record level.
- Provide `bibtex` only when a verified entry is available. BibTeX export reports omissions instead of synthesizing citations.
- Re-run and retain the validation invariants whenever records or classifications change.
