// js/dashboards-d3.js - Dashboards 4, 5 y 6 con D3.js v7

/* Tablero 4: Sanidad */
function renderDash4_Sanidad() {
  document.getElementById("dash-title").innerText = "Dashboard 4: Control Sanitario y Vacunación";
  document.getElementById("dash-engine").innerText = "Motor: D3.js v7 (Donut Chart)";
  document.getElementById("chart-title").innerText = "Aves Inmunizadas por Evento Sanitario";

  const totalAves = datosFiltrados.reduce((a, b) => a + (parseInt(b.aves) || 0), 0);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Aves Tratadas</h4><div class="val">${totalAves.toLocaleString()}</div><div class="trend" style="color:#10b981;">Aves totales</div></div>
    <div class="dash-kpi"><h4>Eventos Sanitarios</h4><div class="val">${datosFiltrados.length}</div><div class="trend">Aplicaciones</div></div>
    <div class="dash-kpi"><h4>Estado</h4><div class="val">Inmune</div><div class="trend" style="color:#10b981;">Plan al día</div></div>
    <div class="dash-kpi"><h4>Bioseguridad</h4><div class="val">100%</div><div class="trend">Filtros activos</div></div>
  `;

  dibujarGraficoD3_4(datosFiltrados);
  renderTabla([
    { key: "id", label: "ID" },
    { key: "lote", label: "Lote" },
    { key: "evento", label: "Tipo Evento" },
    { key: "vacuna", label: "Vacuna / Tratamiento" },
    { key: "fecha", label: "Fecha" },
    { key: "aves", label: "Aves" },
    { key: "estado", label: "Estado" }
  ]);
}

function dibujarGraficoD3_4(datos) {
  const container = d3.select("#chart-canvas");
  container.html("");

  const width = 600, height = 360, margin = 40;
  const radius = Math.min(width, height) / 2 - margin;

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(datos.map(d => d.vacuna))
    .range(["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"]);

  const pie = d3.pie().value(d => parseInt(d.aves) || 0);
  const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.85);

  const arcs = svg.selectAll("arc")
    .data(pie(datos))
    .enter()
    .append("g");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.vacuna))
    .attr("stroke", "#ffffff")
    .style("stroke-width", "2px");

  arcs.append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", "#ffffff")
    .style("font-weight", "bold")
    .text(d => d.data.aves > 500 ? `${d.data.aves}` : "");
}

/* Tablero 5: Inventario */
function renderDash5_Inventario() {
  document.getElementById("dash-title").innerText = "Dashboard 5: Almacén y Stock de Materias Primas";
  document.getElementById("dash-engine").innerText = "Motor: D3.js v7 (Horizontal Bar Chart)";
  document.getElementById("chart-title").innerText = "Stock Actual en Bodega por Insumo";

  const totalStock = datosFiltrados.reduce((a, b) => a + (parseFloat(b.stock) || 0), 0);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Stock Total</h4><div class="val">${totalStock.toLocaleString()}</div><div class="trend" style="color:#10b981;">Libras / Litros</div></div>
    <div class="dash-kpi"><h4>Insumos</h4><div class="val">${datosFiltrados.length}</div><div class="trend">En catálogo</div></div>
    <div class="dash-kpi"><h4>Proveedor Top</h4><div class="val">${datosFiltrados[0] ? datosFiltrados[0].proveedor.substring(0, 15) : '-'}</div><div class="trend">Mayor stock</div></div>
    <div class="dash-kpi"><h4>Reorden</h4><div class="val">Normal</div><div class="trend" style="color:#10b981;">Sin quiebre</div></div>
  `;

  dibujarGraficoD3_5(datosFiltrados);
  renderTabla([
    { key: "id", label: "ID" },
    { key: "nombre", label: "Insumo" },
    { key: "stock", label: "Stock" },
    { key: "unidad", label: "Unidad" },
    { key: "proveedor", label: "Proveedor" }
  ]);
}

function dibujarGraficoD3_5(datos) {
  const container = d3.select("#chart-canvas");
  container.html("");

  const margin = { top: 20, right: 30, bottom: 40, left: 180 };
  const width = 750 - margin.left - margin.right;
  const height = 360 - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 750 360`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const maxVal = d3.max(datos, d => parseFloat(d.stock)) || 100;

  const x = d3.scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([0, width]);

  const y = d3.scaleBand()
    .range([0, height])
    .domain(datos.map(d => d.nombre))
    .padding(0.2);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .style("font-size", "11px");

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("font-size", "11px");

  svg.selectAll("myRect")
    .data(datos)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.nombre))
    .attr("width", d => x(parseFloat(d.stock) || 0))
    .attr("height", y.bandwidth())
    .attr("fill", "#059669")
    .attr("rx", 4);
}

/* Tablero 6: Galpones */
function renderDash6_Galpones() {
  document.getElementById("dash-title").innerText = "Dashboard 6: Capacidad de Alojamiento por Galpón";
  document.getElementById("dash-engine").innerText = "Motor: D3.js v7 (Circle Packing)";
  document.getElementById("chart-title").innerText = "Capacidad Máxima de Aves por Galpón";

  const totalCapacidad = datosFiltrados.reduce((a, b) => a + (parseInt(b.capacidad) || 0), 0);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Capacidad Total</h4><div class="val">${totalCapacidad.toLocaleString()}</div><div class="trend" style="color:#10b981;">Aves totales</div></div>
    <div class="dash-kpi"><h4>Galpones</h4><div class="val">${datosFiltrados.length}</div><div class="trend">Activos</div></div>
    <div class="dash-kpi"><h4>Promedio/Galpón</h4><div class="val">${(totalCapacidad / (datosFiltrados.length || 1)).toFixed(0)}</div><div class="trend">Aves</div></div>
    <div class="dash-kpi"><h4>Sistemas Manejo</h4><div class="val">2</div><div class="trend">Tradicional / Orgánico</div></div>
  `;

  dibujarGraficoD3_6(datosFiltrados);
  renderTabla([
    { key: "id", label: "ID" },
    { key: "nombre", label: "Galpón" },
    { key: "sector", label: "Sector" },
    { key: "capacidad", label: "Capacidad (Aves)" },
    { key: "manejo", label: "Manejo" }
  ]);
}

function dibujarGraficoD3_6(datos) {
  const container = d3.select("#chart-canvas");
  container.html("");

  const width = 600, height = 350;

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  const packData = { name: "Granja", children: datos };
  const pack = d3.pack().size([width, height]).padding(12);

  const root = d3.hierarchy(packData)
    .sum(d => parseInt(d.capacidad) || 0)
    .sort((a, b) => b.value - a.value);

  const nodes = pack(root).descendants().slice(1);

  const node = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => d.data.manejo === "TRADICIONAL" ? "#3b82f6" : "#10b981")
    .attr("opacity", 0.85)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2);

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.2em")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .style("fill", "#ffffff")
    .text(d => d.data.nombre);

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.1em")
    .style("font-size", "10px")
    .style("fill", "#ffffff")
    .text(d => `${d.data.capacidad} aves`);
}