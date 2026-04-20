/* ═══════════════════════════════════════════════════════════════
   AgroCredit — Smart Crop & Carbon Intelligence Dashboard
   dashboard.js — Full logic extracted from original HTML file
   ═══════════════════════════════════════════════════════════════ */

/* ─── UTILITIES ─────────────────────────────────────────────── */

/**
 * Update a slider's display badge when the slider moves.
 * @param {string} id       - Input element ID
 * @param {string} labelId  - Badge element ID
 * @param {string} suffix   - Unit suffix e.g. '%', '°C', ' kg/ha'
 */
function updateVal(id, labelId, suffix) {
  document.getElementById(labelId).textContent =
    document.getElementById(id).value + suffix;
}

/* ─── FUZZY LOGIC ENGINE ────────────────────────────────────── */

/**
 * Generic 3-level fuzzy classifier.
 * Returns 'Low', 'Low-Moderate', 'Moderate', 'Moderate-High', or 'High'.
 */
function fuzzy(val, low, mid, high) {
  if (val <= low[1])                      return 'Low';
  if (val >= high[0])                     return 'High';
  if (val >= mid[0] && val <= mid[1])     return 'Moderate';
  if (val > low[1] && val < mid[0])       return 'Low-Moderate';
  return 'Moderate-High';
}

function fuzzyMoisture(v)  { return fuzzy(v, [0, 35],  [35, 65],  [65, 100]); }
function fuzzyPH(v)        { return v < 5.5 ? 'Acidic' : v > 7.5 ? 'Alkaline' : 'Neutral'; }
function fuzzyTemp(v)      { return v < 18  ? 'Cool'   : v > 34  ? 'Hot'      : 'Warm'; }
function fuzzyHumidity(v)  { return fuzzy(v, [0, 40],  [40, 70],  [70, 100]); }
function fuzzyNitrogen(v)  { return fuzzy(v, [0, 40],  [40, 80],  [80, 140]); }

/* ─── CROP DATABASE ─────────────────────────────────────────── */
const crops = [
  {
    name: 'Rice', emoji: '🌾',
    season: ['kharif', 'perennial'],
    conditions: { moisture:[60,100], ph:[5.5,7.0], temp:[22,35], humidity:[60,100], N:[80,140], P:[30,70], K:[40,100] },
    carbon: { seq:4.2, baseEmit:2.8 },
    creditPerTon: 15,
    tags: ['Staple Crop','High Water','Carbon Moderate'],
    market: 'Verified Carbon Standard (VCS)',
    variety: 'IR-64, Swarna'
  },
  {
    name: 'Wheat', emoji: '🌾',
    season: ['rabi'],
    conditions: { moisture:[40,70], ph:[6.0,7.5], temp:[12,25], humidity:[40,70], N:[80,120], P:[40,80], K:[40,80] },
    carbon: { seq:3.1, baseEmit:1.9 },
    creditPerTon: 12,
    tags: ['Staple Crop','Moderate Water','Low Emission'],
    market: 'Gold Standard',
    variety: 'HD-2967, WH-542'
  },
  {
    name: 'Maize', emoji: '🌽',
    season: ['kharif', 'zaid'],
    conditions: { moisture:[45,75], ph:[5.8,7.0], temp:[20,33], humidity:[45,75], N:[100,140], P:[50,90], K:[50,100] },
    carbon: { seq:5.8, baseEmit:2.1 },
    creditPerTon: 18,
    tags: ['Biofuel Crop','High Sequester','Global Market'],
    market: 'American Carbon Registry',
    variety: 'HQPM-1, NK-6240'
  },
  {
    name: 'Soybean', emoji: '🫘',
    season: ['kharif'],
    conditions: { moisture:[45,70], ph:[6.0,7.0], temp:[20,30], humidity:[50,80], N:[20,60], P:[50,90], K:[60,120] },
    carbon: { seq:6.5, baseEmit:1.2 },
    creditPerTon: 22,
    tags: ['N-Fixing','High Credit','Soil Builder'],
    market: 'Verra — VCS',
    variety: 'JS-335, NRC-7'
  },
  {
    name: 'Chickpea', emoji: '🫘',
    season: ['rabi'],
    conditions: { moisture:[30,60], ph:[6.0,8.0], temp:[15,25], humidity:[30,60], N:[10,40], P:[40,80], K:[30,80] },
    carbon: { seq:3.8, baseEmit:0.8 },
    creditPerTon: 20,
    tags: ['N-Fixing','Drought Hardy','Low Input'],
    market: 'Gold Standard',
    variety: 'JG-11, KAK-2'
  },
  {
    name: 'Sugarcane', emoji: '🎋',
    season: ['perennial', 'kharif'],
    conditions: { moisture:[65,100], ph:[6.0,7.5], temp:[25,38], humidity:[60,100], N:[100,140], P:[40,70], K:[80,140] },
    carbon: { seq:7.2, baseEmit:3.5 },
    creditPerTon: 14,
    tags: ['Bioenergy','High Biomass','Long Cycle'],
    market: 'Clean Development Mechanism',
    variety: 'Co-0238, CoJ-64'
  },
  {
    name: 'Cotton', emoji: '🪴',
    season: ['kharif'],
    conditions: { moisture:[40,70], ph:[6.0,7.5], temp:[25,38], humidity:[40,70], N:[80,140], P:[40,80], K:[60,120] },
    carbon: { seq:2.9, baseEmit:2.2 },
    creditPerTon: 11,
    tags: ['Cash Crop','Export Value','Moderate Credit'],
    market: 'Verra — VCS',
    variety: 'BTH-10, MRC-7017'
  },
  {
    name: 'Groundnut', emoji: '🥜',
    season: ['kharif', 'zaid'],
    conditions: { moisture:[40,65], ph:[5.5,7.0], temp:[25,35], humidity:[40,70], N:[20,60], P:[40,80], K:[60,120] },
    carbon: { seq:3.4, baseEmit:1.0 },
    creditPerTon: 19,
    tags: ['N-Fixing','Oil Crop','Soil Health'],
    market: 'Gold Standard',
    variety: 'ICGV-86031, TAG-24'
  },
  {
    name: 'Mustard', emoji: '🌼',
    season: ['rabi'],
    conditions: { moisture:[30,55], ph:[6.0,7.5], temp:[10,22], humidity:[30,60], N:[60,100], P:[30,60], K:[30,70] },
    carbon: { seq:2.6, baseEmit:1.4 },
    creditPerTon: 13,
    tags: ['Oil Crop','Cool Season','Low Water'],
    market: 'Gold Standard',
    variety: 'Pusa Bold, RH-749'
  },
  {
    name: 'Banana', emoji: '🍌',
    season: ['perennial'],
    conditions: { moisture:[70,100], ph:[5.5,7.0], temp:[26,35], humidity:[65,100], N:[100,140], P:[40,80], K:[100,200] },
    carbon: { seq:8.1, baseEmit:1.8 },
    creditPerTon: 25,
    tags: ['High Biomass','Tropical','Top Carbon'],
    market: 'Verra — VCS',
    variety: 'Robusta, Grand Naine'
  },
  {
    name: 'Tomato', emoji: '🍅',
    season: ['rabi', 'zaid'],
    conditions: { moisture:[50,75], ph:[6.0,7.0], temp:[18,30], humidity:[50,80], N:[80,120], P:[50,90], K:[80,140] },
    carbon: { seq:2.2, baseEmit:1.6 },
    creditPerTon: 10,
    tags: ['Vegetable','Short Cycle','Market Value'],
    market: 'Local Carbon Market',
    variety: 'Arka Vikas, Pusa Ruby'
  },
  {
    name: 'Jowar (Sorghum)', emoji: '🌾',
    season: ['kharif'],
    conditions: { moisture:[30,60], ph:[6.0,8.0], temp:[25,38], humidity:[30,65], N:[60,100], P:[30,60], K:[40,80] },
    carbon: { seq:4.9, baseEmit:1.1 },
    creditPerTon: 17,
    tags: ['Drought Hardy','Bioenergy','High Sequester'],
    market: 'American Carbon Registry',
    variety: 'CSH-16, SPV-462'
  },
];

/* ─── SCORING ENGINE ────────────────────────────────────────── */

/**
 * Score a crop against the current sensor inputs.
 * Returns a score 0–100 (percentage match).
 */
function scoreCrop(crop, inputs) {
  const c = crop.conditions;
  let score = 0;
  let total = 0;

  const check = (val, [lo, hi]) => {
    total++;
    if (val >= lo && val <= hi) {
      score += 1;
    } else {
      score += Math.max(0, 1 - Math.abs(val < lo ? lo - val : val - hi) / (hi - lo));
    }
  };

  check(inputs.moisture,        c.moisture);
  check(parseFloat(inputs.ph),  c.ph);
  check(inputs.temp,            c.temp);
  check(inputs.humidity,        c.humidity);
  check(inputs.N,               c.N);
  check(inputs.P,               c.P);
  check(inputs.K,               c.K);

  /* Season bonus — adds 1.5 extra points for matching season */
  if (crop.season.includes(inputs.season)) score += 1.5;
  total += 1.5;

  return (score / total) * 100;
}

/* ─── CARBON CALCULATION ────────────────────────────────────── */

/* Emission factors in tCO₂e per ha */
const fertEmissionFactor  = { organic:0.3, urea:2.8, npk:2.0, biofert:0.15 };
const irrigEmissionFactor = { drip:0.12,  sprinkler:0.35, flood:0.8, rainfed:0.05 };

/**
 * Calculate carbon breakdown for a given crop and inputs.
 * Returns fertEmit, irrigEmit, machineEmit, totalEmit, totalSeq, netCarbon (all in tCO₂e).
 */
function calcCarbon(crop, inputs) {
  const area        = inputs.area;
  const fertEmit    = fertEmissionFactor[inputs.fertType]      * area;
  const irrigEmit   = irrigEmissionFactor[inputs.irrigationType] * area;
  const machineEmit = 0.25 * area;                              /* average machinery */
  const totalEmit   = fertEmit + irrigEmit + machineEmit;

  const totalSeq  = crop.carbon.seq * area;                     /* sequestration */
  const netCarbon = totalSeq - totalEmit;                       /* positive = carbon positive */

  return { fertEmit, irrigEmit, machineEmit, totalEmit, totalSeq, netCarbon };
}

/**
 * Calculate USD value of carbon credits earned.
 * Returns 0 if net carbon is negative (carbon deficit).
 */
function creditValue(netCarbon, pricePerTon) {
  if (netCarbon <= 0) return 0;
  return netCarbon * pricePerTon;
}

/* ─── MAIN ANALYZE FUNCTION ─────────────────────────────────── */
let lastResult = null;

function analyze() {
  /* Collect all input values */
  const inputs = {
    moisture:      +document.getElementById('moisture').value,
    ph:            +document.getElementById('ph').value,
    temp:          +document.getElementById('temp').value,
    humidity:      +document.getElementById('humidity').value,
    N:             +document.getElementById('nitrogen').value,
    P:             +document.getElementById('phosphorus').value,
    K:             +document.getElementById('potassium').value,
    fertType:       document.getElementById('fertType').value,
    irrigationType: document.getElementById('irrigationType').value,
    area:          +document.getElementById('area').value,
    season:         document.getElementById('season').value,
  };

  /* Show loading spinner */
  document.getElementById('loader').classList.add('active');

  setTimeout(() => {
    document.getElementById('loader').classList.remove('active');

    /* Score all crops and sort best-first */
    const scored = crops
      .map(c => ({ ...c, score: scoreCrop(c, inputs) }))
      .sort((a, b) => b.score - a.score);

    const top        = scored[0];
    const confidence = Math.min(99, Math.round(top.score));
    const carbon     = calcCarbon(top, inputs);
    const creditVal  = creditValue(carbon.netCarbon, top.creditPerTon);

    lastResult = { top, confidence, carbon, creditVal, inputs, scored };

    renderResults(top, confidence, carbon, creditVal, inputs, scored);
    document.getElementById('reportBtn').classList.add('visible');
  }, 1400);
}

/* ─── RENDER RESULTS ────────────────────────────────────────── */
function renderResults(top, confidence, carbon, creditVal, inputs, scored) {
  const rc = document.getElementById('rightCol');
  document.getElementById('placeholder')?.remove();

  /* Fuzzy classifications for current inputs */
  const fm = fuzzyMoisture(inputs.moisture);
  const fp = fuzzyPH(inputs.ph);
  const ft = fuzzyTemp(inputs.temp);
  const fh = fuzzyHumidity(inputs.humidity);
  const fn = fuzzyNitrogen(inputs.N);

  /* Map fuzzy result to CSS class */
  function fuzzyClass(v) {
    if (v.includes('High') || v === 'Hot' || v === 'Alkaline' || v === 'Acidic') return 'fuzzy-high';
    if (v.includes('Low')  || v === 'Cool') return 'fuzzy-low';
    return 'fuzzy-med';
  }

  /* SVG confidence ring geometry */
  const circumference = 2 * Math.PI * 28;
  const dashOffset    = circumference * (1 - confidence / 100);

  /* Alternative crop rows (top 3 after winner) */
  const alts = scored.slice(1, 4).map(c =>
    `<div class="rec-item">
       <div class="rec-dot"></div>
       ${c.emoji} <strong>${c.name}</strong> — Match: ${Math.round(c.score)}% | Credits: $${
         creditValue(calcCarbon(c, inputs).netCarbon, c.creditPerTon).toFixed(0)
       }/season
     </div>`
  ).join('');

  /* Inject full results HTML */
  rc.innerHTML = `
    <!-- ── Crop Recommendation ── -->
    <div class="crop-result visible">
      <div class="crop-top">
        <div>
          <div class="crop-name">${top.emoji} ${top.name}</div>
          <div class="crop-sub">Recommended Crop · ${top.variety}</div>
        </div>
        <div class="confidence-ring">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none"
              stroke="rgba(184,217,95,0.15)" stroke-width="5"/>
            <circle cx="36" cy="36" r="28" fill="none"
              stroke="var(--lime)" stroke-width="5"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"
              stroke-linecap="round"/>
          </svg>
          <div class="ring-val">${confidence}%</div>
        </div>
      </div>

      <div class="crop-tags">
        ${top.tags.map(t => `<span class="tag tag-green">${t}</span>`).join('')}
        <span class="tag tag-gold">📈 ${top.market}</span>
        <span class="tag tag-blue">📅 ${inputs.season.charAt(0).toUpperCase() + inputs.season.slice(1)}</span>
      </div>

      <!-- Metric cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">🌿</div>
          <div class="metric-val">${carbon.totalSeq.toFixed(1)}</div>
          <div class="metric-label">tCO₂e Sequestered</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🏭</div>
          <div class="metric-val negative">${carbon.totalEmit.toFixed(1)}</div>
          <div class="metric-label">tCO₂e Emitted</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⚖️</div>
          <div class="metric-val ${carbon.netCarbon > 0 ? '' : 'negative'}">
            ${carbon.netCarbon > 0 ? '+' : ''}${carbon.netCarbon.toFixed(1)}
          </div>
          <div class="metric-label">Net Carbon (tCO₂e)</div>
        </div>
      </div>
    </div>

    <!-- ── Carbon Footprint Breakdown ── -->
    <div class="carbon-panel">
      <div class="carbon-title">🌍 Carbon Footprint Breakdown</div>

      <div class="carbon-bar-row">
        <span class="carbon-bar-label">Sequestration</span>
        <div class="carbon-bar-track">
          <div class="carbon-bar-fill bar-sequester" id="barSeq" style="width:0%"></div>
        </div>
        <span class="carbon-bar-num">+${carbon.totalSeq.toFixed(2)} t</span>
      </div>
      <div class="carbon-bar-row">
        <span class="carbon-bar-label">Fertilizer</span>
        <div class="carbon-bar-track">
          <div class="carbon-bar-fill bar-emission" id="barFert" style="width:0%"></div>
        </div>
        <span class="carbon-bar-num">-${carbon.fertEmit.toFixed(2)} t</span>
      </div>
      <div class="carbon-bar-row">
        <span class="carbon-bar-label">Irrigation</span>
        <div class="carbon-bar-track">
          <div class="carbon-bar-fill bar-emission" id="barIrrig" style="width:0%"></div>
        </div>
        <span class="carbon-bar-num">-${carbon.irrigEmit.toFixed(2)} t</span>
      </div>
      <div class="carbon-bar-row">
        <span class="carbon-bar-label">Machinery</span>
        <div class="carbon-bar-track">
          <div class="carbon-bar-fill bar-emission" id="barMach" style="width:0%"></div>
        </div>
        <span class="carbon-bar-num">-${carbon.machineEmit.toFixed(2)} t</span>
      </div>

      <!-- Carbon Credit earnings box -->
      <div class="credit-box">
        <div class="credit-left">
          <h3>${carbon.netCarbon > 0 ? '✅ Carbon Credits Earned' : '⚠ Carbon Deficit'}</h3>
          <p>${carbon.netCarbon > 0
            ? `Eligible for ${top.market}`
            : 'Optimize practices to earn credits'}</p>
        </div>
        <div class="credit-right">
          <div class="credit-price">$${creditVal.toFixed(0)}</div>
          <div class="credit-price-sub">USD / Season · $${top.creditPerTon}/tCO₂e</div>
        </div>
      </div>
    </div>

    <!-- ── Fuzzy Logic Classification ── -->
    <div class="carbon-panel">
      <div class="carbon-title">🔬 Fuzzy Logic Classification</div>
      <div class="fuzzy-section">
        <div class="fuzzy-card">
          <div class="fuzzy-label">Moisture</div>
          <div class="fuzzy-val ${fuzzyClass(fm)}">${fm}</div>
        </div>
        <div class="fuzzy-card">
          <div class="fuzzy-label">Soil pH</div>
          <div class="fuzzy-val ${fuzzyClass(fp)}">${fp}</div>
        </div>
        <div class="fuzzy-card">
          <div class="fuzzy-label">Temperature</div>
          <div class="fuzzy-val ${fuzzyClass(ft)}">${ft}</div>
        </div>
        <div class="fuzzy-card">
          <div class="fuzzy-label">Humidity</div>
          <div class="fuzzy-val ${fuzzyClass(fh)}">${fh}</div>
        </div>
        <div class="fuzzy-card">
          <div class="fuzzy-label">Nitrogen</div>
          <div class="fuzzy-val ${fuzzyClass(fn)}">${fn}</div>
        </div>
        <div class="fuzzy-card">
          <div class="fuzzy-label">Soil Area</div>
          <div class="fuzzy-val fuzzy-good">${inputs.area} ha</div>
        </div>
      </div>
    </div>

    <!-- ── Alternative Crop Options ── -->
    <div class="carbon-panel">
      <div class="carbon-title">🔄 Alternative Crop Options</div>
      <div class="rec-list">${alts}</div>
    </div>
  `;

  /* Animate the carbon breakdown bars after DOM injection */
  setTimeout(() => {
    const max = carbon.totalSeq;
    document.getElementById('barSeq').style.width   = '100%';
    document.getElementById('barFert').style.width  = (carbon.fertEmit   / max * 100) + '%';
    document.getElementById('barIrrig').style.width = (carbon.irrigEmit  / max * 100) + '%';
    document.getElementById('barMach').style.width  = (carbon.machineEmit/ max * 100) + '%';
  }, 100);
}

/* ─── REPORT DOWNLOAD ───────────────────────────────────────── */

/**
 * Generate and download a plain-text report for the last analysis result.
 */
function downloadReport() {
  if (!lastResult) return;
  const { top, confidence, carbon, creditVal, inputs } = lastResult;
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const report = `AGROCREDIT — IoT SMART CROP & CARBON INTELLIGENCE REPORT
${'='.repeat(60)}
Generated: ${date}

FIELD PARAMETERS
${'─'.repeat(40)}
Soil Moisture     : ${inputs.moisture}%
Soil pH           : ${inputs.ph}
Temperature       : ${inputs.temp}°C
Humidity          : ${inputs.humidity}%
Nitrogen (N)      : ${inputs.N} kg/ha
Phosphorus (P)    : ${inputs.P} kg/ha
Potassium (K)     : ${inputs.K} kg/ha
Fertilizer Type   : ${inputs.fertType}
Irrigation Method : ${inputs.irrigationType}
Land Area         : ${inputs.area} ha
Season            : ${inputs.season}

CROP RECOMMENDATION
${'─'.repeat(40)}
Recommended Crop  : ${top.name}
Variety           : ${top.variety}
Confidence Score  : ${confidence}%
Season Suitability: ${top.season.join(', ')}
Tags              : ${top.tags.join(', ')}

CARBON ANALYSIS (per season)
${'─'.repeat(40)}
Carbon Sequestered : +${carbon.totalSeq.toFixed(2)} tCO2e
Fertilizer Emission: -${carbon.fertEmit.toFixed(2)} tCO2e
Irrigation Emission: -${carbon.irrigEmit.toFixed(2)} tCO2e
Machinery Emission : -${carbon.machineEmit.toFixed(2)} tCO2e
Total Emissions    : -${carbon.totalEmit.toFixed(2)} tCO2e
NET CARBON BALANCE : ${carbon.netCarbon > 0 ? '+' : ''}${carbon.netCarbon.toFixed(2)} tCO2e

CARBON CREDIT VALUE
${'─'.repeat(40)}
Market Platform   : ${top.market}
Credit Rate       : $${top.creditPerTon} per tCO2e
ESTIMATED EARNINGS: $${creditVal.toFixed(2)} USD/season

FUZZY LOGIC CLASSIFICATION
${'─'.repeat(40)}
Moisture Level    : ${fuzzyMoisture(inputs.moisture)}
Soil pH State     : ${fuzzyPH(inputs.ph)}
Temperature Zone  : ${fuzzyTemp(inputs.temp)}
Humidity Level    : ${fuzzyHumidity(inputs.humidity)}
Nitrogen Status   : ${fuzzyNitrogen(inputs.N)}

${'='.repeat(60)}
This report was generated by AgroCredit — IoT Crop & Carbon
Intelligence System. Data is based on environmental models
and standard carbon accounting methodologies.
${'='.repeat(60)}`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `AgroCredit_Report_${top.name}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
