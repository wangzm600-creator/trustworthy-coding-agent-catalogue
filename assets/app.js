(() => {
  "use strict";

  const PAGE_SIZE = 30;
  const COLLECTIONS = {
    primary: {
      label: "Primary studies",
      sourceKeys: ["primaryStudies", "primary", "studies", "research"],
      note: "Studies included in the lifecycle–property analysis.",
      filters: [
        { key: "year", label: "Year", param: "year", values: record => scalar(record.year) },
        { key: "lifecycle", label: "Primary lifecycle stage", param: "stage", values: record => scalar(primaryValue(record.lifecycle || record.lifecycleStage || record.lifecycle_stage)) },
        { key: "property", label: "Primary property", param: "property", values: record => scalar(primaryValue(record.properties || record.property || record.primary_property)) },
        { key: "relation", label: "Trustworthiness relation", param: "relation", values: record => scalar(record.relation || record.trustworthinessRelation) },
        { key: "mechanisms", label: "Mechanism", param: "mechanism", values: record => list(record.mechanisms || record.mechanism || record.primary_mechanism_family) },
        { key: "status", label: "Publication status", param: "status", values: record => scalar(record.status || record.publicationStatus || record.publication_status) },
        { key: "venue", label: "Venue", param: "venue", values: record => scalar(record.venue) }
      ],
      columns: [
        { key: "title", label: "Study" },
        { key: "year", label: "Year" },
        { key: "lifecycle", label: "Lifecycle stage" },
        { key: "property", label: "Property" },
        { key: "relation", label: "Relation" },
        { key: "mechanism", label: "Mechanism" },
        { key: "details", label: "Record" }
      ]
    },
    screened: {
      label: "Screened & background",
      sourceKeys: [],
      note: "Adjacent and background records retained during screening and related-work analysis.",
      filters: [
        { key: "subgroup", label: "Record group", param: "group", values: record => scalar(researchGroup(record)) },
        { key: "year", label: "Year", param: "year", values: record => scalar(record.year) },
        { key: "lifecycle", label: "Lifecycle stage", param: "stage", values: record => scalar(primaryValue(record.lifecycle || record.lifecycleStage || record.lifecycle_stage)) },
        { key: "property", label: "Trustworthiness property", param: "property", values: record => scalar(primaryValue(record.properties || record.property || record.primary_property)) },
        { key: "relation", label: "Relation", param: "relation", values: record => scalar(record.relation || record.trustworthinessRelation) },
        { key: "status", label: "Publication status", param: "status", values: record => scalar(record.status || record.publicationStatus || record.publication_status) },
        { key: "venue", label: "Venue", param: "venue", values: record => scalar(record.venue) }
      ],
      columns: [
        { key: "title", label: "Study" },
        { key: "year", label: "Year" },
        { key: "subgroup", label: "Record group" },
        { key: "lifecycle", label: "Lifecycle stage" },
        { key: "property", label: "Property" },
        { key: "relation", label: "Relation" },
        { key: "details", label: "Record" }
      ]
    },
    benchmarks: {
      label: "Benchmarks & resources",
      sourceKeys: ["benchmarks", "resources", "evaluationResources"],
      note: "Benchmarks, datasets, and trajectory resources are listed separately from the primary research corpus.",
      filters: [
        { key: "type", label: "Resource type", param: "type", values: record => scalar(record.type || record.resourceType || record.resource_type) },
        { key: "year", label: "Year", param: "year", values: record => scalar(record.year) },
        { key: "taskLevel", label: "Task or scope", param: "task", values: record => scalar(record.taskLevel || record.task_level || record.supported_task || record.scope) },
        { key: "lifecycle", label: "Lifecycle coverage", param: "stage", values: record => list(record.lifecycle || record.lifecycleStages) },
        { key: "properties", label: "Trustworthiness property", param: "property", values: record => list(record.properties || record.trustworthinessProperties) },
        { key: "oracle", label: "Observable or oracle", param: "oracle", values: record => list(record.oracles || record.oracle || record.oracle_observable) },
        { key: "venue", label: "Venue", param: "venue", values: record => scalar(record.venue) }
      ],
      columns: [
        { key: "title", label: "Resource" },
        { key: "year", label: "Year" },
        { key: "type", label: "Type" },
        { key: "taskLevel", label: "Task or scope" },
        { key: "properties", label: "Trustworthiness role" },
        { key: "oracles", label: "Oracle / evidence" },
        { key: "details", label: "Record" }
      ]
    },
    surveys: {
      label: "Related surveys",
      sourceKeys: ["surveys", "relatedSurveys"],
      note: "T/M/E summarize coverage of taxonomy, mechanisms, and benchmark evidence: systematic, partial, not covered, or not assessed.",
      filters: [
        { key: "year", label: "Year", param: "year", values: record => scalar(record.year) },
        { key: "scope", label: "Primary scope", param: "scope", values: record => scalar(record.scope || record.primaryScope || record.system_boundary) },
        { key: "lens", label: "Organizing lens", param: "lens", values: record => scalar(record.lens || record.organizingLens || record.organizing_lens) },
        { key: "taxonomy", label: "T — taxonomy", param: "t", values: record => scalar(tmeValue(record, "taxonomy")) },
        { key: "mechanisms", label: "M — mechanisms", param: "m", values: record => scalar(tmeValue(record, "mechanisms")) },
        { key: "evidence", label: "E — benchmark evidence", param: "e", values: record => scalar(tmeValue(record, "evidence")) }
      ],
      columns: [
        { key: "title", label: "Survey" },
        { key: "year", label: "Year" },
        { key: "scope", label: "Primary scope" },
        { key: "lens", label: "Organizing lens" },
        { key: "tme", label: "T / M / E" },
        { key: "details", label: "Record" }
      ]
    }
  };

  const state = {
    data: { meta: {}, primary: [], benchmarks: [], surveys: [] },
    collection: "primary",
    search: "",
    filters: {},
    sort: "year-desc",
    page: 1,
    lastFocus: null
  };

  const elements = {
    methodButton: document.getElementById("method-button"),
    methodPanel: document.getElementById("method-panel"),
    methodCopy: document.getElementById("method-copy"),
    methodDetails: document.getElementById("method-details"),
    repositoryLink: document.getElementById("repository-link"),
    tabs: [...document.querySelectorAll(".collection-tab")],
    panel: document.getElementById("catalogue-panel"),
    search: document.getElementById("search-input"),
    filters: document.getElementById("dynamic-filters"),
    clear: document.getElementById("clear-filters"),
    sort: document.getElementById("sort-select"),
    count: document.getElementById("result-count"),
    note: document.getElementById("collection-note"),
    activeFilters: document.getElementById("active-filters"),
    status: document.getElementById("status-panel"),
    tableWrap: document.getElementById("table-wrap"),
    head: document.getElementById("result-head"),
    body: document.getElementById("result-body"),
    pagination: document.getElementById("pagination"),
    footerVersion: document.getElementById("footer-version"),
    drawer: document.getElementById("detail-drawer"),
    drawerBackdrop: document.getElementById("drawer-backdrop"),
    drawerClose: document.getElementById("drawer-close"),
    drawerKicker: document.getElementById("drawer-kicker"),
    drawerContent: document.getElementById("drawer-content"),
    downloadMenu: document.querySelector(".download-menu")
  };

  document.addEventListener("DOMContentLoaded", initialize);

  async function initialize() {
    bindStaticEvents();
    readUrlState();
    try {
      const response = await fetch("data/catalogue.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
      const raw = await response.json();
      state.data = normalizeDataset(raw);
      renderMetadata();
      setTab(state.collection, { reset: false, updateUrl: false });
      const requestedRecord = new URLSearchParams(window.location.search).get("record");
      if (requestedRecord) {
        const record = currentRecords().find(item => recordId(item) === requestedRecord);
        if (record) openDrawer(record, null, false);
      }
    } catch (error) {
      console.error(error);
      showStatus("Catalogue unavailable", "The published data file could not be read. Please try again or download the dataset directly.", "error");
      elements.count.textContent = "Records unavailable";
      elements.note.textContent = "";
    }
  }

  function bindStaticEvents() {
    elements.methodButton.addEventListener("click", () => {
      const expanded = elements.methodButton.getAttribute("aria-expanded") === "true";
      elements.methodButton.setAttribute("aria-expanded", String(!expanded));
      elements.methodPanel.classList.toggle("is-hidden", expanded);
    });

    elements.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => setTab(tab.dataset.collection));
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowLeft") next = (index - 1 + elements.tabs.length) % elements.tabs.length;
        if (event.key === "ArrowRight") next = (index + 1) % elements.tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = elements.tabs.length - 1;
        elements.tabs[next].focus();
        setTab(elements.tabs[next].dataset.collection);
      });
    });

    elements.search.addEventListener("input", () => {
      state.search = elements.search.value.trim();
      state.page = 1;
      renderFilters();
      renderResults();
    });

    elements.sort.addEventListener("change", () => {
      state.sort = elements.sort.value;
      state.page = 1;
      renderResults();
    });

    elements.clear.addEventListener("click", () => {
      state.search = "";
      state.filters = {};
      state.page = 1;
      elements.search.value = "";
      renderFilters();
      renderResults();
    });

    document.querySelectorAll("[data-download]").forEach(button => {
      button.addEventListener("click", () => {
        downloadFiltered(button.dataset.download);
        elements.downloadMenu.open = false;
      });
    });

    elements.drawerClose.addEventListener("click", closeDrawer);
    elements.drawerBackdrop.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", event => {
      if (!elements.drawer.classList.contains("is-open")) return;
      if (event.key === "Escape") closeDrawer();
      if (event.key === "Tab") trapDrawerFocus(event);
    });
  }

  function normalizeDataset(raw) {
    const safe = raw && typeof raw === "object" ? raw : {};
    const research = findArray(safe, COLLECTIONS.primary.sourceKeys);
    return {
      meta: safe.meta && typeof safe.meta === "object" ? safe.meta : {},
      primary: research.filter(record => researchGroup(record) === "included"),
      screened: research.filter(record => researchGroup(record) !== "included"),
      benchmarks: findArray(safe, COLLECTIONS.benchmarks.sourceKeys),
      surveys: findArray(safe, COLLECTIONS.surveys.sourceKeys),
      codebook: safe.codebook && typeof safe.codebook === "object" ? safe.codebook : {},
      validation: safe.validation && typeof safe.validation === "object" ? safe.validation : {}
    };
  }

  function findArray(source, keys) {
    for (const key of keys) if (Array.isArray(source[key])) return source[key];
    return [];
  }

  function renderMetadata() {
    const meta = state.data.meta;
    const updated = meta.updated || meta.data_revision;
    const cutoff = meta.cutoff || meta.search_cutoff;
    const version = meta.version || (meta.schema_version ? `Data schema ${meta.schema_version}` : "");
    elements.footerVersion.textContent = [version, updated ? `Updated ${formatDate(updated)}` : ""].filter(Boolean).join(" · ");
    elements.methodCopy.textContent = meta.methodNote || meta.method_note || "The catalogue preserves the survey's collection boundaries and coded fields. Counts shown here are calculated directly from the published records.";
    elements.methodDetails.replaceChildren();
    addDefinition(elements.methodDetails, "Primary studies", number(state.data.primary.length));
    addDefinition(elements.methodDetails, "Screened & background", number(state.data.screened.length));
    addDefinition(elements.methodDetails, "Resources", number(state.data.benchmarks.length));
    addDefinition(elements.methodDetails, "Related surveys", number(state.data.surveys.length));
    if (state.data.validation.all_invariants_pass === true) addDefinition(elements.methodDetails, "Count checks", "Passed");
    if (cutoff) addDefinition(elements.methodDetails, "Search cutoff", formatDate(cutoff));
    const repositoryUrl = meta.repositoryUrl || meta.repository_url;
    if (validUrl(repositoryUrl)) {
      elements.repositoryLink.href = repositoryUrl;
      elements.repositoryLink.classList.remove("is-hidden");
    }
    document.getElementById("count-primary").textContent = number(state.data.primary.length);
    document.getElementById("count-screened").textContent = number(state.data.screened.length);
    document.getElementById("count-benchmarks").textContent = number(state.data.benchmarks.length);
    document.getElementById("count-surveys").textContent = number(state.data.surveys.length);
  }

  function addDefinition(container, term, description) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = description;
    container.append(dt, dd);
  }

  function setTab(collection, options = {}) {
    if (!COLLECTIONS[collection]) collection = "primary";
    state.collection = collection;
    if (options.reset !== false) {
      state.filters = {};
      state.page = 1;
    }
    elements.tabs.forEach(tab => {
      const active = tab.dataset.collection === collection;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const activeTab = elements.tabs.find(tab => tab.dataset.collection === collection);
    elements.panel.setAttribute("aria-labelledby", activeTab.id);
    elements.note.textContent = COLLECTIONS[collection].note;
    elements.search.value = state.search;
    renderFilters();
    renderResults(options.updateUrl !== false);
  }

  function renderFilters() {
    elements.filters.replaceChildren();
    const compact = window.matchMedia("(max-width: 700px)").matches;
    for (const filter of currentConfig().filters) {
      const records = currentRecords().filter(record => matchesSearch(record) && matchesFilters(record, filter.key));
      const counts = new Map();
      records.forEach(record => {
        unique(filter.values(record)).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
      });
      if (state.filters[filter.key]) [...state.filters[filter.key]].forEach(value => {
        if (!counts.has(value)) counts.set(value, 0);
      });
      if (!counts.size) continue;
      const group = document.createElement("section");
      group.className = "filter-group";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-group-title";
      const collapseByDefault = compact || counts.size > 12;
      button.setAttribute("aria-expanded", String(!collapseByDefault));
      const optionId = `filter-${state.collection}-${filter.key}`;
      button.setAttribute("aria-controls", optionId);
      button.textContent = filter.label;
      const options = document.createElement("div");
      options.className = "filter-options";
      options.classList.toggle("is-collapsed", collapseByDefault);
      options.id = optionId;
      sortFacetValues([...counts.keys()], filter.key).forEach(value => {
        const label = document.createElement("label");
        label.className = "check-option";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = hasFilter(filter.key, value);
        input.addEventListener("change", () => toggleFilter(filter.key, value, input.checked));
        const text = document.createElement("span");
        text.textContent = displayValue(value);
        const count = document.createElement("span");
        count.className = "facet-count";
        count.textContent = number(counts.get(value));
        label.append(input, text, count);
        options.append(label);
      });
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        options.classList.toggle("is-collapsed", expanded);
      });
      group.append(button, options);
      elements.filters.append(group);
    }
  }

  function sortFacetValues(values, key) {
    if (key === "year") return values.sort((a, b) => Number(b) - Number(a));
    const order = { included: 0, adjacent: 1, background: 2, direct: 0, enabling: 1, yes: 0, partial: 1, no: 2 };
    return values.sort((a, b) => {
      const ai = order[String(a).toLowerCase()];
      const bi = order[String(b).toLowerCase()];
      if (ai !== undefined || bi !== undefined) return (ai ?? 99) - (bi ?? 99);
      return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
    });
  }

  function toggleFilter(key, value, checked) {
    const selected = state.filters[key] || new Set();
    if (checked) selected.add(value); else selected.delete(value);
    if (selected.size) state.filters[key] = selected; else delete state.filters[key];
    state.page = 1;
    renderFilters();
    renderResults();
  }

  function hasFilter(key, value) {
    return state.filters[key] instanceof Set && state.filters[key].has(value);
  }

  function renderResults(updateUrl = true) {
    const records = getFilteredRecords();
    const total = currentRecords().length;
    const pages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageRecords = records.slice(start, start + PAGE_SIZE);
    const noun = { primary: "studies", screened: "records", benchmarks: "resources", surveys: "surveys" }[state.collection] || "records";
    elements.count.textContent = records.length === total
      ? `${number(total)} ${noun}`
      : `${number(records.length)} of ${number(total)} ${noun}`;
    renderActiveFilters();
    renderTable(pageRecords);
    renderPagination(records.length);
    if (updateUrl) writeUrlState();
  }

  function getFilteredRecords() {
    return currentRecords()
      .filter(matchesSearch)
      .filter(record => matchesFilters(record))
      .sort(recordSorter(state.sort));
  }

  function matchesSearch(record) {
    const query = normalizeText(state.search);
    return !query || searchText(record).includes(query);
  }

  function matchesFilters(record, excludeKey = "") {
    return currentConfig().filters.every(filter => {
      if (filter.key === excludeKey) return true;
      const selected = state.filters[filter.key];
      if (!(selected instanceof Set) || !selected.size) return true;
      return filter.values(record).some(value => selected.has(value));
    });
  }

  function searchText(record) {
    const parts = [];
    const collect = value => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) return value.forEach(collect);
      if (typeof value === "object") return Object.values(value).forEach(collect);
      parts.push(String(value));
    };
    collect(record);
    return normalizeText(parts.join(" "));
  }

  function recordSorter(sort) {
    const title = record => String(record.title || "");
    const venue = record => String(record.venue || "");
    const year = record => Number(record.year) || 0;
    if (sort === "year-asc") return (a, b) => year(a) - year(b) || title(a).localeCompare(title(b));
    if (sort === "title-asc") return (a, b) => title(a).localeCompare(title(b), undefined, { sensitivity: "base" });
    if (sort === "venue-asc") return (a, b) => venue(a).localeCompare(venue(b), undefined, { sensitivity: "base" }) || title(a).localeCompare(title(b));
    return (a, b) => year(b) - year(a) || title(a).localeCompare(title(b));
  }

  function renderActiveFilters() {
    elements.activeFilters.replaceChildren();
    if (state.search) addFilterChip(`Search: ${state.search}`, () => {
      state.search = "";
      elements.search.value = "";
      state.page = 1;
      renderResults();
    });
    const labels = Object.fromEntries(currentConfig().filters.map(item => [item.key, item.label]));
    Object.entries(state.filters).forEach(([key, values]) => {
      [...values].forEach(value => addFilterChip(`${labels[key] || key}: ${displayValue(value)}`, () => {
        values.delete(value);
        if (!values.size) delete state.filters[key];
        state.page = 1;
        renderFilters();
        renderResults();
      }));
    });
  }

  function addFilterChip(label, remove) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.setAttribute("aria-label", `Remove ${label} filter`);
    button.append(document.createTextNode(label), document.createTextNode(" ×"));
    button.addEventListener("click", remove);
    elements.activeFilters.append(button);
  }

  function renderTable(records) {
    elements.head.replaceChildren();
    elements.body.replaceChildren();
    if (!records.length) {
      elements.tableWrap.classList.add("is-hidden");
      showStatus(currentRecords().length ? "No matching records" : "No published records yet", currentRecords().length ? "Remove a filter or try a broader search." : "The audited records have not yet been inserted into this collection.", "empty");
      return;
    }
    elements.status.classList.add("is-hidden");
    elements.tableWrap.classList.remove("is-hidden");
    const row = document.createElement("tr");
    currentConfig().columns.forEach(column => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = column.label;
      row.append(th);
    });
    elements.head.append(row);
    records.forEach(record => elements.body.append(renderRecordRow(record)));
  }

  function renderRecordRow(record) {
    const tr = document.createElement("tr");
    currentConfig().columns.forEach(column => {
      const td = document.createElement("td");
      td.dataset.label = column.label;
      td.append(renderCell(record, column.key));
      tr.append(td);
    });
    return tr;
  }

  function renderCell(record, key) {
    if (key === "title") {
      const container = document.createElement("div");
      const sourceUrl = record.url || record.source_url;
      const title = validUrl(sourceUrl) ? document.createElement("a") : document.createElement("span");
      title.className = "record-title";
      title.textContent = record.title || "Untitled record";
      if (title.tagName === "A") {
        title.href = sourceUrl;
        title.target = "_blank";
        title.rel = "noreferrer";
      }
      const authors = document.createElement("p");
      authors.className = "record-authors";
      authors.textContent = authorText(record.authors);
      container.append(title);
      if (authors.textContent) container.append(authors);
      return container;
    }
    if (key === "year") return textNode(record.year || "—");
    if (key === "subgroup") return textNode(displayValue(researchGroup(record)));
    if (key === "lifecycle") return tagSet(list(record.lifecycle || record.lifecycleStages || record.lifecycleStage || record.lifecycle_stage), true);
    if (key === "property") return tagSet(list(record.properties || record.property || record.primary_property), true);
    if (key === "properties") {
      if (record.trustworthiness_role) return clampedText(record.trustworthiness_role);
      return tagSet(list(record.properties || record.trustworthinessProperties), true);
    }
    if (key === "relation") return tagSet(scalar(record.relation || record.trustworthinessRelation), true);
    if (key === "mechanism") return tagSet(list(record.mechanisms || record.mechanism || record.primary_mechanism_family));
    if (key === "type") return textNode(record.type || record.resourceType || record.resource_type || "—");
    if (key === "taskLevel") return textNode(record.taskLevel || record.task_level || record.supported_task || record.scope || "—");
    if (key === "oracles") return tagSet(list(record.oracles || record.oracle || record.observables || record.oracle_observable));
    if (key === "scope") return textNode(record.scope || record.primaryScope || record.system_boundary || "—");
    if (key === "lens") return textNode(record.lens || record.organizingLens || record.organizing_lens || "—");
    if (key === "tme") return coverageSet(record);
    if (key === "details") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "details-button";
      button.textContent = "View details";
      button.addEventListener("click", event => openDrawer(record, event.currentTarget));
      return button;
    }
    return textNode(record[key] || "—");
  }

  function tagSet(values, highlightFirst = false) {
    const wrap = document.createElement("div");
    wrap.className = "tag-list";
    const resolved = Array.isArray(values) ? values : scalar(values);
    resolved.forEach((value, index) => {
      const tag = document.createElement("span");
      tag.className = `tag${highlightFirst && index === 0 ? " tag-primary" : ""}`;
      tag.textContent = displayValue(value);
      wrap.append(tag);
    });
    if (!resolved.length) wrap.append(textNode("—"));
    return wrap;
  }

  function coverageSet(record) {
    const wrap = document.createElement("div");
    wrap.className = "coverage-set";
    [["T", "taxonomy"], ["M", "mechanisms"], ["E", "evidence"]].forEach(([short, key]) => {
      const value = normalizeCoverage(tmeValue(record, key));
      const mark = document.createElement("span");
      mark.className = `coverage-mark coverage-${value}`;
      mark.textContent = short;
      mark.title = `${short}: ${displayValue(value)}`;
      mark.setAttribute("aria-label", `${short}: ${displayValue(value)}`);
      wrap.append(mark);
    });
    return wrap;
  }

  function clampedText(value) {
    const span = document.createElement("span");
    span.className = "cell-clamp";
    span.textContent = String(value || "—");
    span.title = String(value || "");
    return span;
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / PAGE_SIZE);
    elements.pagination.replaceChildren();
    elements.pagination.classList.toggle("is-hidden", pages <= 1);
    if (pages <= 1) return;
    elements.pagination.append(pageButton("Previous", state.page - 1, state.page === 1));
    pageWindow(state.page, pages).forEach(value => {
      if (value === "…") {
        const span = document.createElement("span");
        span.textContent = "…";
        span.setAttribute("aria-hidden", "true");
        elements.pagination.append(span);
      } else {
        const button = pageButton(String(value), value, false);
        if (value === state.page) button.setAttribute("aria-current", "page");
        elements.pagination.append(button);
      }
    });
    elements.pagination.append(pageButton("Next", state.page + 1, state.page === pages));
  }

  function pageButton(label, page, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", () => {
      state.page = page;
      renderResults();
      document.getElementById("results").focus({ preventScroll: true });
      document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  }

  function pageWindow(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const values = new Set([1, total, current - 1, current, current + 1]);
    const valid = [...values].filter(value => value >= 1 && value <= total).sort((a, b) => a - b);
    const result = [];
    valid.forEach((value, index) => {
      if (index && value - valid[index - 1] > 1) result.push("…");
      result.push(value);
    });
    return result;
  }

  function openDrawer(record, trigger, updateUrl = true) {
    state.lastFocus = trigger || document.activeElement;
    elements.drawerKicker.textContent = COLLECTIONS[state.collection].label;
    elements.drawerContent.replaceChildren();
    const title = document.createElement("h2");
    title.id = "drawer-title";
    title.textContent = record.title || "Untitled record";
    const citation = document.createElement("p");
    citation.className = "drawer-citation";
    citation.textContent = [authorText(record.authors), record.year, record.venue].filter(Boolean).join(" · ");
    const actions = document.createElement("div");
    actions.className = "drawer-actions";
    const sourceUrl = record.url || record.source_url;
    if (validUrl(sourceUrl)) actions.append(linkButton("Open publication", sourceUrl));
    if (record.doi) actions.append(linkButton("Open DOI", doiUrl(record.doi)));
    const dl = document.createElement("dl");
    dl.className = "detail-grid";
    detailEntries(record).forEach(([label, value]) => {
      const values = formatDetail(value);
      if (!values) return;
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = values;
      dl.append(dt, dd);
    });
    elements.drawerContent.append(title);
    if (citation.textContent) elements.drawerContent.append(citation);
    if (actions.childNodes.length) elements.drawerContent.append(actions);
    elements.drawerContent.append(dl);
    if (record.notes || record.note) {
      const note = document.createElement("section");
      note.className = "drawer-note";
      const heading = document.createElement("h3");
      heading.textContent = "Coding note";
      const copy = document.createElement("p");
      copy.textContent = record.notes || record.note;
      note.append(heading, copy);
      elements.drawerContent.append(note);
    }
    elements.drawer.classList.add("is-open");
    elements.drawer.setAttribute("aria-hidden", "false");
    elements.drawerBackdrop.classList.remove("is-hidden");
    elements.drawerBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    elements.drawerClose.focus();
    if (updateUrl) writeUrlState(recordId(record));
  }

  function closeDrawer() {
    elements.drawer.classList.remove("is-open");
    elements.drawer.setAttribute("aria-hidden", "true");
    elements.drawerBackdrop.classList.add("is-hidden");
    elements.drawerBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    writeUrlState();
    if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function trapDrawerFocus(event) {
    const focusable = [...elements.drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(item => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function detailEntries(record) {
    if (["primary", "screened"].includes(state.collection)) return [
      ["Record group", researchGroup(record)],
      ["Trustworthiness relation", record.relation || record.trustworthinessRelation],
      ["Task", record.task || record.seTask || record.coding_agent_scope],
      ["Primary lifecycle stage", primaryValue(record.lifecycle || record.lifecycleStage || record.lifecycle_stage)],
      ["Secondary lifecycle stages", secondaryValue(record.lifecycle || record.lifecycleStages)],
      ["Primary property", primaryValue(record.properties || record.property || record.primary_property)],
      ["Secondary properties", record.secondary_properties || secondaryValue(record.properties || record.trustworthinessProperties)],
      ["Mechanisms", record.mechanisms || record.mechanism || record.primary_mechanism_family],
      ["Evidence", record.evidence || record.metricsEvidence || record.metrics_evidence],
      ["Publication status", record.status || record.publicationStatus || record.publication_status],
      ["DOI", record.doi]
    ];
    if (state.collection === "benchmarks") return [
      ["Resource type", record.type || record.resourceType || record.resource_type],
      ["Task or scope", record.taskLevel || record.task_level || record.supported_task || record.scope],
      ["Lifecycle coverage", record.lifecycle || record.lifecycleStages],
      ["Trustworthiness role", record.properties || record.trustworthinessProperties || record.trustworthiness_role],
      ["Observables and oracles", record.observables || record.oracles || record.oracle || record.oracle_observable],
      ["Main contribution", record.main_contribution],
      ["Use in primary corpus", record.usedByPrimaryCount === undefined ? "" : `${record.usedByPrimaryCount} studies`],
      ["Publication status", record.status || record.publicationStatus || record.publication_status || record.venue_status],
      ["DOI", record.doi]
    ];
    return [
      ["Primary scope", record.scope || record.primaryScope || record.system_boundary],
      ["Organizing lens", record.lens || record.organizingLens || record.organizing_lens],
      ["T — taxonomy", displayValue(tmeValue(record, "taxonomy"))],
      ["M — mechanisms", displayValue(tmeValue(record, "mechanisms"))],
      ["E — benchmark evidence", displayValue(tmeValue(record, "evidence"))],
      ["Distinction", record.main_distinction],
      ["Publication status", record.status || record.publicationStatus || record.publication_status],
      ["DOI", record.doi]
    ];
  }

  function linkButton(label, href) {
    const link = document.createElement("a");
    link.className = "button button-primary";
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = label;
    return link;
  }

  function downloadFiltered(format) {
    const records = getFilteredRecords();
    const base = `trustworthy-coding-agent-${state.collection}-filtered`;
    if (format === "json") {
      downloadBlob(`${base}.json`, JSON.stringify({ collection: state.collection, filters: serializableFilters(), records }, null, 2), "application/json");
      return;
    }
    if (format === "bibtex") {
      const entries = records.filter(record => String(record.bibtex || "").trim()).map(record => String(record.bibtex).trim());
      const missing = records.filter(record => !String(record.bibtex || "").trim());
      const comments = missing.map(record => `% BibTeX unavailable in the audited record: ${singleLine(record.title || recordId(record))}`);
      const content = [...entries, ...comments].join("\n\n");
      downloadBlob(`${base}.bib`, content || "% No verified BibTeX entries are available for the current selection.\n", "application/x-bibtex");
      return;
    }
    const columns = exportColumns();
    const rows = [columns.map(column => csvCell(column.label)).join(",")];
    records.forEach(record => rows.push(columns.map(column => csvCell(formatDetail(column.value(record)))).join(",")));
    downloadBlob(`${base}.csv`, `\ufeff${rows.join("\r\n")}`, "text/csv;charset=utf-8");
  }

  function exportColumns() {
    const common = [
      { label: "ID", value: record => recordId(record) },
      { label: "Title", value: record => record.title },
      { label: "Authors", value: record => record.authors },
      { label: "Year", value: record => record.year },
      { label: "Venue", value: record => record.venue },
      { label: "Status", value: record => record.status || record.publicationStatus || record.publication_status || record.venue_status },
      { label: "URL", value: record => record.url || record.source_url },
      { label: "DOI", value: record => record.doi }
    ];
    if (["primary", "screened"].includes(state.collection)) return [...common,
      { label: "Record group", value: record => researchGroup(record) },
      { label: "Trustworthiness relation", value: record => record.relation || record.trustworthinessRelation },
      { label: "Task", value: record => record.task || record.seTask || record.coding_agent_scope },
      { label: "Primary lifecycle stage", value: record => primaryValue(record.lifecycle || record.lifecycleStage || record.lifecycle_stage) },
      { label: "Secondary lifecycle stages", value: record => secondaryValue(record.lifecycle || record.lifecycleStages) },
      { label: "Primary property", value: record => primaryValue(record.properties || record.property || record.primary_property) },
      { label: "Secondary properties", value: record => record.secondary_properties || secondaryValue(record.properties || record.trustworthinessProperties) },
      { label: "Mechanisms", value: record => record.mechanisms || record.mechanism || record.primary_mechanism_family },
      { label: "Evidence", value: record => record.evidence || record.metricsEvidence || record.metrics_evidence },
      { label: "Notes", value: record => record.notes || record.note }
    ];
    if (state.collection === "benchmarks") return [...common,
      { label: "Resource type", value: record => record.type || record.resourceType || record.resource_type },
      { label: "Task or scope", value: record => record.taskLevel || record.task_level || record.supported_task || record.scope },
      { label: "Lifecycle coverage", value: record => record.lifecycle || record.lifecycleStages },
      { label: "Trustworthiness role", value: record => record.properties || record.trustworthinessProperties || record.trustworthiness_role },
      { label: "Observables and oracles", value: record => record.observables || record.oracles || record.oracle || record.oracle_observable },
      { label: "Main contribution", value: record => record.main_contribution },
      { label: "Use in primary corpus", value: record => record.usedByPrimaryCount },
      { label: "Notes", value: record => record.notes || record.note }
    ];
    return [...common,
      { label: "Primary scope", value: record => record.scope || record.primaryScope || record.system_boundary },
      { label: "Organizing lens", value: record => record.lens || record.organizingLens || record.organizing_lens },
      { label: "T — taxonomy", value: record => tmeValue(record, "taxonomy") },
      { label: "M — mechanisms", value: record => tmeValue(record, "mechanisms") },
      { label: "E — benchmark evidence", value: record => tmeValue(record, "evidence") },
      { label: "Distinction", value: record => record.main_distinction },
      { label: "Notes", value: record => record.notes || record.note }
    ];
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const collection = params.get("collection");
    if (COLLECTIONS[collection]) state.collection = collection;
    state.search = params.get("q") || "";
    const sort = params.get("sort");
    if (["year-desc", "year-asc", "title-asc", "venue-asc"].includes(sort)) state.sort = sort;
    state.page = Math.max(1, Number(params.get("page")) || 1);
    const config = COLLECTIONS[state.collection];
    config.filters.forEach(filter => {
      const values = params.getAll(filter.param).flatMap(value => value.split("|")).filter(Boolean);
      if (values.length) state.filters[filter.key] = new Set(values);
    });
    elements.search.value = state.search;
    elements.sort.value = state.sort;
  }

  function writeUrlState(record) {
    const params = new URLSearchParams();
    if (state.collection !== "primary") params.set("collection", state.collection);
    if (state.search) params.set("q", state.search);
    if (state.sort !== "year-desc") params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    const config = currentConfig();
    Object.entries(state.filters).forEach(([key, values]) => {
      const filter = config.filters.find(item => item.key === key);
      if (!filter) return;
      [...values].forEach(value => params.append(filter.param, value));
    });
    if (record) params.set("record", record);
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }

  function serializableFilters() {
    return {
      search: state.search || null,
      sort: state.sort,
      facets: Object.fromEntries(Object.entries(state.filters).map(([key, values]) => [key, [...values]]))
    };
  }

  function showStatus(title, message, type) {
    elements.status.replaceChildren();
    if (type === "loading") {
      const mark = document.createElement("div");
      mark.className = "loading-mark";
      mark.setAttribute("aria-hidden", "true");
      elements.status.append(mark);
    }
    const content = document.createElement("div");
    const heading = document.createElement("h2");
    const copy = document.createElement("p");
    heading.textContent = title;
    copy.textContent = message;
    content.append(heading, copy);
    elements.status.append(content);
    elements.status.classList.remove("is-hidden");
    elements.tableWrap.classList.add("is-hidden");
    elements.pagination.classList.add("is-hidden");
  }

  function currentConfig() { return COLLECTIONS[state.collection]; }
  function currentRecords() { return state.data[state.collection] || []; }

  function scalar(value) {
    if (value === null || value === undefined || value === "") return [];
    if (Array.isArray(value)) return value.flatMap(scalar);
    if (typeof value === "object") return scalar(primaryValue(value));
    return [String(value).trim()].filter(Boolean);
  }

  function list(value) {
    if (value === null || value === undefined || value === "") return [];
    if (Array.isArray(value)) return unique(value.flatMap(list));
    if (typeof value === "object") {
      const primary = scalar(value.primary || value.main);
      const secondary = list(value.secondary || value.additional || []);
      return unique([...primary, ...secondary]);
    }
    return scalar(value);
  }

  function primaryValue(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value[0] || "";
    if (typeof value === "object") return value.primary || value.main || "";
    return value;
  }

  function secondaryValue(value) {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) return value.slice(1);
    if (typeof value === "object") return value.secondary || value.additional || [];
    return [];
  }

  function unique(values) { return [...new Set(values.filter(value => value !== null && value !== undefined && String(value).trim() !== "").map(value => String(value).trim()))]; }
  function authorText(authors) {
    if (Array.isArray(authors)) return authors.map(formatAuthor).filter(Boolean).join(", ");
    const value = String(authors || "").trim();
    if (!value) return "";
    return value.split(/\s+and\s+/i).map(formatAuthor).filter(Boolean).join(", ");
  }

  function formatAuthor(author) {
    const value = String(author || "").replace(/[{}]/g, "").trim();
    const parts = value.split(",").map(part => part.trim()).filter(Boolean);
    return parts.length === 2 ? `${parts[1]} ${parts[0]}` : value;
  }
  function textNode(value) { return document.createTextNode(String(value)); }
  function normalizeText(value) { return String(value || "").toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); }
  function displayValue(value) {
    const string = String(value || "");
    const known = { yes: "Systematic", partial: "Partial", no: "Not covered", not_assessed: "Not assessed", included: "Included", adjacent: "Adjacent", background: "Background", direct: "Direct", enabling: "Enabling" };
    return known[string.toLowerCase()] || string;
  }

  function tmeValue(record, key) {
    const tme = record.tme || record.coverage || {};
    const aliases = { taxonomy: ["taxonomy", "t"], mechanisms: ["mechanisms", "mechanism", "m"], evidence: ["evidence", "benchmarks", "benchmark", "e"] };
    for (const alias of aliases[key]) if (tme[alias] !== undefined) return normalizeCoverage(tme[alias]);
    const direct = { taxonomy: record.taxonomy_coverage, mechanisms: record.mechanism_coverage, evidence: record.evidence_coverage };
    if (direct[key] !== undefined) return normalizeCoverage(direct[key]);
    return "no";
  }

  function normalizeCoverage(value) {
    const normalized = String(value || "no").toLowerCase().trim();
    if (["yes", "systematic", "full", "✓", "true"].includes(normalized)) return "yes";
    if (["partial", "partly", "limited", "○", "◯", "◌"].includes(normalized)) return "partial";
    if (["not_assessed", "not assessed", "n/a", "na"].includes(normalized)) return "not_assessed";
    return "no";
  }

  function researchGroup(record) {
    const value = String(record.subgroup || record.corpusGroup || record.collection_group || "").toLowerCase();
    if (["primary", "included", "primary_corpus"].includes(value)) return "included";
    if (["adjacent", "adjacent_screened", "screened_out"].includes(value)) return "adjacent";
    if (["background", "related_background"].includes(value)) return "background";
    return value;
  }

  function recordId(record) {
    return String(record.id || record.key || record.citekey || slug(record.title || "record"));
  }

  function slug(value) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "record";
  }

  function validUrl(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch { return false; }
  }

  function doiUrl(value) {
    const doi = String(value).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    return `https://doi.org/${encodeURIComponent(doi).replace(/%2F/g, "/")}`;
  }

  function formatDetail(value) {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value)) return value.map(formatDetail).filter(Boolean).join("; ");
    if (typeof value === "object") return list(value).join("; ");
    return String(value);
  }

  function csvCell(value) { return `"${String(value || "").replace(/"/g, '""')}"`; }
  function singleLine(value) { return String(value || "").replace(/[\r\n]+/g, " ").trim(); }
  function number(value) { return new Intl.NumberFormat("en-US").format(value); }
  function formatDate(value) {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
  }
})();
