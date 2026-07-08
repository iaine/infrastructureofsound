let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

document.body.addEventListener(
  "click",
  () => initAudio(),
  { once: true }
);

const stageFrequency = {
  capture: 220,
  dsp: 330,
  features: 440,
  inference: 550,
  output: 660
};

function playNodeSound(nodeData) {

  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  let currentNode = osc;

  osc.type = "sawtooth";

  osc.frequency.value =
      stageFrequency[nodeData.stage] || 440;

  //
  // DSP mappings
  //

  if (nodeData.operations.includes("aec")) {

    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.12;

    currentNode.connect(delay);
    currentNode = delay;
  }

  if (nodeData.operations.includes("agc")) {

    const comp =
      audioCtx.createDynamicsCompressor();

    comp.threshold.value = -30;
    comp.ratio.value = 10;

    currentNode.connect(comp);
    currentNode = comp;
  }

  if (
    nodeData.operations.includes("ns_") ||
    nodeData.operations.includes("denoise")
  ) {

    const filter =
      audioCtx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 1200;

    currentNode.connect(filter);
    currentNode = filter;
  }

  currentNode.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(
    0.25,
    now + 0.03
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.4
  );

  osc.start(now);
  osc.stop(now + 0.45);
}

//drag n drop

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if (file) {
        loadFlowFile(file);
    }
});

dropZone.addEventListener("dragover", e => {

    e.preventDefault();
    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", e => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (file) {
        loadFlowFile(file);
    }
});

async function loadFlowFile(file) {

    const text = await file.text();

    const json = JSON.parse(text);

    const sankeyData = convertChainsToSankey(json);

    renderSankey(sankeyData);
}

function convertChainsToSankey(data) {

    const nodes = [];
    const links = [];

    const nodeMap = new Map();

    const stages = [
        "capture",
        "dsp",
        "features",
        "inference",
        "output"
    ];

    function getNode(name, stage, ops = []) {

        const id = `${stage}:${name}`;

        if (!nodeMap.has(id)) {

            nodeMap.set(id, {
                id,
                name,
                stage,
                operations: ops
            });

            nodes.push(nodeMap.get(id));
        }

        return nodeMap.get(id);
    }

    stages.forEach((stage, index) => {

        const mods = data.chains?.[stage] || [];

        mods.forEach(mod => {

            getNode(
                mod.module || mod.name,
                stage,
                mod.operations || []
            );
        });

    });

    for (let i = 0; i < stages.length - 1; i++) {

        const current = data.chains?.[stages[i]] || [];
        const next = data.chains?.[stages[i + 1]] || [];

        current.forEach(sourceModule => {

            next.forEach(targetModule => {

                const sourceName =
                    sourceModule.module || sourceModule.name;

                const targetName =
                    targetModule.module || targetModule.name;

                const sourceNode =
                    getNode(
                        sourceName,
                        stages[i],
                        sourceModule.operations
                    );

                const targetNode =
                    getNode(
                        targetName,
                        stages[i+1],
                        targetModule.operations
                    );

                const op =
                    (sourceModule.operations || [])[0]
                    || "generic";

                links.push({
                    source: sourceNode.id,
                    target: targetNode.id,
                    value: 1,
                    operation: op
                });

            });

        });

    }

    return {
        nodes,
        links
    };
}

//vis


const width = 1600;
const height = 900;

const stageColors = {
  capture: "#4A90E2",
  dsp: "#F5A623",
  features: "#9013FE",
  inference: "#7ED321",
  output: "#D0021B"
};

const operationColors = {
  audiorecord: "#3498db",
  aaudio: "#5dade2",
  opensl: "#2471a3",

  agc: "#f39c12",
  aec: "#e67e22",
  ns_: "#c0392b",
  denoise: "#a93226",

  fft: "#8e44ad",
  mel: "#9b59b6",
  mfcc: "#6c3483",
  chroma: "#af7ac5",

  asr: "#27ae60",
  embedding: "#2ecc71",
  recognize: "#239b56",

  upload: "#e74c3c",
  api: "#c0392b",
  recommendation: "#ff5e57"
};

const nodes = [
  {
    name:"Microphone",
    stage:"capture",
    operations:["audiorecord","aaudio"]
  },

  {
    name:"libaudioeffect.so",
    stage:"dsp",
    operations:["aec","agc","ns_"]
  },

  {
    name:"libbmf_hydra.so",
    stage:"features",
    operations:["fft","mel","mfcc"]
  },

  {
    name:"AndroidPitaya",
    stage:"inference",
    operations:["asr","embedding"]
  },

  {
    name:"TikTok API",
    stage:"output",
    operations:["upload","api"]
  }
];

const links = [
  {
    source:0,
    target:1,
    value:8,
    operation:"audiorecord"
  },

  {
    source:1,
    target:2,
    value:7,
    operation:"agc"
  },

  {
    source:1,
    target:2,
    value:5,
    operation:"aec"
  },

  {
    source:1,
    target:2,
    value:4,
    operation:"ns_"
  },

  {
    source:2,
    target:3,
    value:7,
    operation:"fft"
  },

  {
    source:2,
    target:3,
    value:6,
    operation:"mel"
  },

  {
    source:3,
    target:4,
    value:8,
    operation:"asr"
  },

  {
    source:3,
    target:4,
    value:4,
    operation:"embedding"
  }
];

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const stageOrder = {
    capture: 0,
    dsp: 1,
    features: 2,
    inference: 3,
    output: 4
};

const sankey = d3.sankey()
    .nodeWidth(22)
    .nodePadding(15)
    .nodeSort(null)
    .extent([[50,50],[width-50,height-50]]);

const graph = sankey({
  nodes: nodes.map(d => ({...d})),
  links: links.map(d => ({...d}))
});


graph.nodes.forEach(n => {

    const column =
        stageOrder[n.stage];

    const step =
        (width - 100) / 4;

    const x =
        50 + column * step;

    n.x0 = x;
    n.x1 = x + 20;
});

svg.append("g")
  .selectAll("path")
  .data(graph.links)
  .join("path")
  .attr("class","link")
  .attr("d", d3.sankeyLinkHorizontal())
  .attr("stroke", d =>
      operationColors[d.operation] || "#999"
  )
  .attr("stroke-width", d => Math.max(2, d.width))
  .on("mousemove",(event,d)=>{

      tooltip.style.display = "block";
      tooltip.style.left = event.pageX + 10 + "px";
      tooltip.style.top = event.pageY + 10 + "px";

      tooltip.innerHTML =
      `
      <b>${d.operation}</b><br>
      ${d.source.name} → ${d.target.name}<br>
      Weight: ${d.value}
      `;
  })
  .on("mouseout",()=>{
      tooltip.style.display="none";
  });

const node = svg.append("g")
  .selectAll("g")
  .data(graph.nodes)
  .join("g")
  .attr("class", "node")
  .style("cursor", "pointer")
  .on("click", (event, d) => {

      playNodeSound(d);

      d3.select(event.currentTarget)
        .select("rect")
        .transition()
        .duration(100)
        .attr("stroke-width", 5)
        .transition()
        .duration(300)
        .attr("stroke-width", 1);

  });

node.on("mouseover", (event, d) => {

    svg.selectAll(".link")
      .attr("opacity", l =>
        l.source === d || l.target === d
          ? 1
          : 0.1
      );
})
.on("mouseout", () => {

    svg.selectAll(".link")
      .attr("opacity", 0.55);
}).on("click",(event,d)=>{

    playNodeSound({        operations:[d.operation]    });

})

node.append("rect")
  .attr("x", d => d.x0)
  .attr("y", d => d.y0)
  .attr("width", d => d.x1 - d.x0)
  .attr("height", d => d.y1 - d.y0)
  .attr("fill", d => stageColors[d.stage]);

node.append("text")
  .attr("x", d => d.x0 - 10)
  .attr("y", d => (d.y0 + d.y1) / 2)
  .attr("dy","0.35em")
  .attr("text-anchor","end")
  .text(d => d.name);

node.append("title")
  .text(d =>
      `${d.name}
Stage: ${d.stage}
Operations: ${d.operations.join(", ")}`
  );

const tooltip = document.getElementById("tooltip");

const legendData = [
  ["audiorecord","#3498db"],
  ["agc","#f39c12"],
  ["aec","#e67e22"],
  ["ns_","#c0392b"],
  ["fft","#8e44ad"],
  ["mel","#9b59b6"],
  ["asr","#27ae60"],
  ["embedding","#2ecc71"],
  ["upload","#e74c3c"]
];


const legend = d3.select("#legend");

legendData.forEach(d=>{
  const item = legend.append("div")
    .attr("class","legend-item");

  item.append("span")
    .attr("class","legend-colour")
    .style("background",d[1]);

  item.append("span")
    .text(d[0]);
});

//sonification engine

function playNodeSound(nodeData) {

    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);

    masterGain.gain.setValueAtTime(0.15, now);

    const operations = nodeData.operations || [];

    operations.forEach((op, index) => {

        const startTime = now + (index * 0.08);

        switch(op) {

            case "audiorecord":
                playAudioRecord(startTime, masterGain);
                break;

            case "aaudio":
                playAAudio(startTime, masterGain);
                break;

            case "opensl":
                playOpenSL(startTime, masterGain);
                break;

            case "aec":
                playAEC(startTime, masterGain);
                break;

            case "agc":
                playAGC(startTime, masterGain);
                break;

            case "ns_":
            case "noise_suppress":
                playNoiseSuppress(startTime, masterGain);
                break;

            case "fft":
                playFFT(startTime, masterGain);
                break;

            case "mel":
                playMel(startTime, masterGain);
                break;

            case "mfcc":
                playMFCC(startTime, masterGain);
                break;

            case "chroma":
                playChroma(startTime, masterGain);
                break;

            case "asr":
                playASR(startTime, masterGain);
                break;

            case "embedding":
                playEmbedding(startTime, masterGain);
                break;

            case "recognize":
                playRecognize(startTime, masterGain);
                break;

            case "upload":
                playUpload(startTime, masterGain);
                break;

            case "api":
                playAPI(startTime, masterGain);
                break;

            default:
                playDefault(startTime, masterGain);
        }

    });
}

function playAudioRecord(t, output){

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.value = 220;

    gain.gain.setValueAtTime(0.001,t);
    gain.gain.linearRampToValueAtTime(0.3,t+0.02);
    gain.gain.exponentialRampToValueAtTime(0.001,t+0.2);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t+0.2);
}

function playAAudio(t, output){

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = 440;

    gain.gain.value = 0.2;

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t+0.15);
}
function playOpenSL(t, output){

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = 330;

    gain.gain.value = 0.1;

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t+0.12);
}

function playAEC(t, output){

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const delay = audioCtx.createDelay();

    delay.delayTime.value = 0.15;

    osc.frequency.value = 400;

    osc.connect(gain);
    gain.connect(output);

    gain.connect(delay);
    delay.connect(output);

    osc.start(t);
    osc.stop(t+0.3);
}

function playAGC(t, output){

    const osc = audioCtx.createOscillator();
    const comp = audioCtx.createDynamicsCompressor();

    osc.type = "sawtooth";
    osc.frequency.value = 550;

    osc.connect(comp);
    comp.connect(output);

    osc.start(t);
    osc.stop(t+0.2);
}

function playNoiseSuppress(t, output){

    const buffer =
      audioCtx.createBuffer(1, 8000, audioCtx.sampleRate);

    const data = buffer.getChannelData(0);

    for(let i=0;i<data.length;i++){
        data[i]=(Math.random()*2)-1;
    }

    const src = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 900;

    src.buffer = buffer;

    src.connect(filter);
    filter.connect(output);

    src.start(t);
}

function playFFT(t, output){

    const osc = audioCtx.createOscillator();

    osc.type = "sawtooth";
    osc.frequency.value = 880;

    osc.connect(output);

    osc.start(t);
    osc.stop(t+0.15);
}

function playMel(t, output){

    const osc = audioCtx.createOscillator();
    const bp = audioCtx.createBiquadFilter();

    bp.type = "bandpass";
    bp.frequency.value = 1000;

    osc.frequency.value = 500;

    osc.connect(bp);
    bp.connect(output);

    osc.start(t);
    osc.stop(t+0.2);
}

function playMFCC(t, output){

    const carrier = audioCtx.createOscillator();
    const mod = audioCtx.createOscillator();

    const modGain = audioCtx.createGain();

    mod.frequency.value = 120;
    modGain.gain.value = 150;

    carrier.frequency.value = 440;

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.connect(output);

    mod.start(t);
    carrier.start(t);

    mod.stop(t+0.25);
    carrier.stop(t+0.25);
}

function playChroma(t, output){

    [261,329,392].forEach(freq=>{

        const osc = audioCtx.createOscillator();

        osc.frequency.value = freq;
        osc.connect(output);

        osc.start(t);
        osc.stop(t+0.25);
    });
}

function playASR(t, output){

    const osc = audioCtx.createOscillator();

    osc.frequency.setValueAtTime(300,t);
    osc.frequency.exponentialRampToValueAtTime(750,t+0.2);

    osc.connect(output);

    osc.start(t);
    osc.stop(t+0.25);
}

function playEmbedding(t, output){

    [440,660].forEach(freq => {

        const osc = audioCtx.createOscillator();

        osc.frequency.value = freq;

        osc.connect(output);

        osc.start(t);
        osc.stop(t+0.2);
    });
}

function playRecognize(t, output){

    const osc = audioCtx.createOscillator();

    osc.frequency.setValueAtTime(700,t);
    osc.frequency.setValueAtTime(1000,t+0.08);

    osc.connect(output);

    osc.start(t);
    osc.stop(t+0.15);
}

function playUpload(t, output){

    const osc = audioCtx.createOscillator();

    osc.frequency.setValueAtTime(300,t);
    osc.frequency.linearRampToValueAtTime(900,t+0.25);

    osc.connect(output);

    osc.start(t);
    osc.stop(t+0.25);
}

function playAPI(t, output){

    const osc = audioCtx.createOscillator();

    osc.type = "square";
    osc.frequency.value = 1400;

    osc.connect(output);

    osc.start(t);
    osc.stop(t+0.05);
}

function playOperation(op){

    playNodeSound({
        operations:[op]
    });

}

//colours
function operationColor(op) {

    if (["audiorecord","aaudio","opensl"].includes(op))
        return "#3498db";

    if (["aec","agc","ns_","denoise"].includes(op))
        return "#f39c12";

    if (["fft","mel","mfcc","chroma"].includes(op))
        return "#9b59b6";

    if (["asr","embedding","recognize"].includes(op))
        return "#27ae60";

    if (["upload","api","recommend"].includes(op))
        return "#e74c3c";

    return "#999";
}


function renderSankey(data) {

    // Clear previous graph
    d3.select("#chart").selectAll("*").remove();

    const width = 1600;
    const height = 900;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .extent([[50, 50], [width - 50, height - 50]]);

    const graph = sankey({
        nodes: data.nodes.map(d => ({ ...d })),
        links: data.links.map(d => ({ ...d }))
    });

    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .join("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke", d => operationColor(d.operation))
        .attr("stroke-width", d => Math.max(2, d.width));

    const node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .join("g")
        .attr("class", "node")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            playNodeSound(d);
        });

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => stageColors[d.stage] || "#999");

    node.append("text")
        .attr("x", d => d.x0 - 8)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name);
}

