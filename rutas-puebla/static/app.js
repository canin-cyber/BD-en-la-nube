// ============================================
// Mapa con Leaflet
// ============================================
const mapa = L.map("mapa").setView([19.0414, -98.2063], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapa);

let marcadorSeleccionado = null;
const capaParadas = L.layerGroup().addTo(mapa);

// ============================================
// Referencias al DOM
// ============================================
const API = "/paradas";
const form = document.getElementById("form-parada");
const lista = document.getElementById("lista-paradas");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = document.getElementById("btn-guardar");
const titulo = document.getElementById("titulo-formulario");

// Escapa texto del usuario antes de meterlo en innerHTML (evita XSS)
function esc(texto) {
  const d = document.createElement("div");
  d.textContent = String(texto ?? "");
  return d.innerHTML;
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function limpiarFormulario() {
  form.reset();
  document.getElementById("parada-id").value = "";
  btnCancelar.classList.add("oculto");
  btnGuardar.textContent = "Guardar";
  titulo.textContent = "Registrar parada";
}

function textoRutas(rutas) {
  return rutas && rutas.length > 0 ? rutas.map(esc).join(", ") : "Sin rutas";
}

// ============================================
// READ: listar + dibujar marcadores
// ============================================
async function cargarParadas() {
  try {
    const respuesta = await fetch(API);
    if (!respuesta.ok) throw new Error("No se pudo obtener la lista de paradas");
    const datos = await respuesta.json();

    lista.innerHTML = "";
    capaParadas.clearLayers();

    if (!datos.paradas || datos.paradas.length === 0) {
      lista.innerHTML = "<p>No hay paradas registradas.</p>";
      return;
    }

    datos.paradas.forEach(parada => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "parada";
      tarjeta.innerHTML = `
        <h3>${esc(parada.nombre)}</h3>
        <p><strong>ID:</strong> ${esc(parada.id)}</p>
        <p><strong>Colonia:</strong> ${esc(parada.colonia)}</p>
        <p><strong>Municipio:</strong> ${esc(parada.municipio)}</p>
        <p><strong>Coordenadas:</strong> ${parada.latitud}, ${parada.longitud}</p>
        <p><strong>Rutas:</strong> ${textoRutas(parada.rutas)}</p>
        <p><strong>Estado:</strong> ${parada.activa ? "Activa" : "Inactiva"}</p>
        <div class="acciones">
          <button class="btn-editar" data-id="${esc(parada.id)}">Editar</button>
          <button class="btn-eliminar" data-id="${esc(parada.id)}">Eliminar</button>
          <button class="btn-ubicar" data-id="${esc(parada.id)}">Ver en mapa</button>
        </div>
      `;
      lista.appendChild(tarjeta);

      const marcador = L.marker([parada.latitud, parada.longitud]).addTo(capaParadas);
      marcador.bindPopup(`
        <strong>${esc(parada.nombre)}</strong><br>
        ${esc(parada.colonia)}<br>
        Rutas: ${textoRutas(parada.rutas)}
      `);
      marcador.bindTooltip(parada.nombre);
    });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

// ============================================
// CREATE / UPDATE: enviar formulario
// ============================================
form.addEventListener("submit", async evento => {
  evento.preventDefault();

  const id = document.getElementById("parada-id").value;
  const rutas = document.getElementById("rutas").value
    .split(",")
    .map(ruta => ruta.trim())
    .filter(ruta => ruta !== "");

  const datos = {
    nombre: document.getElementById("nombre").value,
    colonia: document.getElementById("colonia").value,
    municipio: "Puebla",
    latitud: parseFloat(document.getElementById("latitud").value),
    longitud: parseFloat(document.getElementById("longitud").value),
    rutas,
    activa: document.getElementById("activa").value === "true"
  };

  const url = id ? `${API}/${id}` : API;
  const metodo = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      const detalle = Array.isArray(error.detail)
        ? "Datos inválidos: revisa el formulario"
        : error.detail;
      throw new Error(detalle || "Error al guardar");
    }

    mostrarMensaje(
      id ? "Parada actualizada correctamente." : "Parada registrada correctamente.",
      "exito"
    );
    limpiarFormulario();
    cargarParadas();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

// ============================================
// Editar / Eliminar / Ubicar
// ============================================
async function cargarParadaParaEditar(id) {
  try {
    const respuesta = await fetch(`${API}/${id}`);
    if (!respuesta.ok) throw new Error("No se encontró la parada");
    const parada = await respuesta.json();

    document.getElementById("parada-id").value = parada.id;
    document.getElementById("nombre").value = parada.nombre;
    document.getElementById("colonia").value = parada.colonia;
    document.getElementById("latitud").value = parada.latitud;
    document.getElementById("longitud").value = parada.longitud;
    document.getElementById("rutas").value = parada.rutas.join(", ");
    document.getElementById("activa").value = parada.activa.toString();

    btnCancelar.classList.remove("oculto");
    btnGuardar.textContent = "Actualizar";
    titulo.textContent = "Editar parada";
    form.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

async function eliminarParada(id) {
  if (!confirm("¿Deseas eliminar esta parada?")) return;
  try {
    const respuesta = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("No se pudo eliminar la parada.");
    mostrarMensaje("Parada eliminada correctamente.", "exito");
    cargarParadas();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

async function ubicarParadaEnMapa(id) {
  try {
    const respuesta = await fetch(`${API}/${id}`);
    if (!respuesta.ok) throw new Error("No se encontró la parada");
    const parada = await respuesta.json();

    if (marcadorSeleccionado) mapa.removeLayer(marcadorSeleccionado);

    marcadorSeleccionado = L.marker([parada.latitud, parada.longitud]).addTo(mapa);
    marcadorSeleccionado
      .bindPopup(`
        <strong>${esc(parada.nombre)}</strong><br>
        ${esc(parada.colonia)}<br>
        Rutas: ${textoRutas(parada.rutas)}
      `)
      .openPopup();

    mapa.setView([parada.latitud, parada.longitud], 16);
    document.querySelector(".panel-mapa").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

lista.addEventListener("click", evento => {
  const boton = evento.target;
  const id = boton.dataset.id;
  if (!id) return;

  if (boton.classList.contains("btn-editar")) cargarParadaParaEditar(id);
  if (boton.classList.contains("btn-eliminar")) eliminarParada(id);
  if (boton.classList.contains("btn-ubicar")) ubicarParadaEnMapa(id);
});

btnCancelar.addEventListener("click", limpiarFormulario);
document.getElementById("btn-recargar").addEventListener("click", cargarParadas);

cargarParadas();
