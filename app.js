const HISTORY_KEY = 'probHistory';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2); }
function delay(ms) { return new Promise((res) => setTimeout(res, ms)); }

function fiveProb(p) { return Math.pow(p / 100, 5) * 100; }

const probInput = document.getElementById('probInput');
const runBtn = document.getElementById('runBtn');
const statusText = document.getElementById('statusText');
const nonceVal = document.getElementById('nonceVal');
const hashVal = document.getElementById('hashVal');
const probFill = document.getElementById('probFill');
const bigProb = document.getElementById('bigProb');
const resultArea = document.getElementById('resultArea');
const fiveProbEl = document.getElementById('fiveProb');
const statRuns = document.getElementById('statRuns');
const statTries = document.getElementById('statTries');

function updateFiveProb() {
  if (!probInput || !fiveProbEl) return;
  const p = Math.max(1, Math.min(99, Number(probInput.value) || 50));
  fiveProbEl.textContent = fmt(fiveProb(p)) + '%';
}
if (probInput) {
  probInput.addEventListener('input', updateFiveProb);
  updateFiveProb();
}

let running = false;

async function lightPoW(seed) {
  const target = '00';
  let nonce = 0;
  const encoder = new TextEncoder();
  while (true) {
    const data = encoder.encode(seed + ':' + nonce);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (hex.startsWith(target)) return { nonce, hash: hex };
    nonce++;
    if (nonce % 100 === 0) await delay(0);
  }
}

async function proofOfWork(seed, onProgress) {
  const target = '00000';
  let nonce = 0;
  const encoder = new TextEncoder();
  while (true) {
    const data = encoder.encode(seed + ':' + nonce);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    onProgress(nonce, hex);
    if (hex.startsWith(target)) return { nonce, hash: hex };
    nonce++;
    if (nonce % 200 === 0) await delay(0);
  }
}

async function runSequence() {
  if (running) return;
  running = true;
  if (runBtn) runBtn.disabled = true;
  const p = Math.max(1, Math.min(99, Number(probInput.value) || 50));
  resultArea.innerHTML = '';
  let prob = p;
  setProb(prob);
  statusText.textContent = '시작! 🐱';

  let tries = 0;
  while (prob < 80) {
    tries++;
    statusText.textContent = '확률 계산 중... ' + fmt(prob) + '%';
    // light real computation per step
    await lightPoW('step-' + p + '-' + tries + '-' + Date.now());
    await delay(200);
    prob = Math.min(80, prob + (80 - prob) * 0.22 + 0.5);
    setProb(prob);
  }

  // heavy CPU computation at 80%
  statusText.textContent = '80% 도달! CPU 연산 시작 🔥';
  nonceVal.textContent = '0';
  hashVal.textContent = '-';
  const seed = 'prob-' + p + '-' + Date.now();
  const pow = await proofOfWork(seed, (nonce, hex) => {
    nonceVal.textContent = nonce.toLocaleString();
    hashVal.textContent = hex;
    if (nonce % 1000 === 0) statusText.textContent = 'CPU 연산 중 🔥 ' + nonce.toLocaleString() + '회...';
  });

  statusText.textContent = '성공! 🎉';
  resultArea.innerHTML = '<div class="result success"><span class="cat">😺</span>성공! 확률 80% 달성 🎉<br/>시도 ' + tries + '번 후 CPU 연산 성공!<br/><span style="font-size:12px; word-break:break-all;">nonce: ' + pow.nonce + '<br/>hash: ' + pow.hash + '</span></div>';

  const hist = loadHistory();
  hist.unshift({
    date: new Date().toLocaleString('ko-KR'),
    input: p,
    five: fmt(fiveProb(p)),
    tries: pow.nonce,
    nonce: pow.nonce,
  });
  if (hist.length > 50) hist.length = 50;
  saveHistory(hist);

  running = false;
  if (runBtn) runBtn.disabled = false;
  updateStats();
}

function setProb(prob) {
  const v = Math.min(100, Math.max(0, prob));
  bigProb.textContent = fmt(v) + '%';
  probFill.style.width = v + '%';
  probFill.textContent = fmt(v) + '%';
}

if (runBtn) runBtn.addEventListener('click', runSequence);

function updateStats() {
  if (!statRuns) return;
  const h = loadHistory();
  statRuns.textContent = h.length;
  if (h.length) {
    const avg = h.reduce((a, b) => a + (b.tries || 0), 0) / h.length;
    statTries.textContent = Math.round(avg).toLocaleString();
  } else {
    statTries.textContent = '0';
  }
}
updateStats();

// ---- History page ----
const historyList = document.getElementById('historyList');
const clearBtn = document.getElementById('clearBtn');

function renderHistory() {
  if (!historyList) return;
  const h = loadHistory();
  if (!h.length) {
    historyList.innerHTML = '<div style="text-align:center; color:#8b7355; padding:20px;">기록이 없어요 🐱</div>';
    return;
  }
  historyList.innerHTML = h.map((r) => {
    return `<div class="history-item">
      <div class="head">
        <span>🐾 ${r.date}</span>
        <span>시드 ${r.input}%</span>
      </div>
      <div style="margin-top:4px;">
        시도 ${ (r.tries || 0).toLocaleString() }회 | 5연속 성공 확률 ${r.five}%
      </div>
      ${r.nonce ? '<div style="font-size:11px; color:#8b7355; word-break:break-all; margin-top:4px;">nonce: ' + r.nonce + '</div>' : ''}
    </div>`;
  }).join('');
}

if (historyList) renderHistory();

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (!confirm('모든 기록을 지울까요? 🐱')) return;
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });
}
