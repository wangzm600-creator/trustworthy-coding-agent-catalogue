# Trustworthy Coding Agents

[Browse the study catalogue](https://wangzm600-creator.github.io/trustworthy-coding-agent-catalogue/)

## About the survey

This repository accompanies our survey of the trustworthiness of LLM-based coding agents, covering both their development actions and the software they produce.

The survey organizes studies by software-development activity and trustworthiness property. This lifecycle perspective helps identify where concerns arise, which mechanisms address them, and what evidence supports the reported conclusions. We also examine benchmark tasks, observations, judgment criteria, and metrics to clarify which trustworthiness claims their results can support. The findings inform research directions for evaluation, execution control, privacy and fairness, and post-deployment accountability.

The catalogue provides searchable study records, filters for lifecycle stages and trustworthiness properties, bibliographic information, and downloadable data.

## Collections

- **344 primary studies**
- **842 adjacent and background records**
- **117 benchmarks and evaluation resources**
- **32 related surveys**

Adjacent and background records, evaluation resources, and surveys are maintained separately from the primary-study analysis.

## Search cutoff and data

The eligibility cutoff is **30 September 2026**, based on report availability or publicly verifiable acceptance. This cutoff is distinct from later metadata corrections and catalogue updates.

The website reads `data/catalogue.json`. The `data/` directory also contains collection CSVs, a spreadsheet, and classification records. Older date-stamped files represent earlier snapshots.

## Contact

For questions, corrections, or suggestions, contact [wangzm600@gmail.com](mailto:wangzm600@gmail.com).

## Local preview

From the repository root, run:

```sh
python -m http.server 8000
```

Then open [http://localhost:8000/](http://localhost:8000/). The site consists of static files and requires no build step.
