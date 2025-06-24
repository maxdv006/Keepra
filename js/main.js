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

  if (li) {
    sonidoEliminar.currentTime = 0;
    sonidoEliminar.play();

    li.classList.add("item-eliminado");
    li.addEventListener("animationend", eliminarYActualizar, { once: true });
  } else {
    sonidoEliminar.currentTime = 0;
    sonidoEliminar.play();
    eliminarYActualizar();
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================================
// Funciones Genéricas
// ================================
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
  const lista = JSON.parse(localStorage.getItem(tipo)) || [];
  const ul = document.getElementById(listaId);
  ul.innerHTML = "";

  lista.forEach((item, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");

    // SVG del template
    const template = document.getElementById("icono-eliminar");
    const svg = template.content.firstElementChild.cloneNode(true);
    btn.appendChild(svg);

    btn.onclick = () => eliminarFn(index);

    li.textContent = item;
    li.appendChild(btn);
    li.classList.add("item-agregado");
    ul.appendChild(li);
  });
}

// ================================
// Objetivos
// ================================
function agregarObjetivo() {
  agregarItem("objetivos", "nuevoObjetivo", "listaObjetivos", mostrarObjetivos);
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
  agregarItem("tareas", "nuevaTarea", "listaTareas", mostrarTareas);
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
