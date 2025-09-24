let chart = null;
const logEl = document.getElementById('log');
const downloadBtn = document.getElementById('downloadBtn');
const wTableBody = document.getElementById('wTableBody');
const addRowBtn = document.getElementById('addRowBtn');

function log(msg) {
  logEl.textContent += '\n' + msg;
  logEl.scrollTop = logEl.scrollHeight;
}

// Righe iniziali
const initialData = [
  [7.1, 81.6, 0, 1.09e-5],
  [10.7, 68.4, 0, 0.94e-5],
  [7.8, 85.9, 0, 1.15e-5],
  [9.5, 57.2, 0, 1.18e-5],
  [6.5, 79.3, 0, 0.99e-5],
  [8.6, 73.5, 0, 1.11e-5],
  [10.3, 66.7, 0, 1.07e-5],
  [7.4, 88.1, 0, 1.13e-5],
  [8.0, 55.8, 0, 1.03e-5],
  [9.0, 89.2, 0, 0.96e-5]
];

// Funzioni tabella
function addRow(tau=1, w=0.5, phi=0, A=1) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" class="w-full border rounded px-1" value="${tau}"></td>
    <td><input type="number" class="w-full border rounded px-1" value="${w}"></td>
    <td><input type="number" class="w-full border rounded px-1" value="${phi}"></td>
    <td><input type="number" class="w-full border rounded px-1" value="${A}"></td>
    <td><button type="button" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="removeRow(this)">Rimuovi</button></td>
  `;
  wTableBody.appendChild(tr);
}

function removeRow(btn) {
  const tr = btn.closest('tr');
  tr.remove();
}

// Carica righe iniziali
initialData.forEach(r => addRow(...r));

// Aggiungi riga vuota
addRowBtn.addEventListener('click', () => addRow());

document.getElementById('runBtn').addEventListener('click', startSimulation);

async function startSimulation() {
  logEl.textContent = '';

  let w_v = [];

  // Legge dati dalla tabella
  for (let row of wTableBody.rows) {
    const tau = Number(row.cells[0].querySelector('input').value);
    const w = Number(row.cells[1].querySelector('input').value) * 2 * Math.PI;
    const phi = Number(row.cells[2].querySelector('input').value);
    const A = Number(row.cells[3].querySelector('input').value);
    if (!isNaN(tau) && !isNaN(w) && !isNaN(phi) && !isNaN(A)) {
      w_v.push({ tau, w, phi, A });
    }
  }

  // Se tabella vuota, prova file
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
  log(`Eseguo simulazione con n = ${n} passi`);

  // --- Simulazione (resta invariata) ---
  const deltat = 10.0;
  const dt = deltat / n;
  const g = 9.80513;
  const l = 5.0;
  let t0 = 0.0;
  let v1 = 0.0, v2 = 0.0, th1 = 0.0, th2 = 0.0;

  for (let i = 0; i < w_v.length; i++) v1 += -w_v[i].w * w_v[i].A * Math.cos(w_v[i].phi)/l;

  const dati = [], rumore = [];

  for (let step = 0; step < n; step++) {
    let ap = 0.0;
    for (let j = 0; j < w_v.length; j++) {
      const p = w_v[j];
      const expTerm = Math.exp(-t0/p.tau);
      ap += p.A*expTerm*((p.w*p.w - 1/(p.tau*p.tau))*Math.sin(p.w*t0+p.phi)
              + 2*(p.w/p.tau)*Math.cos(p.w*t0+p.phi));
    }

    const delta = th1-th2, cos1=Math.cos(th1), cos2=Math.cos(th2);
    const sin_delta=Math.sin(delta), cos_delta=Math.cos(delta), sin1=Math.sin(th1), sin2=Math.sin(th2);

    let pt = l*sin1 + l*sin2, sa = 0.0;
    for (let j=0;j<w_v.length;j++){
      const p = w_v[j];
      const term = Math.exp(-t0/p.tau)*p.A*Math.sin(p.w*t0+p.phi);
      pt += term; sa += term;
    }

    dati.push({x:t0,y:pt}); rumore.push({x:t0,y:sa});

    const theta_2_dp=(v2*v1*sin_delta + (ap/l)*cos2 - (g/l)*sin2 + v1*(v1-v2)*sin_delta
        - (cos_delta/2)*(2*(ap/l)*cos1 - 2*(g/l)*sin1 - v1*v2*sin_delta + v2*(v1-v2)*sin_delta))
        /(1-cos_delta*cos_delta*0.5);

    const theta_1_dp=0.5*(2*(ap/l)*cos1 - 2*(g/l)*sin1 - v1*v2*sin_delta - theta_2_dp*cos_delta + v2*(v1-v2)*sin_delta);

    v1+=theta_1_dp*dt; v2+=theta_2_dp*dt; th1+=v1*dt; th2+=v2*dt; t0+=dt;
  }

  log("Simulazione completata.");
  drawChart(dati, rumore);
  prepareDownload(dati, rumore);
}

function drawChart(dati, rumore){
  const ctx=document.getElementById('chart').getContext('2d');
  if(chart){chart.destroy(); chart=null;}
  chart=new Chart(ctx,{
    type:'line',
    data:{datasets:[
      {label:'dati (pt)', data:dati, parsing:{xAxisKey:'x',yAxisKey:'y'}, borderColor:'blue', borderWidth:1, pointRadius:0},
      {label:'rumore_base (sa)', data:rumore, parsing:{xAxisKey:'x',yAxisKey:'y'}, borderColor:'red', borderWidth:1, pointRadius:0}
    ]},
    options:{responsive:true, animation:false, scales:{x:{type:'linear', title:{display:true, text:'Tempo'}}, y:{title:{display:true,text:'Valore'}}}}
  });
}

function prepareDownload(dati, rumore){
  const datiTxt=dati.map(p=>`${p.x} ${p.y}`).join('\n');
  const rumoreTxt=rumore.map(p=>`${p.x} ${p.y}`).join('\n');
  const blob1=new Blob([datiTxt],{type:'text/plain'});
  const blob2=new Blob([rumoreTxt],{type:'text/plain'});
  downloadBtn.disabled=false;
  downloadBtn.onclick=()=>{
    const a1=document.createElement('a');
    a1.href=URL.createObjectURL(blob1); a1.download='dati.txt'; document.body.appendChild(a1); a1.click(); a1.remove();
    const a2=document.createElement('a');
    a2.href=URL.createObjectURL(blob2); a2.download='rumore_base.txt'; document.body.appendChild(a2); a2.click(); a2.remove();
    log("Download avviato per dati.txt e rumore_base.txt");
  };
}
