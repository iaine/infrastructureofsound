const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let audioCtx;

// --- USER CONTROL FLAGS ---
let audioEnabled = false;
let parametersEnabled = false;

document.getElementById("start").onclick = () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioEnabled = true;
};

document.getElementById("paramsToggle").onchange = (e) => {
  parametersEnabled = e.target.checked;
};

// --- DATA (simplified from your JSON) ---
const stages = ["capture", "dsp"];

const modules = {
  capture: [
    { name: "Awebview", ops: ["audiorecord"], params: { sample_rate: 48000, bitrate: 30000 } },
    { name: "audioeffect", ops: ["aaudio"], params: { sample_rate: 44100 } },
    { name: "live_cast", ops: ["recorder"], params: { bitrate: 16000 } }
  ],
  dsp: [
    { name: "audioeffect", ops: ["aec", "agc", "ns_"], params: { sample_rate: 16000 } },
    { name: "ttwebview", ops: ["agc", "ns_"], params: { bitrate: 192 } },
    { name: "live_cast", ops: ["aec"], params: {} }
  ]
};

// --- NODE + LINK BUILD ---
let nodes = [];
let links = [];

const xSpacing = canvas.width / stages.length;

stages.forEach((stage, si) => {
  modules[stage].forEach((m, mi) => {
    nodes.push({
      ...m,
      id: stage + "_" + m.name,
      stage,
      x: 150 + si * xSpacing,
      y: 100 + mi * 120,
      r: 18,
      weight: 0
    });
  });
});

// link reuse modules across stages
nodes.forEach(a => {
  nodes.forEach(b => {
    if (a !== b && a.name === b.name) {
      links.push({ source: a, target: b });
    }
  });
});

// compute weights
nodes.forEach(n => {
  n.weight = links.filter(l => l.target === n).length;
});

// --- DRAW ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // links
  links.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l.source.x, l.source.y);
    ctx.lineTo(l.target.x, l.target.y);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
  });

  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = "#87CEEB";
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.fillText(n.name, n.x - 20, n.y - 25);
  });
}

draw();

// --- DRAG ---
let dragNode = null;

canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  nodes.forEach(n => {
    if (Math.hypot(mx - n.x, my - n.y) < n.r) {
      dragNode = n;
      if (audioEnabled) playNode(n);
    }
  });
};

canvas.onmousemove = (e) => {
  if (!dragNode) return;
  const rect = canvas.getBoundingClientRect();
  dragNode.x = e.clientX - rect.left;
  dragNode.y = e.clientY - rect.top;
  draw();
};

canvas.onmouseup = () => dragNode = null;

// --- AUDIO CORE ---

function playNode(node) {

  let t = audioCtx.currentTime;

  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();

  let baseFreq = 200 + stages.indexOf(node.stage) * 250;

  // PARAMETER MAPPING (user toggle)
  if (parametersEnabled && node.params.sample_rate) {
    baseFreq *= node.params.sample_rate / 16000;
  }

  osc.frequency.value = baseFreq;

  // --- TIMBRE CHAIN ---
  let input = osc;

  // AEC → delay (echo cancel simulation becomes echo artifact)
  if (node.ops.includes("aec")) {
    let delay = audioCtx.createDelay();
    delay.delayTime.value = 0.1;
    input.connect(delay);
    input = delay;
  }

  // AGC → compressor
  if (node.ops.includes("agc")) {
    let comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -30;
    comp.ratio.value = 8;
    input.connect(comp);
    input = comp;
  }

  // NS → noise layer
  let noiseGain;
  if (node.ops.includes("ns_")) {
    let bufferSize = audioCtx.sampleRate * 0.1;
    let noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    let data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    let noise = audioCtx.createBufferSource();
    let nGain = audioCtx.createGain();
    nGain.gain.value = 0.05 * (node.weight + 1);

    noise.buffer = noiseBuffer;
    noise.loop = true;

    noise.connect(nGain).connect(gain);
    noise.start();

    noiseGain = nGain;
  }

  // BITRATE → distortion
  if (parametersEnabled && node.params.bitrate) {
    let shaper = audioCtx.createWaveShaper();
    let k = node.params.bitrate / 300;

    let curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      let x = i * 2 / 255 - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }

    shaper.curve = curve;

    input.connect(shaper);
    input = shaper;
  }

  // connect chain
  input.connect(gain);
  gain.connect(audioCtx.destination);

  // envelope
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2 * (node.weight + 1), t + 0.02);
  gain.gain.linearRampToValueAtTime(0, t + 0.2);

  osc.start(t);
  osc.stop(t + 0.2);
}
