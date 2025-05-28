// ===================== ESTADO GLOBAL Y FUNCIONALIDADES GENERALES =====================
// Íconos para el botón de visibilidad de la contraseña
const eyeIcons = {
  open: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="eye-icon"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" /></svg>',
  closed: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="eye-icon"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" /><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" /><path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" /></svg>'
};


// Función para añadir el listener al botón de toggle en la vista settings
function addPasswordToggleListener() {
 const toggleButton = document.querySelector(".toggle-button");
 if (!toggleButton) return;
 toggleButton.addEventListener("click", togglePassword);
}

document.addEventListener("DOMContentLoaded", function () {
  // Detecta clics globales para cerrar dropdowns cuando se haga clic fuera
  document.addEventListener("click", function () {
      closeDropdowns();
  });
});

// Función para mostrar/ocultar dropdowns
function showDropdown(event, dropdownId) {
  event.stopPropagation(); // Evita que el clic cierre el menú inmediatamente

  let dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Si el dropdown ya está abierto, lo cierra
  if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
      return;
  }

  // Cierra todos los dropdowns antes de abrir uno nuevo
  closeDropdowns();

  // Muestra el dropdown y lo posiciona correctamente
  dropdown.style.display = "block";
  positionDropdown(event, dropdown);
}

// Función para cerrar todos los dropdowns abiertos
function closeDropdowns() {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
      menu.style.display = "none";
  });
}

// Función para posicionar el dropdown cerca del botón clicado
function positionDropdown(event, dropdown) {
  let rect = event.target.getBoundingClientRect();
  dropdown.style.position = "absolute";
  dropdown.style.top = `${rect.bottom + window.scrollY}px`;  // Coloca debajo del botón
  dropdown.style.left = `${rect.left + window.scrollX}px`;   // Alinea con el botón
  dropdown.style.zIndex = "1000";
}


// Función para alternar la visibilidad de la contraseña
function togglePassword() {
 const passwordInput = document.getElementById("passwordInput");
 const toggleButton = document.querySelector(".toggle-button");
 if (!passwordInput || !toggleButton) return;
 
 // Alternamos la clase "open" y cambiamos el ícono
 toggleButton.classList.toggle("open");
 const isOpen = toggleButton.classList.contains("open");
 toggleButton.innerHTML = isOpen ? eyeIcons.closed : eyeIcons.open;
 passwordInput.type = isOpen ? "text" : "password";
}

// Estado global de la aplicación
const state = {
  currentView: 'home', // Vistas: 'home', 'calendar', 'classes', 'archived', 'settings', 'games', 'sectionDetail', 'contacto', 'gameSolitario', 'gameClassDetail', 'gamePlay'
  currentSection: null, // ID de la sección seleccionada
  currentGameClass: null, // Código de la clase de juego actual
  currentGame: null, // Nombre del juego (modo solitario)
  images: JSON.parse(localStorage.getItem('albumClassImages')) || [],
  classes: JSON.parse(localStorage.getItem('albumClassClasses')) || [],
  settings: JSON.parse(localStorage.getItem('albumClassSettings')) || { email: '', password: '' },
  games: JSON.parse(localStorage.getItem('albumClassGames')) || { available: ["Juego 1", "Juego 2"], classes: [] }
};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  loadState();
  renderView(state.currentView);
  updateNavigation();

  // Eventos del header
  document.querySelector('.menu-btn').addEventListener('click', toggleSidebar);
  document.querySelector('.add-btn').addEventListener('click', openSectionModal);
  document.querySelector('.search-btn').addEventListener('click', handleSearch);
  document.querySelector('.profile-btn').addEventListener('click', () => {
    state.currentView = 'settings';
    renderView('settings');
    updateNavigation();
  });

  // Ajuste responsive
  window.addEventListener('resize', handleResize);
  handleResize();

  // Cerrar modales
  document.getElementById('sectionModalClose').addEventListener('click', closeSectionModal);
  document.getElementById('photoModalClose').addEventListener('click', closePhotoModal);
  document.getElementById('photoNoClassModalClose').addEventListener('click', closePhotoNoClassModal);
  document.getElementById('photoPreviewModalClose').addEventListener('click', closePhotoPreviewModal);

  // Navegación en el sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavClick);
  });

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
      searchBar.addEventListener("input", function () {
        if (this.value.trim() === "") {
          renderView(state.currentView);
        }
      });
      searchBar.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
      });
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search-bar");
  
    if (searchBar) {
      searchBar.addEventListener("input", function () {
        if (this.value.trim() === "") {
          renderView(state.currentView); // Si se borra la búsqueda, recarga la vista
        }
      });
  
      searchBar.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Evita que se recargue la página
          handleSearch();
        }
      });
    }
  });
  
 function handleSearch() {
  const query = document.querySelector(".search-bar").value.trim().toLowerCase();
  if (!query) {
    renderView(state.currentView);
    return;
  }
  if (state.currentView === "home") {
    searchPhotosBySubject(query);
  } else if (state.currentView === "classes") {
    searchSectionsWithPhotos(query);
  } else if (state.currentView === "sectionDetail") {
    // Vuelve a renderizar la vista de detalle de sección filtrando las fotos
    renderView("sectionDetail");
  }
}
  
  /* 🔹 Busca fotos sin clase por asignatura */
  function searchPhotosBySubject(query) {
    const filteredImages = state.images.filter(img => 
      img.subject && img.subject.toLowerCase().includes(query)
    );
  
    document.getElementById("mainContent").innerHTML = filteredImages.length
      ? renderPhotos(filteredImages)
      : `<p style="text-align:center;">No se encontraron fotos sin clase con esa asignatura.</p>`;
  }
  
  /* 🔹 Busca secciones por nombre y muestra sus fotos */
  function searchSectionsWithPhotos(query) {
    const filteredClasses = state.classes.filter(cls => cls.name.toLowerCase().includes(query));
  
    document.getElementById("mainContent").innerHTML = filteredClasses.length
      ? renderClassesView(filteredClasses)
      : `<p style="text-align:center;">No se encontraron secciones con ese nombre.</p>`;
  }
  
  /* 🔹 Renderiza fotos sin clase */
  function renderPhotos(images) {
    return `
      <div class="classes-grid">
        ${images.map(img => `
          <div class="class-card">
            <div class="class-header blue">
              <div class="class-title">${img.subject}</div>
            </div>
            <div class="class-content">
              <div class="thumbnails">
                <img src="${img.data}" alt="${img.description}" loading="lazy" onclick="openPhotoPreview(${img.id}, 'home')">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /* 🔹 Renderiza secciones con sus fotos */
  function renderClassesView(filteredClasses) {
    return `
      <div class="classes-grid">
        ${filteredClasses.map(cls => `
          <div class="class-card" data-id="${cls.id}" onclick="openSectionDetail('${cls.id}')">
            <div class="class-header green">
              <div class="class-title">${cls.name}</div>
            </div>
            <div class="class-footer">
              <small>Código: ${cls.code}</small>
            </div>
            ${cls.photos && cls.photos.length ? `
              <div class="thumbnails">
                ${cls.photos.slice(0, 3).map(photo => `
                  <img src="${photo.data}" alt="${photo.description}" loading="lazy">
                `).join('')}
              </div>
            ` : `<p style="text-align:center;">Sin fotos disponibles</p>`}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search-bar");
  
    if (searchBar) {
      searchBar.addEventListener("input", function () {
        if (this.value.trim() === "") {
          renderView(state.currentView); // Recargar vista si se borra el texto
        }
      });
  
      searchBar.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
      });
    }
  });
  
}

function loadState() {
  state.images = JSON.parse(localStorage.getItem('albumClassImages')) || [];
  state.classes = JSON.parse(localStorage.getItem('albumClassClasses')) || [];
  state.settings = JSON.parse(localStorage.getItem('albumClassSettings')) || { email: '', password: '' };
  state.games = JSON.parse(localStorage.getItem('albumClassGames')) || { available: ["Juego 1", "Juego 2"], classes: [] };
}

function saveState() {
  localStorage.setItem('albumClassImages', JSON.stringify(state.images));
  localStorage.setItem('albumClassClasses', JSON.stringify(state.classes));
  localStorage.setItem('albumClassSettings', JSON.stringify(state.settings));
  localStorage.setItem('albumClassGames', JSON.stringify(state.games));
}

function handleResize() {
  const sidebar = document.querySelector('.sidebar');
  if (window.innerWidth >= 768) {
    sidebar.classList.add('active');
  } else {
    sidebar.classList.remove('active');
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

function updateNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === state.currentView);
  });
}

function handleNavClick(e) {
  const view = e.currentTarget.dataset.view;
  state.currentView = view;
  renderView(view);
  updateNavigation();
  if (window.innerWidth < 768) {
    document.querySelector('.sidebar').classList.remove('active');
  }
}
// 1. Manejar el evento de retroceso con la flecha del navegador
window.addEventListener("popstate", function (event) {
  if (event.state && event.state.view) {
    state.currentView = event.state.view;
    state.currentSection = event.state.section || null;
    renderView(state.currentView);
    updateNavigation();
  }
});

function renderView(view) {
  const mainContent = document.getElementById('mainContent');
  let html = '';

    // Guardar el estado en el historial del navegador, excepto en "home"
    if (view !== "home") {
      history.pushState({ view: view, section: state.currentSection }, "", `#${view}`);
    }

  switch (view) {
    case 'home':
      html = renderHomeView();
      break;
    case 'calendar':
      html = renderCalendarView();
      break;
    case 'classes':
      html = renderClassesView();
      break;
    case 'archived':
      html = renderArchivedView();
      break;
      case 'settings':
        html = renderSettingsView();
        break;
    case 'games':
      html = renderGamesView();
      break;
      case 'sectionDetail':
        html = renderSectionDetailView();
      break;
    case 'contacto':
      html = renderContactoView();
      break;
    case 'gameSolitario':
      html = renderGameSolitarioView();
      break;
    case 'gameClassDetail':
      html = renderGameClassDetailView();
      break;
    case 'gamePlay':
      html = renderGamePlayView();
      break;
    default:
      html = `<p>Vista no encontrada</p>`;
  }
  mainContent.innerHTML = html;
  
  if (view === 'settings') {
    addPasswordToggleListener();
  }
  
  if (view === 'contacto') {
    initContacto();
  }
}

function goBack() {
  if (state.currentView === "home") {
    return; // No hacer nada si está en inicio
  }
  window.history.back();
}

function renderHomeView() {
  if (state.images.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-images"></i>
        <h2>No hay imágenes disponibles</h2>
        <p>Sube tus primeras imágenes usando el botón +</p>
      </div>
    `;
  }
  return `
    <div class="classes-grid">
      ${state.images.map(img => `
        <div class="class-card" data-id="${img.id}">
          <div class="class-header ${getRandomColor()}">
            <div class="class-title">${img.subject}</div>
            <button class="menu-dots" onclick="showImageDropdown(event, '${img.id}')" aria-label="Opciones">
              <i class="fas fa-bars"></i>
            </button>
          </div>
          <div class="class-content">
            <div class="thumbnails">
              <img src="${img.data}" alt="${img.description}" loading="lazy" onclick="openPhotoPreview(${img.id}, 'home')">
            </div>
          </div>
          <div class="class-footer">
            <span>${img.description}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}



function renderClassesView() {
  const activeClasses = state.classes.filter(c => !c.archived);
  if (activeClasses.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-graduation-cap"></i>
        <h2>No tienes secciones creadas</h2>
        <p>Crea tu primera sección usando el botón +</p>
      </div>
    `;
  }
  return `
    <div class="classes-grid">
      ${activeClasses.map(cls => `
        <div class="class-card" data-id="${cls.id}" onclick="openSectionDetail('${cls.id}')">
          <div class="class-header blue">
            <div class="class-title">${cls.name}</div>
            <button class="menu-dots" onclick="showSectionDropdown(event, '${cls.id}')" aria-label="Opciones">
              <i class="fas fa-bars"></i>
            </button>
          </div>
          <div class="class-footer">
            <small>Código: ${cls.code}</small>
          </div>
          ${cls.photos && cls.photos.length ? `
            <div class="thumbnails">
              ${cls.photos.slice(0,3).map(photo => `<img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderArchivedView() {
  const archivedClasses = state.classes.filter(c => c.archived);
  if (archivedClasses.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-archive"></i>
        <h2>No hay secciones archivadas</h2>
        <p>Las secciones archivadas aparecerán aquí.</p>
      </div>
    `;
  }
  return `
    <div class="classes-grid">
      ${archivedClasses.map(cls => `
        <div class="class-card" data-id="${cls.id}" onclick="openSectionDetail('${cls.id}')">
          <div class="class-header gray">
            <div class="class-title">${cls.name}</div>
            <button class="menu-dots" onclick="showSectionDropdown(event, '${cls.id}')" aria-label="Opciones">
              <i class="fas fa-bars"></i>
            </button>
          </div>
          <div class="class-footer">
            <small>Código: ${cls.code}</small>
          </div>
          ${cls.photos && cls.photos.length ? `
            <div class="thumbnails">
              ${cls.photos.slice(0,3).map(photo => `<img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderSettingsView() {
  return `
    <div class="settings-form">
      <h2>Configuración</h2>
      <button class="btn btn-primary" onclick="window.location.href='php/cerrar_sesion.php'">Cerrar sesión</button>
    </div>
  `;
}



function renderSectionDetailView() {
  const cls = state.classes.find(c => c.id == state.currentSection);
  if (!cls) return `<p>Sección no encontrada.</p>`;
  
  const searchQuery = document.querySelector('.search-bar')?.value.trim().toLowerCase() || '';
  let photos = cls.photos || [];
  if (searchQuery) {
    photos = photos.filter(photo => photo.description.toLowerCase().includes(searchQuery));
  }

  const photosHTML = photos.length > 0 ? `
    <div class="classes-grid">
      ${photos.map(photo => `
        <div class="class-card" data-id="${photo.id}">
          <div class="class-header ${getRandomColor()}">
            <div class="class-title">${photo.description}</div>
            <button class="menu-dots" onclick="showPhotoDropdown(event, '${cls.id}', '${photo.id}')" aria-label="Opciones">
              <i class="fas fa-bars"></i>
            </button>
          </div>
          <div class="class-content">
            <div class="thumbnails">
              <img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">
            </div>
          </div>
        </div>
      `).join('')}
    </div>` : `
    <div class="empty-state">
      <i class="fas fa-image"></i>
      <p>No hay fotos en esta sección.</p>
    </div>`;

  return `
    <div class="section-detail">
      <div class="section-header">
        <button class="back-button" onclick="goBack()" aria-label="Regresar">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>${cls.name}</h2>
        <button class="dropdown-toggle" onclick="showSectionDropdown(event, '${cls.id}')">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <p><strong>Código:</strong> ${cls.code}</p>
      <p><strong>Asignatura:</strong> ${cls.subject || '-'}</p>
      <p><strong>Sala:</strong> ${cls.room || '-'}</p>
      <p><strong>Creado:</strong> ${cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : '-'}</p>
      <p class="tema"><strong>Tema de la Sección:</strong> ${cls.tema && cls.tema.trim() !== "" ? cls.tema : 'Sin tema'}</p>
      <hr>
      <h3>Fotos</h3>
      ${photosHTML}
      <div style="margin-top:16px; text-align: center;">
        <button class="dropdown-toggle" onclick="openPhotoModal()">Subir Foto</button>
      </div>
    </div>
  `;
}

function renderCalendarView() {
  if (!window.currentCalendarDate) {
    window.currentCalendarDate = new Date();
  }
  const currentDate = window.currentCalendarDate;
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  let headerHTML = `
    <div class="calendar-header">
      <button class="cal-nav-btn" onclick="changeMonth(-1)">&lt;</button>
      <span>${monthNames[currentMonth]} ${currentYear}</span>
      <button class="cal-nav-btn" onclick="changeMonth(1)">&gt;</button>
    </div>
    <div class="calendar-weekdays">
      ${dayNames.map(day => `<div class="weekday">${day}</div>`).join('')}
    </div>
  `;

  const eventsByDay = {};
  state.classes.forEach(cls => {
    if (!cls.archived && cls.createdAt) {
      const clsDate = new Date(cls.createdAt);
      if (clsDate.getFullYear() === currentYear && clsDate.getMonth() === currentMonth) {
        const day = clsDate.getDate();
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(cls);
      }
    }
  });

  let cellsHTML = '';
  const totalCells = 42;
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  for (let cell = 0; cell < totalCells; cell++) {
    let dayNumber;
    let cellClass = 'calendar-day';
    let eventsHTML = '';
    if (cell < startDayOfWeek) {
      dayNumber = prevMonthLastDay - startDayOfWeek + cell + 1;
      cellClass += ' other-month';
    } else if (cell >= startDayOfWeek + totalDays) {
      dayNumber = cell - startDayOfWeek - totalDays + 1;
      cellClass += ' other-month';
    } else {
      dayNumber = cell - startDayOfWeek + 1;
      if (eventsByDay[dayNumber]) {
        eventsHTML = eventsByDay[dayNumber].map(cls => 
          `<div class="event-info" onclick="openSectionDetail('${cls.id}')" title="${cls.subject} - ${cls.room}">
             <span class="event-subject">${cls.subject}</span><br>
             <span class="event-room">${cls.room}</span>
           </div>`
        ).join('');
      }
    }
    cellsHTML += `
      <div class="${cellClass}">
        <div class="date">${dayNumber}</div>
        <div class="events">${eventsHTML}</div>
      </div>
    `;
  }
  let calendarGridHTML = `<div class="calendar-grid">${cellsHTML}</div>`;
  return headerHTML + calendarGridHTML;
}

function changeMonth(delta) {
  let current = window.currentCalendarDate || new Date();
  window.currentCalendarDate = new Date(current.getFullYear(), current.getMonth() + delta, 1);
  renderView('calendar');
}

function saveSettings() {
  const username = document.getElementById('usernameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  state.settings.username = username;
  state.settings.email = email;
  saveState();
  showToast('Configuración guardada.');
}

function openSectionDetail(sectionId) {
  state.currentSection = sectionId;
  state.currentView = 'sectionDetail';
  renderView('sectionDetail');
  updateNavigation();
}

function openSectionModal() {
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.remove('hidden');
  document.getElementById('createSectionBtn').addEventListener('click', showCreateSectionForm);
  document.getElementById('joinSectionBtn').addEventListener('click', () => {
    showToast('Funcionalidad de unirse a una sección en desarrollo.');
  });
  document.getElementById('uploadNoClassBtn').addEventListener('click', openPhotoNoClassModal);
}

function closeSectionModal() {
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.add('hidden');
  document.getElementById('sectionModalBody').innerHTML = `
    <h3>Selecciona una opción</h3>
    <button id="createSectionBtn">Crear sección</button>
    <button id="joinSectionBtn">Unirse a sección</button>
    <button id="uploadNoClassBtn">Subir foto sin clase</button>
  `;
  document.getElementById('createSectionBtn').addEventListener('click', showCreateSectionForm);
  document.getElementById('joinSectionBtn').addEventListener('click', () => {
    showToast('Funcionalidad de unirse a una sección en desarrollo.');
  });
  document.getElementById('uploadNoClassBtn').addEventListener('click', openPhotoNoClassModal);
}

function showCreateSectionForm() {
  const modalBody = document.getElementById('sectionModalBody');
  modalBody.innerHTML = `
    <h3>Crear Sección</h3>
    <form id="createSectionForm">
      <div class="form-group">
        <label>Nombre de la sección <span style="color:red">*</span></label>
        <input type="text" id="sectionName" required>
      </div>
      <div class="form-group">
        <label>Asignatura</label>
        <input type="text" id="sectionSubject">
      </div>
      <div class="form-group">
        <label>Sala</label>
        <input type="text" id="sectionRoom">
      </div>
      <button type="submit">Crear Sección</button>
    </form>
  `;
  document.getElementById('createSectionForm').addEventListener('submit', handleCreateSection);
}

function handleCreateSection(e) {
  e.preventDefault();
  const name = document.getElementById('sectionName').value.trim();
  const subject = document.getElementById('sectionSubject').value.trim();
  const room = document.getElementById('sectionRoom').value.trim();
  if (!name) {
    showToast('El nombre de la sección es obligatorio.');
    return;
  }
  const newClass = {
    id: Date.now() + Math.random(),
    name: name,
    subject: subject,
    room: room,
    code: generateUniqueCode(),
    photos: [],
    createdAt: new Date().toISOString(),
    archived: false,
    tema: ""
  };
  state.classes.push(newClass);
  saveState();
  renderView('classes');
  closeSectionModal();
  showToast('Sección creada.');
}

function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function showEditSectionForm(sectionId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.remove('hidden');
  const modalBody = document.getElementById('sectionModalBody');
  modalBody.innerHTML = `
    <h3>Editar Sección</h3>
    <form id="editSectionForm">
      <div class="form-group">
        <label>Nombre de la sección <span style="color:red">*</span></label>
        <input type="text" id="editSectionName" value="${cls.name}" required>
      </div>
      <div class="form-group">
        <label>Asignatura</label>
        <input type="text" id="editSectionSubject" value="${cls.subject}">
      </div>
      <div class="form-group">
        <label>Sala</label>
        <input type="text" id="editSectionRoom" value="${cls.room}">
      </div>
      <button type="submit">Guardar Cambios</button>
    </form>
  `;
  document.getElementById('editSectionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    cls.name = document.getElementById('editSectionName').value.trim();
    cls.subject = document.getElementById('editSectionSubject').value.trim();
    cls.room = document.getElementById('editSectionRoom').value.trim();
    saveState();
    renderView('sectionDetail');
    closeSectionModal();
    showToast('Sección actualizada.');
  });
}

function showThemeSection(sectionId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  const nuevoTema = prompt("Introduce el nuevo tema para la sección:", cls.tema || "");
  if (nuevoTema !== null) {
    cls.tema = nuevoTema.trim();
    saveState();
    if (state.currentView === 'sectionDetail' && state.currentSection == sectionId) {
      renderView('sectionDetail');
    } else {
      renderView('classes');
    }
    showToast('Tema actualizado.');
  }
}

function handleDeleteSection(sectionId) {
  if (confirm('¿Estás seguro de eliminar esta sección?')) {
    state.classes = state.classes.filter(c => c.id != sectionId);
    saveState();
    state.currentView = 'classes';
    renderView('classes');
    showToast('Sección eliminada.');
  }
}

function archiveSection(sectionId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  cls.archived = true;
  saveState();
  state.currentView = 'archived';
  renderView('archived');
  showToast('Sección archivada.');
}

function unarchiveSection(sectionId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  cls.archived = false;
  saveState();
  state.currentView = 'classes';
  renderView('classes');
  showToast('Sección desarchivada.');
}

function openPhotoModal() {
  const photoModal = document.getElementById('photoModal');
  photoModal.classList.remove('hidden');
  document.getElementById('photoUploadForm').addEventListener('submit', handlePhotoUpload);
}

function closePhotoModal() {
  const photoModal = document.getElementById('photoModal');
  photoModal.classList.add('hidden');
  document.getElementById('photoUploadForm').reset();
}

async function handlePhotoUpload(e) {
  e.preventDefault();
  const description = document.getElementById('photoDescription').value.trim();
  const file = document.getElementById('photoInput').files[0];
  let temaInput = document.getElementById('photoTema').value.trim();
  if (!description || !file) {
    showToast('Se requiere descripción y foto.');
    return;
  }
  const dataUrl = await readFileAsDataURL(file);
  const cls = state.classes.find(c => c.id == state.currentSection);
  if (!temaInput && cls && cls.tema && cls.tema.trim() !== "") {
    temaInput = cls.tema;
  }
  const newPhoto = {
    id: Date.now() + Math.random(),
    description: description,
    data: dataUrl,
    timestamp: new Date().toISOString(),
    tema: temaInput
  };
  if (!cls.photos) cls.photos = [];
  cls.photos.push(newPhoto);
  saveState();
  renderView('sectionDetail');
  closePhotoModal();
  showToast('Foto subida.');
}

function openPhotoNoClassModal() {
  closeSectionModal();
  const modal = document.getElementById('photoNoClassModal');
  modal.classList.remove('hidden');
  document.getElementById('photoNoClassForm').addEventListener('submit', handlePhotoNoClassUpload);
}

function closePhotoNoClassModal() {
  const modal = document.getElementById('photoNoClassModal');
  modal.classList.add('hidden');
  document.getElementById('photoNoClassForm').reset();
}

async function handlePhotoNoClassUpload(e) {
  e.preventDefault();
  const subject = document.getElementById('photoNoClassSubject').value.trim();
  const description = document.getElementById('photoNoClassDescription').value.trim();
  const file = document.getElementById('photoNoClassInput').files[0];
  if (!subject || !description || !file) {
    showToast('Se requieren asignatura, descripción y foto.');
    return;
  }
  const dataUrl = await readFileAsDataURL(file);
  const newPhoto = {
    id: Date.now() + Math.random(),
    subject: subject,
    description: description,
    data: dataUrl,
    timestamp: new Date().toISOString()
  };
  state.images.push(newPhoto);
  saveState();
  renderView('home');
  closePhotoNoClassModal();
  showToast('Foto subida en Inicio.');
}

function readFileAsDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function openPhotoPreview(photoId, source, sectionId = null) {
  let photo;
  if (source === 'home') {
    photo = state.images.find(p => p.id == photoId);
  } else if (source === 'section') {
    const cls = state.classes.find(c => c.id == sectionId);
    if (cls) photo = cls.photos.find(p => p.id == photoId);
  }
  if (!photo) return;
  const previewModal = document.getElementById('photoPreviewModal');
  const previewImage = document.getElementById('previewImage');
  previewImage.src = photo.data;
  previewImage.classList.remove('zoomed');
  previewImage.style.cursor = 'zoom-in';
  document.getElementById('previewDescription').innerText = photo.description;
  previewModal.classList.remove('hidden');
  enableImagePan(previewImage);
}

function closePhotoPreviewModal() {
  const previewModal = document.getElementById('photoPreviewModal');
  previewModal.classList.add('hidden');
  const previewImage = document.getElementById('previewImage');
  previewImage.style.transform = 'translate(0,0) scale(1)';
  previewImage.style.cursor = 'zoom-in';
}

function enableImagePan(img) {
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX, startY;
  let initialTouchDistance = null;

  img.onmousedown = (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    img.style.cursor = 'grabbing';
  };

  window.onmousemove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  };

  window.onmouseup = () => {
    isDragging = false;
    img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  };

  img.onwheel = (e) => {
    e.preventDefault();
    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.8 : 1.2;
    const newScale = scale * delta;
    if (newScale < 1 || newScale > 5) return;
    posX = offsetX - (offsetX - posX) * (newScale / scale);
    posY = offsetY - (offsetY - posY) * (newScale / scale);
    scale = newScale;
    updateTransform();
    img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  };

  let touchCache = [];
  img.ontouchstart = (e) => {
    touchCache = [...e.touches];
    if (e.touches.length === 2) {
      initialTouchDistance = getTouchDistance(e.touches);
    }
  };

  img.ontouchmove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const newDistance = getTouchDistance(e.touches);
      const newScale = scale * (newDistance / initialTouchDistance);
      if (newScale < 1 || newScale > 5) return;
      scale = newScale;
      initialTouchDistance = newDistance;
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = img.getBoundingClientRect();
      const offsetX = centerX - rect.left;
      const offsetY = centerY - rect.top;
      posX = offsetX - (offsetX - posX) * (scale / (scale));
      posY = offsetY - (offsetY - posY) * (scale / (scale));
      updateTransform();
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      posX += touch.clientX - touchCache[0].clientX;
      posY += touch.clientY - touchCache[0].clientY;
      touchCache = [touch];
      updateTransform();
    }
  };

  img.ontouchend = () => {
    touchCache = [];
    initialTouchDistance = null;
  };

  function updateTransform() {
    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  function getTouchDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  img.ondblclick = () => {
    scale = 1;
    posX = 0;
    posY = 0;
    updateTransform();
    img.style.cursor = 'zoom-in';
  };
}

function showDropdown(options, event) {
  event.stopPropagation();
  const dropdownContainer = document.getElementById('dropdownContainer');
  dropdownContainer.innerHTML = '';
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown-menu';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt.label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      opt.action();
      dropdownContainer.innerHTML = '';
    });
    dropdown.appendChild(btn);
  });
  const rect = event.currentTarget.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
  dropdown.style.left = (rect.left + window.scrollX) + 'px';
  dropdownContainer.appendChild(dropdown);
}

function showSectionDropdown(e, sectionId) {
  e.stopPropagation();
  const cls = state.classes.find(c => c.id == sectionId);
  let options = [];
  if (cls.archived) {
    options.push({ label: 'Desarchivar Sección', action: () => unarchiveSection(sectionId) });
  } else {
    options.push({ label: 'Archivar Sección', action: () => archiveSection(sectionId) });
  }
  options.push({ label: 'Tema', action: () => showThemeSection(sectionId) });
  options = options.concat([
    { label: 'Modificar Sección', action: () => showEditSectionForm(sectionId) },
    { label: 'Eliminar Sección', action: () => handleDeleteSection(sectionId) }
  ]);
  showDropdown(options, e);
}

function showImageDropdown(e, imageId) {
  e.stopPropagation();
  const options = [
    { label: 'Eliminar Foto', action: () => {
        state.images = state.images.filter(img => img.id != imageId);
        saveState();
        renderView('home');
        showToast('Foto eliminada.');
      }
    }
  ];
  showDropdown(options, e);
}

function showPhotoDropdown(e, sectionId, photoId) {
  e.stopPropagation();
  const options = [
    { label: 'Editar Foto', action: () => editPhoto(sectionId, photoId) },
    { label: 'Eliminar Foto', action: () => deletePhoto(sectionId, photoId) }
  ];
  showDropdown(options, e);
}

function editPhoto(sectionId, photoId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  const photo = cls.photos.find(p => p.id == photoId);
  const newDesc = prompt('Editar descripción:', photo.description);
  if (newDesc !== null) {
    photo.description = newDesc.trim();
    saveState();
    renderView('sectionDetail');
    showToast('Foto actualizada.');
  }
}

function deletePhoto(sectionId, photoId) {
  const cls = state.classes.find(c => c.id == sectionId);
  if (!cls) return;
  cls.photos = cls.photos.filter(photo => photo.id != photoId);
  saveState();
  renderView('sectionDetail');
  showToast('Foto eliminada.');
}

function handleSearch() {
  const query = document.querySelector('.search-bar').value.trim().toLowerCase();
  if (state.currentView === 'home') {
    const imagesToRender = state.images.filter(img => {
      return img.description.toLowerCase().includes(query);
    });
    document.getElementById('mainContent').innerHTML = renderHomeView(imagesToRender);
  } else if (state.currentView === 'classes') {
    const filteredClasses = state.classes.filter(cls => {
      return cls.photos && cls.photos.some(photo => photo.description.toLowerCase().includes(query));
    });
    document.getElementById('mainContent').innerHTML = renderClassesView(filteredClasses);
  } else if (state.currentView === 'sectionDetail') {
    renderView('sectionDetail');
  }
}

function getRandomColor() {
  const colors = ['green', 'blue', 'red'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function initContacto() {
  // Inicializa la vista de contacto si es necesario.
}

function renderContactoView() {
  // Se asume que existe un template en HTML con id="contactoTemplate"
  const template = document.getElementById('contactoTemplate');
  return template ? template.innerHTML : `<p>Contacto</p>`;
}

// ===================== MÓDULO DE JUEGOS =====================

function renderGamesView() {
  return `
    <div class="games-view">
      <h2>Juegos Académicos</h2>
      <h3>Clases de Juegos</h3>
      <div class="classes-grid">
        ${state.games.classes && state.games.classes.length 
          ? state.games.classes.map(gameClass => `
            <div class="class-card" data-id="${gameClass.code}" onclick="openGameClassDetail('${gameClass.code}')">
              <div class="class-header blue">
                <div class="class-title">${gameClass.className} - ${gameClass.gameName}</div>
                <button class="menu-dots" onclick="showGameClassDropdown(event, '${gameClass.code}')" aria-label="Opciones">
                  <i class="fas fa-bars"></i>
                </button>
              </div>
              <div class="class-footer">
                <small>Código: ${gameClass.code}</small>
              </div>
            </div>
          `).join('') 
          : `
            <div class="empty-state">
              <i class="fas fa-gamepad"></i>
              <h2>No hay clases de juego creadas</h2>
              <p>Crea una clase para jugar en modo multijugador.</p>
            </div>
          `}
      </div>
      <div class="game-class-controls" style="text-align: center; margin-top: 16px;">
        <button class="btn btn-primary" onclick="showCreateGameClassForm()">Crear Clase de Juego</button>
        <button class="btn btn-secondary" onclick="showJoinGameClassForm()">Unirse a Clase de Juego</button>
      </div>
      <hr>
      <div class="game-modes" style="text-align: center; margin-top: 16px;">
        <h3>Modo de Juego</h3>
        <button class="btn btn-primary" onclick="playGame('Juego Solitario', false)">Modo Solitario</button>
        <button class="btn btn-secondary" onclick="playGame('Juego Multijugador', true)">Modo Multijugador</button>
      </div>
    </div>
  `;
}

function playGame(gameName, isMultiplayer) {
  if (isMultiplayer) {
    showJoinGameClassForm();
  } else {
    state.currentGame = gameName;
    state.currentView = 'gameSolitario';
    renderView('gameSolitario');
    updateNavigation();
  }
}

function showCreateGameClassForm() {
  const modalBody = document.getElementById('sectionModalBody');
  modalBody.innerHTML = `
    <h3>Crear Clase de Juego</h3>
    <form id="createGameClassForm">
      <div class="form-group">
        <label>Nombre del juego</label>
        <input type="text" id="gameName" required>
      </div>
      <div class="form-group">
        <label>Nombre de la clase</label>
        <input type="text" id="gameClassName" required>
      </div>
      <button type="submit" class="btn btn-primary">Crear Clase de Juego</button>
    </form>
  `;
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.remove('hidden');
  document.getElementById('createGameClassForm').addEventListener('submit', handleCreateGameClass);
}

function handleCreateGameClass(e) {
  e.preventDefault();
  const gameName = document.getElementById('gameName').value.trim();
  const className = document.getElementById('gameClassName').value.trim();
  if (!gameName || !className) {
    showToast('Todos los campos son obligatorios.');
    return;
  }
  const uniqueCode = generateUniqueCode();
  const newGameClass = {
    gameName: gameName,
    className: className,
    code: uniqueCode,
    players: [],
    podium: []
  };
  if (!state.games.classes) {
    state.games.classes = [];
  }
  state.games.classes.push(newGameClass);
  saveState();
  renderView('games');
  closeSectionModal();
  showToast('Clase de juego creada.');
}

function showJoinGameClassForm() {
  const modalBody = document.getElementById('sectionModalBody');
  modalBody.innerHTML = `
    <h3>Unirse a Clase de Juego</h3>
    <form id="joinGameClassForm">
      <div class="form-group">
        <label>Código de la Clase</label>
        <input type="text" id="joinGameClassCode" required>
      </div>
      <div class="form-group">
        <label>Tu Nombre</label>
        <input type="text" id="joinGameClassPlayerName" required>
      </div>
      <button type="submit" class="btn btn-secondary">Unirse a Clase de Juego</button>
    </form>
  `;
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.remove('hidden');
  document.getElementById('joinGameClassForm').addEventListener('submit', handleJoinGameClass);
}

function handleJoinGameClass(e) {
  e.preventDefault();
  const code = document.getElementById('joinGameClassCode').value.trim();
  const playerName = document.getElementById('joinGameClassPlayerName').value.trim();
  if (!code || !playerName) {
    showToast("Todos los campos son obligatorios.");
    return;
  }
  const gameClass = state.games.classes.find(c => c.code === code);
  if (gameClass) {
    gameClass.players.push(playerName);
    saveState();
    closeSectionModal();
    openGameClassDetail(code);
    showToast("Te has unido a la clase.");
  } else {
    showToast("Código inválido. Clase no encontrada.");
  }
}

function openGameClassDetail(code) {
  state.currentGameClass = code;
  state.currentView = 'gameClassDetail';
  renderView('gameClassDetail');
  updateNavigation();
}

function renderGameClassDetailView() {
  const gameClass = state.games.classes.find(c => c.code === state.currentGameClass);
  if (!gameClass) return `<p>Clase de juego no encontrada.</p>`;
  
  let playersHTML = gameClass.players && gameClass.players.length 
    ? `<ul>${gameClass.players.map(player => `<li>${player}</li>`).join('')}</ul>`
    : `<p>No hay jugadores aún.</p>`;
  let podiumHTML = gameClass.podium && gameClass.podium.length 
    ? `<ol>${gameClass.podium.map(item => `<li>${item}</li>`).join('')}</ol>`
    : `<p>Sin podio.</p>`;
  
  return `
    <div class="game-class-detail">
      <h2>Detalle de la Clase de Juego</h2>
      <p><strong>Juego:</strong> ${gameClass.gameName}</p>
      <p><strong>Clase:</strong> ${gameClass.className}</p>
      <p><strong>Código:</strong> ${gameClass.code}</p>
      <h3>Integrantes</h3>
      ${playersHTML}
      <h3>Podio</h3>
      ${podiumHTML}
      <div class="game-class-actions" style="text-align: center; margin-top: 16px;">
        <button class="btn btn-primary" onclick="showEditGameClassForm('${gameClass.code}')">Editar Clase</button>
        <button class="btn btn-secondary" onclick="deleteGameClass('${gameClass.code}')">Eliminar Clase</button>
        <button class="btn btn-secondary" onclick="startGame()">Iniciar Juego</button>
        <button class="btn" onclick="returnToGames()">Volver a Juegos</button>
      </div>
    </div>
  `;
}

function showEditGameClassForm(code) {
  const gameClass = state.games.classes.find(c => c.code === code);
  if (!gameClass) {
    showToast("Clase no encontrada.");
    return;
  }
  const modalBody = document.getElementById('sectionModalBody');
  modalBody.innerHTML = `
    <h3>Editar Clase de Juego</h3>
    <form id="editGameClassForm">
      <div class="form-group">
        <label>Nombre del juego</label>
        <input type="text" id="editGameName" value="${gameClass.gameName}" required>
      </div>
      <div class="form-group">
        <label>Nombre de la clase</label>
        <input type="text" id="editGameClassName" value="${gameClass.className}" required>
      </div>
      <button type="submit" class="btn btn-primary">Guardar Cambios</button>
    </form>
  `;
  const sectionModal = document.getElementById('sectionModal');
  sectionModal.classList.remove('hidden');
  document.getElementById('editGameClassForm').addEventListener('submit', function (e) {
    e.preventDefault();
    gameClass.gameName = document.getElementById('editGameName').value.trim();
    gameClass.className = document.getElementById('editGameClassName').value.trim();
    saveState();
    renderView('gameClassDetail');
    closeSectionModal();
    showToast("Clase actualizada.");
  });
}

function deleteGameClass(code) {
  if (confirm("¿Estás seguro de eliminar esta clase de juego?")) {
    state.games.classes = state.games.classes.filter(c => c.code !== code);
    saveState();
    renderView('games');
    showToast("Clase de juego eliminada.");
  }
}

function showGameClassDropdown(e, code) {
  e.stopPropagation();
  const options = [
    { label: 'Eliminar Clase', action: () => deleteGameClass(code) }
  ];
  showDropdown(options, e);
}

function startGame() {
  state.currentView = 'gamePlay';
  renderView('gamePlay');
  updateNavigation();
}

function renderGamePlayView() {
  const gameClass = state.games.classes.find(c => c.code === state.currentGameClass);
  if (!gameClass) return `<p>Clase no encontrada.</p>`;
  return `
    <div class="game-play-view">
      <h2>Juego en Curso: ${gameClass.gameName}</h2>
      <p><strong>Clase:</strong> ${gameClass.className}</p>
      <p><strong>Código:</strong> ${gameClass.code}</p>
      <p><strong>Jugadores:</strong> ${gameClass.players.join(', ') || "No hay jugadores."}</p>
      <button class="btn" onclick="finishGame()">Finalizar Juego</button>
    </div>
  `;
}

function finishGame() {
  state.currentView = 'gameClassDetail';
  renderView('gameClassDetail');
  updateNavigation();
  showToast("Juego finalizado.");
}

function renderGameSolitarioView() {
  return `
    <div class="game-solitario-view">
      <h2>${state.currentGame} - Modo Solitario</h2>
      <p>El juego se ha iniciado en modo solitario.</p>
      <button class="btn" onclick="returnToGames()">Volver a Juegos</button>
    </div>
  `;
}

function returnToGames() {
  state.currentView = 'games';
  renderView('games');
  updateNavigation();
}

// ===================== FIN DEL MÓDULO DE JUEGOS =====================

document.addEventListener('DOMContentLoaded', function() {
  const nightLightCheckbox = document.getElementById('night-light-checkbox');
  const body = document.body;
  const darkModeClass = 'dark-mode';

  // Función para actualizar el modo
  function updateMode() {
      if (nightLightCheckbox.checked) {
          body.classList.add(darkModeClass);
          localStorage.setItem('darkMode', 'enabled');
      } else {
          body.classList.remove(darkModeClass);
          localStorage.setItem('darkMode', 'disabled');
      }
  }

  // Comprobar el estado guardado en localStorage
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
      nightLightCheckbox.checked = true;
      body.classList.add(darkModeClass);
  }

  // Escuchar cambios en el checkbox
  nightLightCheckbox.addEventListener('change', updateMode);
});