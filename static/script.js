const state = {
  destinations: [],  // [{ name: "Bali" }, ...]
  criteria: [],      // [{ name: "Budget", weight: 5 }, ...]
};

// ── Destinations ─────────────────────────────────────────────

function addDestination() {
  const input = document.getElementById("dest-input");
  const name = input.value.trim();
  if (!name) return;
  if (state.destinations.find(d => d.name.toLowerCase() === name.toLowerCase())) {
    showInputError("dest-input", "Already added!");
    return;
  }
  state.destinations.push({ name });
  input.value = "";
  renderDestinations();
  renderMatrix();
}

function removeDestination(name) {
  state.destinations = state.destinations.filter(d => d.name !== name);
  renderDestinations();
  renderMatrix();
}

function renderDestinations() {
  const list = document.getElementById("destination-list");
  list.innerHTML = "";
  if (!state.destinations.length) return;

  const wrap = document.createElement("div");
  wrap.className = "tag-list";
  wrap.style.marginBottom = "12px";

  state.destinations.forEach(d => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `📍 ${d.name} <span class="remove" onclick="removeDestination('${d.name}')">×</span>`;
    wrap.appendChild(tag);
  });

  list.appendChild(wrap);
}

// ── Criteria ──────────────────────────────────────────────────

function addCriterion(name, weight) {
  const input = document.getElementById("crit-input");
  const weightSelect = document.getElementById("crit-weight");

  const cname = (name || input.value.trim());
  const cweight = parseInt(weight || weightSelect.value);

  if (!cname) return;
  if (state.criteria.find(c => c.name.toLowerCase() === cname.toLowerCase())) {
    if (!name) showInputError("crit-input", "Already added!");
    return;
  }

  state.criteria.push({ name: cname, weight: cweight });
  if (!name) { input.value = ""; weightSelect.value = "3"; }
  renderCriteria();
  renderMatrix();
}

function quickAdd(name, weight) {
  addCriterion(name, weight);
}

function removeCriterion(name) {
  state.criteria = state.criteria.filter(c => c.name !== name);
  renderCriteria();
  renderMatrix();
}

function renderCriteria() {
  const list = document.getElementById("criteria-list");
  list.innerHTML = "";
  if (!state.criteria.length) return;

  const wrap = document.createElement("div");
  wrap.className = "tag-list";
  wrap.style.marginBottom = "12px";

  state.criteria.forEach(c => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `
      ${c.name}
      <span class="weight-badge">${c.weight}</span>
      <span class="remove" onclick="removeCriterion('${c.name}')">×</span>
    `;
    wrap.appendChild(tag);
  });

  list.appendChild(wrap);
}

// ── Scoring Matrix ────────────────────────────────────────────

function renderMatrix() {
  const container = document.getElementById("matrix-container");

  if (!state.destinations.length || !state.criteria.length) {
    container.innerHTML = `<p class="placeholder-text">Add destinations and criteria above to generate the scoring matrix.</p>`;
    return;
  }

  let html = `<table class="matrix-table">
    <thead>
      <tr>
        <th>Criterion <span style="font-weight:300;opacity:0.7">(weight)</span></th>
        ${state.destinations.map(d => `<th>${d.name}</th>`).join("")}
      </tr>
    </thead>
    <tbody>`;

  state.criteria.forEach(c => {
    html += `<tr>
      <td><strong>${c.name}</strong> <span style="color:var(--muted);font-size:12px">w:${c.weight}</span></td>
      ${state.destinations.map(d =>
        `<td><input type="number" min="1" max="10" value="5"
          id="score-${sanitize(d.name)}-${sanitize(c.name)}"
          oninput="clampScore(this)" /></td>`
      ).join("")}
    </tr>`;
  });

  html += `</tbody></table>
    <p style="font-size:12px;color:var(--muted);margin-top:10px;">
      Score each destination from <strong>1</strong> (poor) to <strong>10</strong> (excellent) for each criterion.
    </p>`;

  container.innerHTML = html;
}

function clampScore(input) {
  let v = parseInt(input.value);
  if (isNaN(v)) return;
  if (v < 1) input.value = 1;
  if (v > 10) input.value = 10;
}

function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "_");
}

// ── Evaluate ──────────────────────────────────────────────────

async function runEvaluation() {
  const resultsSection = document.getElementById("section-results");
  const container = document.getElementById("results-container");

  // Clear previous errors
  container.innerHTML = "";
  resultsSection.style.display = "none";

  // Build payload from current state + matrix inputs
  const destinations = state.destinations.map(d => {
    const scores = {};
    state.criteria.forEach(c => {
      const input = document.getElementById(`score-${sanitize(d.name)}-${sanitize(c.name)}`);
      scores[c.name] = input ? parseInt(input.value) || 5 : 5;
    });
    return { name: d.name, scores };
  });

  const payload = {
    destinations,
    criteria: state.criteria,
  };

  // Send to Flask backend
  try {
    const btn = document.querySelector(".btn-evaluate");
    btn.textContent = "Evaluating...";
    btn.disabled = true;

    const response = await fetch("/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    btn.textContent = "✦ Find My Best Destination";
    btn.disabled = false;

    if (!response.ok) {
      container.innerHTML = `<div class="error-msg">⚠ ${data.error}</div>`;
      resultsSection.style.display = "block";
      resultsSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    renderResults(data.results);

  } catch (err) {
    document.querySelector(".btn-evaluate").textContent = "✦ Find My Best Destination";
    document.querySelector(".btn-evaluate").disabled = false;
    container.innerHTML = `<div class="error-msg">⚠ Could not connect to the server. Make sure Flask is running.</div>`;
    resultsSection.style.display = "block";
  }
}

// ── Render Results ────────────────────────────────────────────

function renderResults(results) {
  const container = document.getElementById("results-container");
  const resultsSection = document.getElementById("section-results");

  const winner = results[0];
  const maxScore = 10;

  let html = `
    <div class="winner-banner">
      <div class="winner-icon">✈️</div>
      <div>
        <div class="winner-name">${winner.destination}</div>
        <div class="winner-score">Overall score: ${winner.total_score} / 10</div>
        <div class="winner-explanation">${winner.explanation}</div>
      </div>
    </div>
  `;

  results.forEach(r => {
    const barWidth = Math.round((r.total_score / maxScore) * 100);
    const isTop = r.rank === 1;

    html += `
      <div class="result-item">
        <div class="result-header" onclick="toggleBreakdown(${r.rank})">
          <span class="result-rank ${isTop ? 'top' : ''}">#${r.rank}</span>
          <span class="result-name">${r.destination}</span>
          <div class="score-bar-wrap">
            <div class="score-bar" style="width:${barWidth}%"></div>
          </div>
          <span class="result-total">${r.total_score}</span>
        </div>
        <div class="result-breakdown" id="breakdown-${r.rank}">
          <div class="breakdown-title">Score Breakdown — click a row to inspect</div>
          ${r.breakdown.map(b => {
            const contribWidth = Math.round((b.contribution / 1) * 100 * 5);
            return `
              <div class="breakdown-row">
                <span class="bc-name">${b.criterion}</span>
                <span class="bc-weight">w: ${b.weight}</span>
                <span class="bc-raw">${b.raw_score}/10</span>
                <div class="bc-bar-wrap">
                  <div class="bc-bar" style="width:${Math.min(contribWidth, 100)}%"></div>
                </div>
                <span class="bc-contrib">+${b.contribution}</span>
              </div>
            `;
          }).join("")}
          <div style="padding-top:10px;font-size:13px;color:var(--muted)">
            ${r.explanation}
          </div>
        </div>
        <div class="toggle-hint" style="padding:0 20px 10px;font-size:11px;color:var(--muted);">
          ▾ Click to ${isTop ? 'see' : 'see'} full breakdown
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth" });

  // Animate score bars
  setTimeout(() => {
    document.querySelectorAll(".score-bar").forEach(bar => {
      bar.style.width = bar.style.width;
    });
  }, 50);
}

function toggleBreakdown(rank) {
  const el = document.getElementById(`breakdown-${rank}`);
  el.classList.toggle("open");
}

// ── Helpers ───────────────────────────────────────────────────

function showInputError(inputId, msg) {
  const input = document.getElementById(inputId);
  const original = input.placeholder;
  input.style.borderColor = "var(--terracotta)";
  input.placeholder = msg;
  setTimeout(() => {
    input.style.borderColor = "";
    input.placeholder = original;
  }, 1500);
}

// Allow Enter key to add
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dest-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addDestination();
  });
  document.getElementById("crit-input").addEventListener("keydown", e => {
    if (e.key === "Enter") addCriterion();
  });
});