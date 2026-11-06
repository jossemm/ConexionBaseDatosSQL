// js/dashboards-gc.js - Google Charts (Dashboards 1, 2 y 3) + Paginación y Filtros
google.charts.load('current', {'packages':['corechart', 'bar', 'line']});

let dashboardActual = 1;
let paginaActual = 1;
const filasPorPagina = 5;

let datosRaw = [];
let datosFiltrados = [];
let columnasActuales = [];

document.addEventListener("DOMContentLoaded", () => {
  google.charts.setOnLoadCallback(() => {
    cambiarDashboard(1);
  });
});

function cambiarDashboard(id) {
  dashboardActual = id;
  paginaActual = 1;

  document.querySelectorAll(".dash-btn").forEach((btn, index) => {
    btn.classList.toggle("active", (index + 1) === id);
  });

  resetearFiltros(false);
  consultarBackend(id);
}

async function consultarBackend(id) {
  const chartCanvas = document.getElementById("chart-canvas");
  const tbody = document.getElementById("tabla-body");
  const kpiContainer = document.getElementById("kpi-container");
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.getElementById("status-text");

  // Estado de carga inicial
  chartCanvas.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:350px; color:#64748b;">🔄 Conectando con API...</div>`;
  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:#64748b;">Consultando registros...</td></tr>`;

  const mapEndpoints = {
    1: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCCION,
    2: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CLASIFICACION,
    3: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.VENTAS,
    4: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SANIDAD,
    5: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.INVENTARIO,
    6: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GALPONES
  };

  try {
    const res = await fetch(mapEndpoints[id]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    datosRaw = await res.json();
    datosFiltrados = [...datosRaw];

    statusDot.className = "status-dot online";
    statusText.innerText = "Base de Datos Conectada";

    if (!datosRaw || datosRaw.length === 0) {
      mostrarEstadoVacio("No hay registros disponibles en la base de datos para este tablero.");
      return;
    }

    renderizarDashboard(id);

  } catch (error) {
    statusDot.className = "status-dot offline";
    statusText.innerText = "Sin conexión al Backend";
    mostrarEstadoError(`Esperando que el backend esté encendido en: ${mapEndpoints[id]}`);
  }
}

function mostrarEstadoVacio(msg) {
  document.getElementById("chart-canvas").innerHTML = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:350px; color:#64748b;">
      <span style="font-size:2.5rem; margin-bottom:8px;">📭</span>
      <p style="font-weight:600;">${msg}</p>
    </div>`;
  document.getElementById("tabla-body").innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">Tabla vacía (0 registros)</td></tr>`;
  document.getElementById("kpi-container").innerHTML = `<div class="dash-kpi"><h4>Estado</h4><div class="val">0</div><div class="trend">Sin datos</div></div>`;
  document.getElementById("registros-count").innerText = "0 registros";
}

function mostrarEstadoError(msg) {
  document.getElementById("chart-canvas").innerHTML = `
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:350px; color:#ef4444; background:#fef2f2; border-radius:8px; border:1px dashed #fca5a5;">
      <span style="font-size:2.5rem; margin-bottom:8px;">⚠️</span>
      <p style="font-weight:700;">Backend no disponible</p>
      <p style="font-size:0.85rem; color:#b91c1c; margin-top:4px;">${msg}</p>
    </div>`;
  document.getElementById("tabla-body").innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#ef4444; font-weight:600;">Esperando respuesta de la base de datos...</td></tr>`;
  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi" style="border-color:#fca5a5; background:#fff5f5;"><h4>Conexión</h4><div class="val" style="color:#ef4444;">Offline</div><div class="trend" style="color:#b91c1c;">Revisar Backend</div></div>`;
  document.getElementById("registros-count").innerText = "Desconectado";
}

function renderizarDashboard(id) {
  if (id === 1) renderDash1();
  else if (id === 2) renderDash2();
  else if (id === 3) renderDash3();
  else if (id === 4) renderDash4_Sanidad();
  else if (id === 5) renderDash5_Inventario();
  else if (id === 6) renderDash6_Galpones();
}

/* Tablero 1: Producción */
function renderDash1() {
  document.getElementById("dash-title").innerText = "Dashboard 1: Producción Diaria y Tasa de Postura";
  document.getElementById("dash-engine").innerText = "Motor: Google Charts (LineChart)";
  document.getElementById("chart-title").innerText = "Curva de Producción de Huevos por Día";

  const totalHuevos = datosFiltrados.reduce((acc, c) => acc + (parseInt(c.recolectados) || 0), 0);
  const posturaProm = (datosFiltrados.reduce((acc, c) => acc + (parseFloat(c.postura) || 0), 0) / (datosFiltrados.length || 1)).toFixed(1);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Total Recolectados</h4><div class="val">${totalHuevos.toLocaleString()}</div><div class="trend" style="color:#10b981;">▲ Datos en vivo</div></div>
    <div class="dash-kpi"><h4>Tasa Postura</h4><div class="val">${posturaProm}%</div><div class="trend" style="color:#10b981;">Promedio calculado</div></div>
    <div class="dash-kpi"><h4>Días Analizados</h4><div class="val">${datosFiltrados.length}</div><div class="trend">Registros</div></div>
    <div class="dash-kpi"><h4>Meta Diaria</h4><div class="val">11,000</div><div class="trend">Estándar granja</div></div>
  `;

  dibujarGraficoGoogle1(datosFiltrados);
  renderTabla([
    { key: "fecha", label: "Fecha" },
    { key: "galpon", label: "Galpón" },
    { key: "lote", label: "Lote" },
    { key: "recolectados", label: "Huevos Recolectados" },
    { key: "postura", label: "Tasa Postura (%)" }
  ]);
}

function dibujarGraficoGoogle1(datos) {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Fecha');
  data.addColumn('number', 'Huevos');

  datos.forEach(r => {
    const f = r.fecha ? String(r.fecha).substring(0, 10) : '';
    data.addRow([`${f} (${r.galpon || ''})`, parseInt(r.recolectados) || 0]);
  });

  const options = {
    height: 380,
    colors: ['#10b981'],
    hAxis: { title: 'Fecha' },
    vAxis: { title: 'Huevos Recolectados' },
    legend: { position: 'none' },
    curveType: 'function'
  };

  new google.visualization.LineChart(document.getElementById('chart-canvas')).draw(data, options);
}

/* Tablero 2: Clasificación */
function renderDash2() {
  document.getElementById("dash-title").innerText = "Dashboard 2: Calibres y Clasificación de Huevo";
  document.getElementById("dash-engine").innerText = "Motor: Google Charts (ColumnChart)";
  document.getElementById("chart-title").innerText = "Distribución de Calibres por Galpón";

  const totalJumbo = datosFiltrados.reduce((a, b) => a + (parseInt(b.jumbo) || 0), 0);
  const totalExtra = datosFiltrados.reduce((a, b) => a + (parseInt(b.extra) || 0), 0);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Jumbo Total</h4><div class="val">${totalJumbo.toLocaleString()}</div><div class="trend">Unidades</div></div>
    <div class="dash-kpi"><h4>Extra Grande</h4><div class="val">${totalExtra.toLocaleString()}</div><div class="trend">Unidades</div></div>
    <div class="dash-kpi"><h4>Calibres</h4><div class="val">5</div><div class="trend">Jumbo a Pequeño</div></div>
    <div class="dash-kpi"><h4>Estado Clasificación</h4><div class="val">Activo</div><div class="trend" style="color:#10b981;">Al 100%</div></div>
  `;

  dibujarGraficoGoogle2(datosFiltrados);
  renderTabla([
    { key: "galpon", label: "Galpón" },
    { key: "fecha", label: "Fecha" },
    { key: "jumbo", label: "Jumbo" },
    { key: "extra", label: "Extra Grande" },
    { key: "grande", label: "Grande" },
    { key: "mediano", label: "Mediano" },
    { key: "pequeno", label: "Pequeño" }
  ]);
}

function dibujarGraficoGoogle2(datos) {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Galpón');
  data.addColumn('number', 'Jumbo');
  data.addColumn('number', 'Extra Grande');
  data.addColumn('number', 'Grande');
  data.addColumn('number', 'Mediano');
  data.addColumn('number', 'Pequeño');

  datos.forEach(r => {
    data.addRow([
      r.galpon || '',
      parseInt(r.jumbo) || 0,
      parseInt(r.extra) || 0,
      parseInt(r.grande) || 0,
      parseInt(r.mediano) || 0,
      parseInt(r.pequeno) || 0
    ]);
  });

  const options = {
    height: 380,
    isStacked: true,
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    legend: { position: 'top' }
  };

  new google.visualization.ColumnChart(document.getElementById('chart-canvas')).draw(data, options);
}

/* Tablero 3: Ventas */
function renderDash3() {
  document.getElementById("dash-title").innerText = "Dashboard 3: Facturación Comercial y Cartera";
  document.getElementById("dash-engine").innerText = "Motor: Google Charts (BarChart)";
  document.getElementById("chart-title").innerText = "Facturación por Cliente Mayorista (GTQ)";

  const totalVendido = datosFiltrados.reduce((a, b) => a + (parseFloat(b.total) || 0), 0);

  document.getElementById("kpi-container").innerHTML = `
    <div class="dash-kpi"><h4>Total Facturado</h4><div class="val">Q ${totalVendido.toLocaleString('es-GT', {minimumFractionDigits: 2})}</div><div class="trend" style="color:#10b981;">En base de datos</div></div>
    <div class="dash-kpi"><h4>Facturas Emitidas</h4><div class="val">${datosFiltrados.length}</div><div class="trend">Documentos FEL</div></div>
    <div class="dash-kpi"><h4>Ticket Promedio</h4><div class="val">Q ${(totalVendido / (datosFiltrados.length || 1)).toFixed(2)}</div><div class="trend">Por venta</div></div>
    <div class="dash-kpi"><h4>Cobranza</h4><div class="val">100%</div><div class="trend" style="color:#10b981;">Efectiva</div></div>
  `;

  dibujarGraficoGoogle3(datosFiltrados);
  renderTabla([
    { key: "factura", label: "No. Factura" },
    { key: "cliente", label: "Cliente" },
    { key: "depto", label: "Municipio" },
    { key: "fecha", label: "Fecha" },
    { key: "total", label: "Total (GTQ)" },
    { key: "estado", label: "Estado" }
  ]);
}

function dibujarGraficoGoogle3(datos) {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Cliente');
  data.addColumn('number', 'Total en Quetzales (Q)');

  datos.forEach(r => {
    data.addRow([r.cliente || 'Cliente', parseFloat(r.total) || 0]);
  });

  const options = {
    height: 380,
    colors: ['#2563eb'],
    hAxis: { title: 'Quetzales (Q)' },
    legend: { position: 'none' }
  };

  new google.visualization.BarChart(document.getElementById('chart-canvas')).draw(data, options);
}

/* Filtros y Paginación */
function aplicarFiltros() {
  const busqueda = document.getElementById("filtro-busqueda").value.toLowerCase();
  const galpon = document.getElementById("filtro-galpon").value;
  const fecha = document.getElementById("filtro-fecha").value;

  datosFiltrados = datosRaw.filter(item => {
    const matchBusqueda = JSON.stringify(item).toLowerCase().includes(busqueda);
    let matchGalpon = true;
    if (galpon !== "todos") {
      matchGalpon = (item.galpon === galpon || item.nombre === galpon);
    }
    let matchFecha = true;
    if (fecha !== "todas" && item.fecha) {
      matchFecha = String(item.fecha).startsWith(fecha);
    }
    return matchBusqueda && matchGalpon && matchFecha;
  });

  paginaActual = 1;

  if (datosFiltrados.length === 0) {
    mostrarEstadoVacio("No hay registros que coincidan con los filtros ingresados.");
    return;
  }

  if (dashboardActual === 1) dibujarGraficoGoogle1(datosFiltrados);
  else if (dashboardActual === 2) dibujarGraficoGoogle2(datosFiltrados);
  else if (dashboardActual === 3) dibujarGraficoGoogle3(datosFiltrados);
  else if (dashboardActual === 4) dibujarGraficoD3_4(datosFiltrados);
  else if (dashboardActual === 5) dibujarGraficoD3_5(datosFiltrados);
  else if (dashboardActual === 6) dibujarGraficoD3_6(datosFiltrados);

  renderizarCuerpoTabla();
}

function resetearFiltros(recargar = true) {
  document.getElementById("filtro-busqueda").value = "";
  document.getElementById("filtro-galpon").value = "todos";
  document.getElementById("filtro-fecha").value = "todas";
  if (recargar) {
    datosFiltrados = [...datosRaw];
    renderizarDashboard(dashboardActual);
  }
}

function renderTabla(columnas) {
  columnasActuales = columnas;
  document.getElementById("tabla-head").innerHTML = `<tr>${columnas.map(c => `<th>${c.label}</th>`).join("")}</tr>`;
  renderizarCuerpoTabla();
}

function renderizarCuerpoTabla() {
  const tbody = document.getElementById("tabla-body");
  const total = datosFiltrados.length;
  document.getElementById("registros-count").innerText = `${total} registros`;

  const totalPaginas = Math.ceil(total / filasPorPagina) || 1;
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const slice = datosFiltrados.slice(inicio, fin);

  tbody.innerHTML = slice.map(row => {
    return `<tr>${columnasActuales.map(col => {
      let val = row[col.key];
      if (col.key === 'fecha' && val) val = String(val).substring(0, 10);
      return `<td>${val !== undefined && val !== null ? val : '-'}</td>`;
    }).join("")}</tr>`;
  }).join("");

  document.getElementById("page-info").innerText = `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btn-prev").disabled = (paginaActual === 1);
  document.getElementById("btn-next").disabled = (paginaActual >= totalPaginas);
}

function cambiarPagina(delta) {
  paginaActual += delta;
  renderizarCuerpoTabla();
}