/* =====================================================================
   AgroSense — Smart Crop Recommendation System
   script.js — ML simulation, fuzzy logic, carbon module, charts
   ===================================================================== */

/* ─── DATA TABLES ──────────────────────────────────────────────────────── */

const CROP_DATA = {
  "Rice": {
    icon: "🌾",
    conditions: { N: [60,120], P: [35,60], K: [30,60], pH: [5.5,6.5], moisture: [60,90], temp: [20,35] },
    emission: 1200, sequestration: 180,
    fertilizer: "Apply Urea (N) 120kg/ha + Single Super Phosphate 60kg/ha",
    water: "High water requirement. Continuous flooding recommended.",
    eco_alternatives: ["Jowar", "Millets"],
    confidence: 98.8
  },
  "Wheat": {
    icon: "🌿",
    conditions: { N: [50,100], P: [40,70], K: [40,70], pH: [6.0,7.5], moisture: [40,65], temp: [12,25] },
    emission: 780, sequestration: 220,
    fertilizer: "Apply DAP 50kg/ha + MOP 25kg/ha at sowing",
    water: "Moderate irrigation. 3-4 irrigations during crop cycle.",
    eco_alternatives: ["Maize", "Jowar"],
    confidence: 97.9
  },
  "Maize": {
    icon: "🌽",
    conditions: { N: [50,100], P: [30,60], K: [50,90], pH: [5.8,7.0], moisture: [35,60], temp: [18,32] },
    emission: 640, sequestration: 290,
    fertilizer: "Apply Urea 80kg/ha split into 3 doses. Add Zinc Sulphate.",
    water: "Moderate. Irrigate at tasseling and grain filling stages.",
    eco_alternatives: ["Jowar", "Banana"],
    confidence: 98.2
  },
  "Banana": {
    icon: "🍌",
    conditions: { N: [80,130], P: [20,45], K: [100,170], pH: [5.5,7.0], moisture: [60,80], temp: [22,38] },
    emission: 420, sequestration: 380,
    fertilizer: "High K requirement. Apply Potash 200g/plant. Fertigation preferred.",
    water: "High. Drip irrigation highly recommended. 1800mm/year.",
    eco_alternatives: ["Cardamom"],
    confidence: 99.1
  },
  "Cardamom": {
    icon: "🌱",
    conditions: { N: [20,60], P: [15,40], K: [30,70], pH: [5.0,6.5], moisture: [60,85], temp: [10,35] },
    emission: 180, sequestration: 410,
    fertilizer: "Organic compost preferred. Apply NPK 20:20:20 sparingly.",
    water: "Moderate shade and humidity. Sprinkler irrigation suitable.",
    eco_alternatives: [],
    confidence: 97.4
  },
  "Jowar": {
    icon: "🌾",
    conditions: { N: [30,70], P: [20,45], K: [20,50], pH: [6.0,8.0], moisture: [25,50], temp: [25,38] },
    emission: 310, sequestration: 260,
    fertilizer: "Low input crop. Apply Urea 40kg/ha + MOP 20kg/ha",
    water: "Drought tolerant. Minimal irrigation. 1-2 protective irrigations.",
    eco_alternatives: ["Millets"],
    confidence: 98.0
  },
  "Millets": {
    icon: "🌿",
    conditions: { N: [10,40], P: [10,30], K: [10,35], pH: [6.0,8.5], moisture: [20,45], temp: [26,38] },
    emission: 220, sequestration: 300,
    fertilizer: "Minimal fertilizer. Urea 30kg/ha sufficient. Ideal for poor soils.",
    water: "Very drought tolerant. Rain-fed farming possible. 400-600mm.",
    eco_alternatives: [],
    confidence: 97.6
  },
  "Cotton": {
    icon: "🤍",
    conditions: { N: [40,80], P: [30,55], K: [50,80], pH: [6.5,8.5], moisture: [30,55], temp: [25,40] },
    emission: 890, sequestration: 150,
    fertilizer: "Apply DAP 100kg/ha + MOP 50kg/ha. Micronutrients essential.",
    water: "Moderate. Critical at flowering. Avoid waterlogging.",
    eco_alternatives: ["Jowar", "Millets"],
    confidence: 96.8
  },
  "Oilseed": {
    icon: "🌻",
    conditions: { N: [30,65], P: [40,70], K: [30,60], pH: [6.0,7.5], moisture: [30,55], temp: [20,35] },
    emission: 520, sequestration: 240,
    fertilizer: "Apply Borax 2kg/ha. Sulphur is critical for oilseeds.",
    water: "Moderate. Avoid excess moisture. Critical at flowering.",
    eco_alternatives: ["Cardamom", "Banana"],
    confidence: 97.2
  }
};

/* ─── BACKGROUND CANVAS ────────────────────────────────────────────────── */
function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 1,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        alpha: Math.random() * .4 + .1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(22,163,74,${p.alpha})`;
      ctx.fill();
    });
    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(q => {
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(22,163,74,${.08 * (1 - d/150)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize(); createParticles(); draw();
}

/* ─── LIVE INPUT FILL BARS ─────────────────────────────────────────────── */
function initInputBars() {
  const map = [
    { id: 'nitrogen',    fill: 'n-fill',   max: 140 },
    { id: 'phosphorus',  fill: 'p-fill',   max: 145 },
    { id: 'potassium',   fill: 'k-fill',   max: 205 },
    { id: 'ph',          fill: 'ph-fill',  max: 9.5, min: 3.5 },
    { id: 'moisture',    fill: 'm-fill',   max: 90, min: 10 },
    { id: 'temperature', fill: 't-fill',   max: 45, min: 8 }
  ];
  map.forEach(({ id, fill, max, min = 0 }) => {
    const el = document.getElementById(id);
    const bar = document.getElementById(fill);
    if (!el || !bar) return;
    el.addEventListener('input', () => {
      const pct = Math.min(100, Math.max(0, ((+el.value - min) / (max - min)) * 100));
      bar.style.width = pct + '%';
    });
  });
}

/* ─── SIMULATE DATA ────────────────────────────────────────────────────── */
const SIM_PROFILES = [
  { name:'Rice field', N:90, P:45, K:40, ph:6.0, moisture:75, temp:28, wph:6.8, ec:350, turb:12 },
  { name:'Wheat farm', N:70, P:55, K:55, ph:6.8, moisture:50, temp:20, wph:7.0, ec:450, turb:8 },
  { name:'Banana plantation', N:110, P:30, K:140, ph:6.2, moisture:70, temp:30, wph:6.5, ec:300, turb:15 },
  { name:'Dry land', N:25, P:20, K:30, ph:7.5, moisture:28, temp:34, wph:7.2, ec:800, turb:30 },
  { name:'Cardamom estate', N:40, P:25, K:50, ph:5.8, moisture:75, temp:22, wph:6.3, ec:200, turb:5 }
];

let simIdx = 0;

function simulateData() {
  const p = SIM_PROFILES[simIdx % SIM_PROFILES.length];
  simIdx++;

  const fields = ['nitrogen','phosphorus','potassium','ph','moisture','temperature','water-ph','ec','turbidity'];
  const vals = [p.N, p.P, p.K, p.ph, p.moisture, p.temp, p.wph, p.ec, p.turb];

  fields.forEach((f, i) => {
    const el = document.getElementById(f);
    if (el) {
      el.value = vals[i];
      el.dispatchEvent(new Event('input'));
    }
  });

  const btn = document.querySelector('.btn-simulate');
  btn.textContent = `Profile: ${p.name}`;
  setTimeout(() => {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8A5 5 0 113 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 8l-2-2M13 8l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Simulate IoT Data`;
  }, 1500);
}

/* ─── CROP RECOMMENDATION ENGINE ──────────────────────────────────────── */
function recommendCrop(N, P, K, pH, moisture, temp) {
  const scores = {};

  for (const [crop, data] of Object.entries(CROP_DATA)) {
    const c = data.conditions;
    let score = 0;
    const inRange = (v, r) => v >= r[0] && v <= r[1];
    const nearRange = (v, r, weight) => {
      if (inRange(v, r)) return weight;
      const dist = Math.min(Math.abs(v - r[0]), Math.abs(v - r[1]));
      return Math.max(0, weight - dist * 0.5);
    };

    score += nearRange(N,       c.N,        30);
    score += nearRange(P,       c.P,        20);
    score += nearRange(K,       c.K,        20);
    score += nearRange(pH,      c.pH,       15);
    score += nearRange(moisture,c.moisture, 10);
    score += nearRange(temp,    c.temp,     5);

    scores[crop] = score;
  }

  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  return { crop: sorted[0][0], scores };
}

/* ─── FUZZY LOGIC ENGINE ───────────────────────────────────────────────── */
function fuzzyNutrientLevel(value, low, optimal_low, optimal_high, high) {
  if (value <= low) return { level: 'Low', pct: 15 };
  if (value >= high) return { level: 'High', pct: 92 };
  if (value >= optimal_low && value <= optimal_high) return { level: 'Optimal', pct: 75 };
  if (value < optimal_low) return { level: 'Below optimal', pct: 40 };
  return { level: 'Above optimal', pct: 88 };
}

function fuzzyFertilizer(N, P, K, cropData) {
  const nStatus = fuzzyNutrientLevel(N, 0, 60, 90, 120);
  const pStatus = fuzzyNutrientLevel(P, 0, 35, 60, 100);
  const kStatus = fuzzyNutrientLevel(K, 0, 40, 80, 150);

  const deficiencies = [];
  if (nStatus.level === 'Low' || nStatus.level === 'Below optimal') deficiencies.push('Nitrogen');
  if (pStatus.level === 'Low' || pStatus.level === 'Below optimal') deficiencies.push('Phosphorus');
  if (kStatus.level === 'Low' || kStatus.level === 'Below optimal') deficiencies.push('Potassium');

  let recommendation, rate;
  if (deficiencies.length === 0) {
    recommendation = 'Balanced nutrition';
    rate = 'Maintain current regime';
  } else if (deficiencies.length === 1) {
    recommendation = `${deficiencies[0]} supplement required`;
    rate = 'Apply targeted fertilizer at 50% recommended dose';
  } else {
    recommendation = `NPK correction needed (${deficiencies.join(', ')})`;
    rate = 'Apply complex fertilizer 14:35:14 at full dose';
  }

  return { recommendation, rate, nStatus, pStatus, kStatus };
}

function fuzzyIrrigation(moisture, ec, wph) {
  const isSuitable = ec < 800 && wph >= 6.0 && wph <= 8.5;
  let status, sub;

  if (moisture < 30) { status = 'Irrigation Required'; sub = 'Soil critically dry. Irrigate immediately.'; }
  else if (moisture < 45) { status = 'Irrigation Advised'; sub = 'Moisture below optimal. Schedule irrigation soon.'; }
  else if (moisture > 80) { status = 'Drainage Advised'; sub = 'Excess moisture detected. Improve drainage.'; }
  else { status = 'Adequate Moisture'; sub = 'No immediate irrigation needed. Monitor regularly.'; }

  const waterQuality = isSuitable ? 'Suitable for irrigation' : 'Water quality concern detected';
  return { status, sub, waterQuality, isSuitable };
}

/* ─── CARBON MODULE ────────────────────────────────────────────────────── */
function calculateCarbon(cropName, fertilizer_kg = 80, water_m3 = 400, area_ha = 1.0) {
  const crop = CROP_DATA[cropName];
  if (!crop) return null;

  const cf_crop        = (crop.emission - crop.sequestration) * area_ha;
  const cf_fertilizer  = fertilizer_kg * 6.3;
  const cf_water       = water_m3 * 0.21;
  const cf_total       = cf_crop + cf_fertilizer + cf_water;

  const impact   = cf_total < 300 ? 'Low' : cf_total < 700 ? 'Medium' : 'High';
  const baseline = 700;
  const saved_kg = Math.max(0, baseline - cf_total);
  const credits  = +(saved_kg / 1000).toFixed(4);
  const credit_usd = +(credits * 15).toFixed(2);

  return {
    total: +cf_total.toFixed(1),
    cf_crop: +cf_crop.toFixed(1),
    cf_fertilizer: +cf_fertilizer.toFixed(1),
    cf_water: +cf_water.toFixed(1),
    impact,
    credits,
    credit_usd
  };
}

/* ─── GAUGE ANIMATION ──────────────────────────────────────────────────── */
function animateGauge(value, impact) {
  const arc = document.getElementById('gauge-arc');
  const maxCF = 1200;
  const pct = Math.min(1, Math.max(0, value / maxCF));
  const circumference = 251;
  const offset = circumference - pct * circumference;

  const color = impact === 'Low' ? '#4ade80' : impact === 'Medium' ? '#fbbf24' : '#f87171';
  arc.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1), stroke .5s';
  arc.style.stroke = color;
  arc.style.strokeDashoffset = offset;
  document.getElementById('gauge-value').textContent = value;
}

/* ─── MAIN ANALYSIS FUNCTION ───────────────────────────────────────────── */
function analyzeData() {
  const vals = {
    N:       +document.getElementById('nitrogen').value,
    P:       +document.getElementById('phosphorus').value,
    K:       +document.getElementById('potassium').value,
    pH:      +document.getElementById('ph').value,
    moisture:+document.getElementById('moisture').value,
    temp:    +document.getElementById('temperature').value,
    wph:     +document.getElementById('water-ph').value,
    ec:      +document.getElementById('ec').value,
    turbidity:+document.getElementById('turbidity').value
  };

  if (!vals.N || !vals.P || !vals.K || !vals.pH || !vals.moisture || !vals.temp) {
    alert('Please fill in all required soil parameters before running analysis.');
    return;
  }

  showLoading();

  setTimeout(() => {
    const { crop }  = recommendCrop(vals.N, vals.P, vals.K, vals.pH, vals.moisture, vals.temp);
    const fuzzy     = fuzzyFertilizer(vals.N, vals.P, vals.K, CROP_DATA[crop]);
    const irrigation = fuzzyIrrigation(vals.moisture, vals.ec, vals.wph);
    const carbon    = calculateCarbon(crop);
    const cropInfo  = CROP_DATA[crop];

    hideLoading();
    renderResults(crop, cropInfo, fuzzy, irrigation, vals);
    renderCarbon(crop, carbon, cropInfo);
    renderCharts();

    document.getElementById('results-section').style.display = 'block';
    document.getElementById('carbon-section').style.display = 'block';
    document.getElementById('chart-section').style.display = 'block';

    setTimeout(() => {
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
      triggerAnimations();
    }, 100);

  }, 3200);
}

/* ─── LOADING SEQUENCE ──────────────────────────────────────────────────── */
let loadingTimer = null;
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('active');
  const steps = ['ls1','ls2','ls3','ls4'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active','done');
  });
  document.getElementById('ls1').classList.add('active');

  let i = 0;
  loadingTimer = setInterval(() => {
    if (i < steps.length - 1) {
      document.getElementById(steps[i]).classList.remove('active');
      document.getElementById(steps[i]).classList.add('done');
      i++;
      document.getElementById(steps[i]).classList.add('active');
    }
  }, 700);
}

function hideLoading() {
  clearInterval(loadingTimer);
  document.getElementById('loading-overlay').classList.remove('active');
}

/* ─── RENDER RESULTS ───────────────────────────────────────────────────── */
function renderResults(crop, cropInfo, fuzzy, irrigation, vals) {
  document.getElementById('result-crop').textContent = crop;
  document.getElementById('crop-icon-wrap').textContent = cropInfo.icon;
  document.getElementById('result-confidence').textContent =
    `Model confidence: ${cropInfo.confidence}% · Voting Classifier (RF + Bagging + AdaBoost)`;

  document.getElementById('result-fertilizer').textContent = fuzzy.recommendation;
  document.getElementById('result-fertilizer-sub').textContent = cropInfo.fertilizer;

  const irrCard = document.querySelector('.irrigation-card');
  document.getElementById('result-irrigation').textContent = irrigation.status;
  document.getElementById('result-irrigation-sub').textContent = irrigation.sub;
  irrCard.className = 'rcard irrigation-card ' +
    (irrigation.status.includes('Required') ? 'card-warn' :
     irrigation.status.includes('Drainage') ? 'card-bad' : 'card-good');

  document.getElementById('result-water').textContent = irrigation.waterQuality;
  document.getElementById('result-water-sub').textContent =
    `EC: ${vals.ec} µS/cm · Turbidity: ${vals.turbidity} NTU · pH: ${vals.wph}`;

  const phStatus = vals.wph >= 6 && vals.wph <= 8.5 ? 'card-good' : 'card-bad';
  document.querySelector('.water-card').className = `rcard water-card ${phStatus}`;

  /* fuzzy bars */
  const renderFBar = (barId, statusId, statusObj) => {
    document.getElementById(barId).style.width = statusObj.pct + '%';
    const el = document.getElementById(statusId);
    el.textContent = statusObj.level;
    el.className = 'fbar-status ' +
      (statusObj.level === 'Optimal' ? 'status-optimal' :
       statusObj.level === 'Low' || statusObj.level === 'Below optimal' ? 'status-low' :
       statusObj.level === 'High' || statusObj.level === 'Above optimal' ? 'status-high' : 'status-medium');
  };

  renderFBar('n-bar', 'n-status', fuzzy.nStatus);
  renderFBar('p-bar', 'p-status', fuzzy.pStatus);
  renderFBar('k-bar', 'k-status', fuzzy.kStatus);

  const phFuzzy = fuzzyNutrientLevel(vals.pH, 4, 6, 7, 8);
  renderFBar('ph-bar', 'ph-status', phFuzzy);

  const mFuzzy = fuzzyNutrientLevel(vals.moisture, 10, 40, 65, 85);
  renderFBar('moisture-bar', 'moisture-status', mFuzzy);
}

/* ─── RENDER CARBON ─────────────────────────────────────────────────────── */
function renderCarbon(cropName, carbon, cropInfo) {
  if (!carbon) return;

  animateGauge(carbon.total, carbon.impact);

  const badge = document.getElementById('carbon-badge');
  badge.textContent = `${carbon.impact} Carbon Impact`;
  badge.className = 'carbon-impact-badge badge-' + carbon.impact.toLowerCase();

  document.getElementById('credit-value').textContent = `$${carbon.credit_usd.toFixed(2)}`;
  document.getElementById('credit-tonnes').textContent =
    `${carbon.credits} tonnes CO₂e saved vs 700 kg baseline`;

  const maxBar = Math.max(Math.abs(carbon.cf_crop), carbon.cf_fertilizer, carbon.cf_water, 1);
  const setPct = (barId, valId, val, max) => {
    const pct = Math.min(100, Math.abs(val) / max * 100);
    document.getElementById(barId).style.width = pct + '%';
    document.getElementById(valId).textContent = val + ' kg';
  };
  setPct('crop-emission-bar', 'crop-emission-val', carbon.cf_crop, maxBar);
  setPct('fert-emission-bar', 'fert-emission-val', carbon.cf_fertilizer, maxBar);
  setPct('water-emission-bar', 'water-emission-val', carbon.cf_water, maxBar);

  const ecoList = document.getElementById('eco-list');
  if (cropInfo.eco_alternatives && cropInfo.eco_alternatives.length > 0) {
    ecoList.innerHTML = cropInfo.eco_alternatives
      .map(c => `<span class="eco-chip">${CROP_DATA[c]?.icon || '🌿'} ${c}</span>`).join('');
    document.getElementById('eco-note').textContent =
      `These alternatives produce less CO₂e and may be eligible for carbon credits.`;
  } else {
    ecoList.innerHTML = `<span class="eco-chip">🌿 ${cropName} is already eco-friendly</span>`;
    document.getElementById('eco-note').textContent =
      `${cropName} has a negative net carbon footprint — it sequesters more CO₂ than it emits.`;
  }
}

/* ─── TRIGGER ANIMATIONS ─────────────────────────────────────────────────── */
function triggerAnimations() {
  document.getElementById('primary-result').classList.add('visible');
  setTimeout(() => document.querySelectorAll('.rcard').forEach(c => c.classList.add('visible')), 200);
}

/* ─── CHARTS ─────────────────────────────────────────────────────────────── */
let chartsInitialised = false;

function renderCharts() {
  if (chartsInitialised) return;
  chartsInitialised = true;

  /* Chart 1 — Accuracy comparison */
  new Chart(document.getElementById('accuracyChart'), {
    type: 'bar',
    data: {
      labels: ['Decision\nTree', 'AdaBoost', 'Bagging', 'Random\nForest', 'Voting\nClassifier'],
      datasets: [{
        label: 'Accuracy (%)',
        data: [97.85, 98.10, 98.45, 98.90, 99.05],
        backgroundColor: ['#86efac','#86efac','#4ade80','#22c55e','#15803d'],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 97, max: 99.5, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  /* Chart 2 — Precision/Recall/F1 */
  new Chart(document.getElementById('metricsChart'), {
    type: 'bar',
    data: {
      labels: ['Decision Tree', 'AdaBoost', 'Bagging', 'Random Forest', 'Voting'],
      datasets: [
        { label: 'Precision', data: [0.97,0.98,0.98,0.99,0.99], backgroundColor: '#4ade80', borderRadius: 4 },
        { label: 'Recall',    data: [0.97,0.98,0.98,0.99,0.99], backgroundColor: '#22c55e', borderRadius: 4 },
        { label: 'F1-Score',  data: [0.97,0.98,0.98,0.99,0.99], backgroundColor: '#15803d', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { min: 0.96, max: 1.0, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  /* Chart 3 — Carbon footprint */
  const cfData = Object.entries(CROP_DATA).map(([k,v]) => ({
    crop: k, cf: v.emission - v.sequestration
  })).sort((a,b) => a.cf - b.cf);

  new Chart(document.getElementById('carbonChart'), {
    type: 'bar',
    data: {
      labels: cfData.map(d => d.crop),
      datasets: [{
        label: 'Net CO₂e (kg/ha)',
        data: cfData.map(d => d.cf),
        backgroundColor: cfData.map(d =>
          d.cf < 0 ? '#4ade80' : d.cf < 300 ? '#86efac' : d.cf < 600 ? '#fbbf24' : '#f87171'
        ),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

/* ─── DOWNLOAD REPORT ─────────────────────────────────────────────────────── */
function downloadReport() {
  const crop      = document.getElementById('result-crop').textContent;
  const fert      = document.getElementById('result-fertilizer').textContent;
  const fertSub   = document.getElementById('result-fertilizer-sub').textContent;
  const irr       = document.getElementById('result-irrigation').textContent;
  const irrSub    = document.getElementById('result-irrigation-sub').textContent;
  const water     = document.getElementById('result-water').textContent;
  const cf        = document.getElementById('gauge-value').textContent;
  const badge     = document.getElementById('carbon-badge').textContent;
  const credit    = document.getElementById('credit-value').textContent;
  const tonnes    = document.getElementById('credit-tonnes').textContent;
  const now       = new Date().toLocaleString();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>AgroSense Report — ${crop}</title>
<style>
  body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 32px;color:#0f172a;line-height:1.7}
  h1{font-size:32px;color:#14532d;margin-bottom:4px}
  .sub{color:#64748b;font-size:14px;margin-bottom:32px}
  h2{font-size:18px;color:#15803d;border-bottom:1px solid #dcfce7;padding-bottom:6px;margin:28px 0 12px}
  .section{margin-bottom:24px}
  .row{display:flex;gap:16px;margin-bottom:6px}
  .label{color:#64748b;font-size:13px;width:200px;flex-shrink:0}
  .value{font-size:13px;font-weight:500}
  .badge{display:inline-block;padding:3px 12px;border-radius:12px;font-size:12px;font-weight:500;
         background:#dcfce7;color:#15803d;margin-bottom:8px}
  .formula{font-family:monospace;font-size:11px;background:#f8fafc;padding:12px;border-radius:6px;
            color:#475569;margin-top:8px}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;
           font-size:12px;color:#94a3b8;text-align:center}
  @media print{body{margin:20px}}
</style></head><body>
<h1>AgroSense — Crop Analysis Report</h1>
<div class="sub">Generated: ${now} · IoT-Enabled Smart Agriculture System · VelTech University, Tamil Nadu</div>

<h2>Recommended Crop</h2>
<div class="badge">${crop}</div>
<div class="section">
  <div class="row"><span class="label">Model</span><span class="value">Voting Classifier (RF + Bagging + AdaBoost)</span></div>
  <div class="row"><span class="label">System Accuracy</span><span class="value">99.05%</span></div>
</div>

<h2>Fertilizer Recommendation (Fuzzy Logic)</h2>
<div class="section">
  <div class="row"><span class="label">Assessment</span><span class="value">${fert}</span></div>
  <div class="row"><span class="label">Prescription</span><span class="value">${fertSub}</span></div>
</div>

<h2>Irrigation Assessment</h2>
<div class="section">
  <div class="row"><span class="label">Status</span><span class="value">${irr}</span></div>
  <div class="row"><span class="label">Guidance</span><span class="value">${irrSub}</span></div>
  <div class="row"><span class="label">Water Quality</span><span class="value">${water}</span></div>
</div>

<h2>Carbon Footprint & Sustainability</h2>
<div class="section">
  <div class="row"><span class="label">Total Footprint</span><span class="value">${cf} kg CO₂e / ha / season</span></div>
  <div class="row"><span class="label">Impact Level</span><span class="value">${badge}</span></div>
  <div class="row"><span class="label">Carbon Credit Potential</span><span class="value">${credit} (${tonnes})</span></div>
  <div class="formula">CF = (crop_emission × area) + (fertilizer_kg × 6.3) + (water_m³ × 0.21) − sequestration_factor
Carbon Credits (voluntary market) = max(0, (700 − CF_total) / 1000) × $15/tonne</div>
</div>

<div class="footer">AgroSense · VelTech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology ·
S. Jayashree, A. Amarnath Shanker, V. Ram Manohar Reddy · Tamil Nadu, India · 2025</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `AgroSense_Report_${crop}_${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── INIT ─────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initBackground();
  initInputBars();
});
