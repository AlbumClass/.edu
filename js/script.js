// Estado global de la aplicación
const state = {
  currentView: 'home', // Vistas: 'home', 'calendar', 'classes', 'archived', 'settings', 'games', 'sectionDetail'
  currentSection: null, // ID de la sección seleccionada
  images: JSON.parse(localStorage.getItem('albumClassImages')) || [], // Fotos sin clase (vista "Inicio")
  classes: JSON.parse(localStorage.getItem('albumClassClasses')) || [], // Secciones o clases
  settings: JSON.parse(localStorage.getItem('albumClassSettings')) || { username: 'Usuario', email: '' },
  games: JSON.parse(localStorage.getItem('albumClassGames')) || [] // Estado para los juegos
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
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdownContainer');
    if (!dropdown.contains(e.target)) {
      dropdown.innerHTML = '';
    }
  });

  // Activar búsqueda al presionar Enter
  const searchBar = document.querySelector('.search-bar');
  searchBar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });
}

function loadState() {
  state.images = JSON.parse(localStorage.getItem('albumClassImages')) || [];
  state.classes = JSON.parse(localStorage.getItem('albumClassClasses')) || [];
  state.settings = JSON.parse(localStorage.getItem('albumClassSettings')) || { username: 'Usuario', email: '' };
  state.games = JSON.parse(localStorage.getItem('albumClassGames')) || [];
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

function renderView(view) {
  const mainContent = document.getElementById('mainContent');
  let html = '';
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
    default:
      html = `<p>Vista no encontrada</p>`;
  }
  mainContent.innerHTML = html;
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
      <h2>Configuración de cuenta</h2>
      <div class="form-group">
        <label>Nombre de usuario</label>
        <input type="text" id="usernameInput" value="${state.settings.username}">
      </div>
      <div class="form-group">
        <label>Correo electrónico</label>
        <input type="email" id="emailInput" value="${state.settings.email}">
      </div>
      <button id="saveSettingsBtn" onclick="saveSettings()">Guardar</button>
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
  
  const photosGrouped = {};
  photos.forEach(photo => {
    const tema = photo.tema && photo.tema.trim() !== "" ? photo.tema : 'Sin tema';
    if (!photosGrouped[tema]) photosGrouped[tema] = [];
    photosGrouped[tema].push(photo);
  });
  
  let photosHTML = '';
  for (let group in photosGrouped) {
    photosHTML += `<h3>Tema: ${group}</h3>`;
    photosHTML += `<div class="classes-grid">
      ${photosGrouped[group].map(photo => `
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
    </div>`;
  }
  
  return `
    <div class="section-detail">
      <div class="section-header">
        <h2>${cls.name}</h2>
        <button class="dropdown-toggle" onclick="showSectionDropdown(event, '${cls.id}')">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <p><strong>Código:</strong> ${cls.code}</p>
      <p><strong>Asignatura:</strong> ${cls.subject || '-'}</p>
      <p><strong>Sala:</strong> ${cls.room || '-'}</p>
      <p><strong>Creado:</strong> ${new Date(cls.createdAt).toLocaleDateString()}</p>
      <p class="tema"><strong>Tema de la Sección:</strong> ${cls.tema && cls.tema.trim() !== "" ? cls.tema : 'Sin tema'}</p>
      <hr>
      <h3>Fotos</h3>
      ${photosHTML || `
        <div class="empty-state">
          <i class="fas fa-image"></i>
          <p>No hay fotos en esta sección.</p>
        </div>
      `}
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

/* =====================================================
   Funciones para Juegos Académicos
==================================================== */

function renderGamesView() {
  return `
    <div class="games-container">
      <h2>Juegos Académicos</h2>
      <button id="createClassBtn" onclick="createGameClass()">Crear Clase Privada</button>
      <button id="joinClassBtn" onclick="joinGameClass()">Unirse a Clase Privada</button>
      <div id="gamesList">
        <h3>Juegos Disponibles</h3>
        <ul>
          <li>
            <span>Juego 1</span>
            <button onclick="playGame('Juego 1', false)">Jugar Solo</button>
            <button onclick="playGame('Juego 1', true)">Jugar Multijugador</button>
          </li>
          <li>
            <span>Juego 2</span>
            <button onclick="playGame('Juego 2', false)">Jugar Solo</button>
            <button onclick="playGame('Juego 2', true)">Jugar Multijugador</button>
          </li>
        </ul>
      </div>
    </div>
  `;
}

function playGame(gameName, isMultiplayer) {
  if (isMultiplayer) {
    const code = prompt("Introduce el código de la clase para jugar en multijugador:");
    const cls = state.classes.find(c => c.code === code);
    if (cls) {
      showToast(`Te has unido a la partida multijugador de "${gameName}"`);
    } else {
      showToast("Código de clase no válido.");
    }
  } else {
    showToast(`Iniciando "${gameName}" en modo solitario...`);
  }
}

function createGameClass() {
  const className = prompt("Introduce el nombre de la clase para juegos:");
  if (className) {
    const newGameClass = {
      id: Date.now() + Math.random(),
      name: className,
      code: generateUniqueCode(),
      createdAt: new Date().toISOString()
    };
    state.classes.push(newGameClass);
    saveState();
    showToast(`Clase de juegos "${className}" creada. Código: ${newGameClass.code}`);
  }
}

function joinGameClass() {
  const code = prompt("Introduce el código de la clase para unirte:");
  const cls = state.classes.find(c => c.code === code);
  if (cls) {
    showToast(`Te has unido a la clase de juegos "${cls.name}"`);
  } else {
    showToast("Código de clase no válido.");
  }
}

// Función para mostrar notificaciones (Toast)
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.style.opacity = 1;
  toast.style.top = '20px';
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.top = '0px';
  }, 3000);
}
 