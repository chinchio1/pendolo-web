let chart = null;
const logEl = document.getElementById('log');
const downloadBtn = document.getElementById('downloadBtn');

function log(msg) {
  logEl.textContent += '\n' + msg;
  logEl.scrollTop = logEl.scrollHeight;
}

document.getElementById('runBtn').addEventListener('click', startSimulation);

function addRow() {
  const tbody = document.getElementById('wTable').querySelector('tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" class="w-full border rounded px-1" value="1"></td>
    <td><input type="number" class="w-full border rounded px-1" value="0.5"></td>
    <td><input type="number" class="w-full border rounded px-1" value="0"></td>
    <td><input type="number" class="w-full border rounded px-1" value="1"></td>
    <td><button type="button" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="removeRow(this)">Rimuovi</button></td>
  `;
  tbody.appendChild(tr);
}

function removeRow(btn) {
  const tr = btn.closest('tr');
  tr.remove();
}

async function startSimulation() {
  logEl.textContent = '';

  let w_v = [];

  // 1️⃣ Legge i dati dalla tabella
  const tbody = document.getElementById('wTable').querySelector('tbody');
  for (let row of tbody.rows) {
    const tau = Number(row.cells[0].querySelector('input').value);
    const w = Number(row.cells[1].querySelector('input').value) * 2 * Math.PI;
    const phi = Number(row.cells[2].querySelector('input').value);
    const A = Number(row.cells[3].querySelector('input').value);
    if (!isNaN(tau) && !isNaN(w) && !isNaN(phi) && !isNaN(A)) {
      w_v.push({ tau, w, phi, A });
    }
  }

  // 2️⃣ Se tabella vuota, legge dal file
  if (w_v.length === 0) {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
      alert("Inserisci almeno una riga di dati nella tabella o carica il file w.txt!");
      return;
    }
    const text = await fileInput.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    w_v = lines.map((line, idx) => {
      const parts = line.split(/\s+/);
      if (parts.length < 4) throw new Error(`Linea ${idx+1} non valida: ${line}`);
      const tau = Number(parts[0]);
      const w = Number(parts[1]) * 2 * Math.PI;
      const phi = Number(parts[2]);
      const A = Number(parts[3]);
      return { tau, w, phi, A };
    });
    log(`Letti ${w_v.length} parametri da file`);
  } else {
    log(`Letti ${w_v.length} parametri dalla tabella`);
  }

  const n = Number(document.getElementById('nSteps').value) || 100000;
  log(`Eseguo simulazione con n = ${n} passi (potrebbe richiedere tempo)`);

  const deltat = 10.0;
  const dt = deltat / n;
  const g = 9.80513;
  const l = 5.0;
  let t0 = 0.0;
  let v1 = 0.0, v2 = 0.0, th1 = 0.0, th2 = 0.0;

  for (let i = 0; i < w_v.length; i++) {
    v1 += - w_v[i].w * w_v[i].A * Math.cos(w_v[i].phi) / l;
  }

  const dati = [];
  const rumore = [];

  for (let step = 0; step < n; step++) {
    let ap = 0.0;
    for (let j = 0; j < w_v.length; j++) {
      const p = w_v[j];
      const expTerm = Math.exp(-t0 / p.tau);
      ap += p.A * expTerm * ((p.w * p.w - 1.0 / (p.tau * p.tau)) * Math.sin(p.w * t0 + p.phi)
              + 2.0 * (p.w / p.tau) * Math.cos(p.w * t0 + p.phi));
    }

    const delta = th1 - th2;
    const cos1 = Math.cos(th1);
    const cos2 = Math.cos(th2);
    const sin_delta = Math.sin(delta);
    const cos_delta = Math.cos(delta);
    const sin1 = Math.sin(th1);
    const sin2 = Math.sin(th2);

    let pt = l * sin1 + l * sin2;
    let sa = 0.0;
    for (let j = 0; j < w_v.length; j++) {
      const p = w_v[j];
      const term = Math.exp(-t0 / p.tau) * p.A * Math.sin(p.w * t0 + p.phi);
      pt += term;
      sa += term;
    }

    dati.push({ x: t0, y: pt });
    rumore.push({ x: t0, y: sa });

    const theta_2_dp = (v2 * v1 * sin_delta + (ap / l) * cos2 - (g / l) * sin2
        + v1 * (v1 - v2) * sin_delta
        - (cos_delta / 2.0) * (2.0 * (ap / l) * cos1 - 2.0 * (g / l) * sin1 - v1 * v2 * sin_delta + v2 * (v1 - v2) * sin_delta))
        / (1.0 - cos_delta * cos_delta * 0.5);

    const theta_1_dp = 0.5 * (2 * (ap / l) * cos1 - 2 * (g / l) * sin1 - v1 * v2 * sin_delta - theta_2_dp * cos_delta + v2 * (v1 - v2) * sin_delta);

    v1 += theta_1_dp * dt;
    v2 += theta_2_dp * dt;
    th1 += v1 * dt;
    th2 += v2 * dt;
    t0 += dt;
  }

  log("Simulazione completata.");

  drawChart(dati, rumore);
  prepareDownload(dati, rumore);
}

function drawChart(dati, rumore) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) { chart.destroy(); chart = null; }
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        { label: 'dati (pt)', data: dati, parsing: { xAxisKey: 'x', yAxisKey: 'y' }, borderColor: 'blue', borderWidth: 1, pointRadius: 0 },
        { label: 'rumore_base (sa)', data: rumore, parsing: { xAxisKey: 'x', yAxisKey: 'y' }, borderColor: 'red', borderWidth
