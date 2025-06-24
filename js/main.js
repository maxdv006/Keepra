// ================================
// Sonidos
// ================================
const sonidoGuardar = document.getElementById("sonido-guardar");
const sonidoEliminar = document.getElementById("sonido-eliminar");
sonidoGuardar.volume = 0.2;
sonidoEliminar.volume = 0.2;

// ================================
// Modal de Confirmación Personalizado
// ================================
let modalTipo = "";
let modalIndex = -1;
let modalMostrarFn = null;

const modal = document.getElementById("confirmModal");
const modalMensaje = document.getElementById("modalMensaje");
const btnCancelar = document.getElementById("btnCancelar");
const btnConfirmar = document.getElementById("btnConfirmar");

function eliminarItem(tipo, mostrarFn, index, seccionNombre) {
  modalTipo = tipo;
  modalIndex = index;
  modalMostrarFn = mostrarFn;

  const articulo = seccionNombre === "objetivo" ? "este" : "esta";
  modalMensaje.textContent = `¿Seguro que querés eliminar ${articulo} ${seccionNombre}?`;
  modal.classList.remove("hidden");
}

btnCancelar.onclick = () => {
  modal.classList.add("hidden");
};

btnConfirmar.onclick = () => {
  const lista = JSON.parse(localStorage.getItem(modalTipo));
  if (!lista || modalIndex < 0) return;

  const ul = document.getElementById(`lista${capitalize(modalTipo)}`);
  const li = ul?.children?.[modalIndex];

  const eliminarYActualizar = () => {
    lista.splice(modalIndex, 1);
    localStorage.setItem(modalTipo, JSON.stringify(lista));
    modalMostrarFn?.();

    modal.classList.add("hidden");
    modalTipo = "";
    modalIndex = -1;
    modalMostrarFn = null;
  };

  sonidoEliminar.currentTime = 0;
  sonidoEliminar.play();

  if (li) {
    li.classList.add("item-eliminado");
    li.addEventListener("animationend", eliminarYActualizar, { once: true });
  } else {
    eliminarYActualizar();
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================================
// Modal de Fecha para Objetivos y Tareas
// ================================
function mostrarCalendario(callback) {
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.display = "block";
  dateInput.style.margin = "0 auto 20px";
  dateInput.style.padding = "10px";
  dateInput.style.borderRadius = "8px";
  dateInput.style.border = "1px solid #ccc";
  dateInput.style.background = "#2a2a2a";
  dateInput.style.color = "#f5f5f5";
  dateInput.style.fontSize = "1rem";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <p>Seleccioná una fecha:</p>
    </div>
  `;

  const content = modal.querySelector(".modal-content");
  content.appendChild(dateInput);

  const botones = document.createElement("div");
  botones.className = "modal-botones";
  botones.innerHTML = `
    <button class="btn-cancelar">Cancelar</button>
    <button class="btn-eliminar">Guardar</button>
  `;
  content.appendChild(botones);

  document.body.appendChild(modal);

  botones.querySelector(".btn-cancelar").onclick = () => {
    document.body.removeChild(modal);
  };

  botones.querySelector(".btn-eliminar").onclick = () => {
    const fecha = dateInput.value;
    if (fecha) callback(fecha);
    document.body.removeChild(modal);
  };
}

// ================================
// Funciones Generales
// ================================
function agregarItemConFecha(tipo, inputId, listaId, mostrarFn) {
  const input = document.getElementById(inputId);
  const texto = input.value.trim();
  if (!texto) return;

  mostrarCalendario((fecha) => {
    let lista = JSON.parse(localStorage.getItem(tipo)) || [];
    lista.push({ texto, fecha });
    localStorage.setItem(tipo, JSON.stringify(lista));
    mostrarFn();
    input.value = "";

    sonidoGuardar.currentTime = 0;
    sonidoGuardar.play();
  });
}

function agregarItem(tipo, inputId, listaId, mostrarFn) {
  const input = document.getElementById(inputId);
  const texto = input.value.trim();
  if (!texto) return;

  let lista = JSON.parse(localStorage.getItem(tipo)) || [];
  lista.push(texto);
  localStorage.setItem(tipo, JSON.stringify(lista));
  mostrarFn();
  input.value = "";

  sonidoGuardar.currentTime = 0;
  sonidoGuardar.play();
}

function mostrarItems(tipo, listaId, eliminarFn) {
  let lista = JSON.parse(localStorage.getItem(tipo)) || [];

  // Ordenar por fecha si el objeto tiene propiedad "fecha"
  if (lista.length && typeof lista[0] === "object" && "fecha" in lista[0]) {
    lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  const ul = document.getElementById(listaId);
  ul.innerHTML = "";

  lista.forEach((item, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");

    const template = document.getElementById("icono-eliminar");
    const svg = template.content.firstElementChild.cloneNode(true);
    btn.appendChild(svg);
    btn.onclick = () => eliminarFn(index);

    const texto = typeof item === "string"
      ? item
      : `${item.texto} — ${item.fecha}`;

    li.textContent = texto;
    li.appendChild(btn);
    li.classList.add("item-agregado");
    ul.appendChild(li);
  });
}

// ================================
// Objetivos
// ================================
function agregarObjetivo() {
  agregarItemConFecha("objetivos", "nuevoObjetivo", "listaObjetivos", mostrarObjetivos);
}
function mostrarObjetivos() {
  mostrarItems("objetivos", "listaObjetivos", eliminarObjetivo);
}
function eliminarObjetivo(index) {
  eliminarItem("objetivos", mostrarObjetivos, index, "objetivo");
}

// ================================
// Tareas
// ================================
function agregarTarea() {
  agregarItemConFecha("tareas", "nuevaTarea", "listaTareas", mostrarTareas);
}
function mostrarTareas() {
  mostrarItems("tareas", "listaTareas", eliminarTarea);
}
function eliminarTarea(index) {
  eliminarItem("tareas", mostrarTareas, index, "tarea");
}

// ================================
// Notas
// ================================
function agregarNota() {
  agregarItem("notas", "nuevaNota", "listaNotas", mostrarNotas);
}
function mostrarNotas() {
  mostrarItems("notas", "listaNotas", eliminarNota);
}
function eliminarNota(index) {
  eliminarItem("notas", mostrarNotas, index, "nota");
}

// ================================
// Inicializar al cargar
// ================================
mostrarObjetivos();
mostrarTareas();
mostrarNotas();

// ================================
// Menú lateral (móvil y PC)
// ================================
const menuToggle = document.getElementById("menuToggle");
const menuLateral = document.getElementById("menuLateral");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
  menuLateral.classList.add("abierto");
  overlay.classList.add("mostrar");
});

overlay.addEventListener("click", () => {
  menuLateral.classList.remove("abierto");
  overlay.classList.remove("mostrar");
});

