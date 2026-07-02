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

const sankey = d3.sankey()
  .nodeAlign(d3.sankeyLeft)
  .nodeWidth(22)
  .nodePadding(20)
  .extent([[40,40],[width-40,height-40]]);

const graph = sankey({
  nodes: nodes.map(d => ({...d})),
  links: links.map(d => ({...d}))
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
  .attr("class","node");

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
``
