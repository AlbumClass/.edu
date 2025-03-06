// Estado inicial de la aplicación
const state = {
  currentView: 'home', // Vistas: 'home', 'calendar', 'classes', 'archived', 'settings', 'sectionDetail'
  currentSection: null, // ID de la sección seleccionada
  images: JSON.parse(localStorage.getItem('albumClassImages')) || [], // Fotos sin clase (vista "Inicio")
  classes: JSON.parse(localStorage.getItem('albumClassClasses')) || [],
  settings: JSON.parse(localStorage.getItem('albumClassSettings')) || { username: 'Usuario', email: '' }
};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  renderView(state.currentView);
  updateNavigation();

  // Eventos del header
  document.querySelector('.menu-btn').addEventListener('click', toggleSidebar);
  document.querySelector('.add-btn').addEventListener('click', openSectionModal);
  document.querySelector('.search-btn').addEventListener('click', handleSearch);
  // Al hacer clic en el perfil se redirige a Configuración
  document.querySelector('.profile-btn').addEventListener('click', () => {
    state.currentView = 'settings';
    renderView('settings');
    updateNavigation();
  });

  // Ajuste responsive: en resoluciones de escritorio el sidebar se muestra expandido
  window.addEventListener('resize', handleResize);
  handleResize();

  // Cerrar modales
  document.getElementById('sectionModalClose').addEventListener('click', closeSectionModal);
  document.getElementById('photoModalClose').addEventListener('click', closePhotoModal);
  document.getElementById('photoNoClassModalClose').addEventListener('click', closePhotoNoClassModal);
  document.getElementById('photoPreviewModalClose').addEventListener('click', closePhotoPreviewModal);
  
  // Cerrar vista previa al hacer clic fuera de la imagen
  document.getElementById('photoPreviewModal').addEventListener('click', function(e) {
    if (!document.getElementById('previewImage').contains(e.target)) {
      closePhotoPreviewModal();
    }
  });

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
}

// Se asegura de que en resoluciones de escritorio el sidebar esté expandido
function handleResize() {
  const sidebar = document.querySelector('.sidebar');
  if (window.innerWidth >= 768) {
    sidebar.classList.add('active');
  } else {
    sidebar.classList.remove('active');
  }
}

// Alterna el sidebar (usa la clase "active" para expandir/contraer)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

// Actualiza la navegación (resalta el ítem activo)
function updateNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === state.currentView);
  });
}

// Maneja el clic en un ítem del sidebar
function handleNavClick(e) {
  const view = e.currentTarget.dataset.view;
  state.currentView = view;
  renderView(view);
  updateNavigation();
  // En móviles se cierra el sidebar tras seleccionar una opción
  document.querySelector('.sidebar').classList.remove('active');
}

// Renderiza la vista según la opción seleccionada
function renderView(view) {
  const mainContent = document.getElementById('mainContent');
  let html = '';
  switch(view) {
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
      setTimeout(() => {
        document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
      }, 0);
      break;
    case 'sectionDetail':
      html = renderSectionDetailView();
      break;
    default:
      html = `<p>Vista no encontrada</p>`;
  }
  mainContent.innerHTML = html;
}

/* =====================================================
   Funciones de renderizado de vistas
===================================================== */

function renderHomeView(imagesArray = state.images) {
  if (imagesArray.length === 0) {
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
      ${imagesArray.map(img => `
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

function renderCalendarView() {
  // Encabezado del calendario con día de la semana, fecha, mes y año
  const now = new Date();
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const calendarHeader = `
    <div class="calendar-header">
      <span>${dayNames[now.getDay()]}</span>
      <span>${now.getDate()}</span>
      <span>${monthNames[now.getMonth()]}</span>
      <span>${now.getFullYear()}</span>
    </div>
  `;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const events = {};
  state.classes.forEach(cls => {
    if (cls.createdAt && !cls.archived) {
      const date = new Date(cls.createdAt);
      const day = date.getDate();
      if (!events[day]) events[day] = [];
      events[day].push(cls);
    }
  });
  const calendarGrid = `
    <div class="calendar-grid">
      ${days.map(day => `
        <div class="calendar-day">
          <div class="date">${day}</div>
          ${events[day] ? events[day].map(cls => `<div class="event-marker" title="Inicio: ${new Date(cls.createdAt).toLocaleDateString()}"></div>`).join('') : ''}
        </div>
      `).join('')}
    </div>
  `;
  return calendarHeader + calendarGrid;
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
      <button id="saveSettingsBtn">Guardar</button>
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
      <hr>
      <h3>Fotos</h3>
      ${photos.length === 0 
        ? `<div class="empty-state">
              <i class="fas fa-image"></i>
              <p>No hay fotos en esta sección.</p>
           </div>`
        : `<div class="classes-grid">
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
           </div>`
      }
      <div style="margin-top:16px; text-align: center;">
        <button class="dropdown-toggle" onclick="openPhotoModal()">Subir Foto</button>
      </div>
    </div>
  `;
}

/* ====================================
   Funciones para Modales y Acciones
==================================== */

// Toast Notification
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

// Guarda estado en localStorage
function saveState() {
  localStorage.setItem('albumClassImages', JSON.stringify(state.images));
  localStorage.setItem('albumClassClasses', JSON.stringify(state.classes));
  localStorage.setItem('albumClassSettings', JSON.stringify(state.settings));
}

// Guarda configuración
function saveSettings() {
  const username = document.getElementById('usernameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  state.settings.username = username;
  state.settings.email = email;
  saveState();
  showToast('Configuración guardada.');
}

// Abre el detalle de una sección
function openSectionDetail(sectionId) {
  state.currentSection = sectionId;
  state.currentView = 'sectionDetail';
  renderView('sectionDetail');
  updateNavigation();
}

/* ====================================
   Modales: Sección, Foto y Vista Previa
==================================== */

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
    archived: false
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

// Modal para subir foto en sección
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
  if (!description || !file) {
    showToast('Se requiere descripción y foto.');
    return;
  }
  const dataUrl = await readFileAsDataURL(file);
  const newPhoto = {
    id: Date.now() + Math.random(),
    description: description,
    data: dataUrl,
    timestamp: new Date().toISOString()
  };
  const cls = state.classes.find(c => c.id == state.currentSection);
  if (!cls.photos) cls.photos = [];
  cls.photos.push(newPhoto);
  saveState();
  renderView('sectionDetail');
  closePhotoModal();
  showToast('Foto subida.');
}

// Modal para subir foto sin clase (Inicio)
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

// Función para leer archivo como DataURL
function readFileAsDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Modal de vista previa ampliada con zoom y panning avanzado
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

  // Habilitar zoom y panning en la imagen
  enableImagePan(previewImage);
}

function closePhotoPreviewModal() {
  const previewModal = document.getElementById('photoPreviewModal');
  previewModal.classList.add('hidden');
  const previewImage = document.getElementById('previewImage');
  previewImage.style.transform = 'translate(0,0) scale(1)';
  previewImage.style.cursor = 'zoom-in';
}

// Habilita panning y zoom en la imagen (mouse y touch)
function enableImagePan(img) {
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let lastX = 0;
  let lastY = 0;
  let isDragging = false;
  let startX, startY;
  let initialTouchDistance = null;

  // Mouse events
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
    lastX = posX;
    lastY = posY;
  };

  // Wheel zoom
  img.onwheel = (e) => {
    e.preventDefault();
    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.8 : 1.2;
    const newScale = scale * delta;
    
    if (newScale < 1 || newScale > 5) return;

    // Calcular nueva posición para mantener el punto bajo el cursor
    posX = offsetX - (offsetX - posX) * (newScale / scale);
    posY = offsetY - (offsetY - posY) * (newScale / scale);
    
    scale = newScale;
    updateTransform();
    img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  };

// Touch events
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
      
      // Calcular centro entre los dedos
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      const rect = img.getBoundingClientRect();
      const offsetX = centerX - rect.left;
      const offsetY = centerY - rect.top;
      
      posX = offsetX - (offsetX - posX) * (scale / (scale / (newDistance / initialTouchDistance)));
      posY = offsetY - (offsetY - posY) * (scale / (scale / (newDistance / initialTouchDistance)));
      
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

 // Doble click para resetear
 img.ondblclick = () => {
  scale = 1;
  posX = 0;
  posY = 0;
  updateTransform();
  img.style.cursor = 'zoom-in';
};
}

/* ====================================
   Funciones para Dropdowns (menús contextuales)
==================================== */
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

/* ====================================
   Función de Búsqueda
==================================== */
function handleSearch() {
  const query = document.querySelector('.search-bar').value.trim().toLowerCase();
  if (state.currentView === 'sectionDetail') {
    renderView('sectionDetail');
  } else if (state.currentView === 'home') {
    const imagesToRender = state.images.filter(img => {
      return img.subject.toLowerCase().includes(query) ||
             img.description.toLowerCase().includes(query);
    });
    document.getElementById('mainContent').innerHTML = renderHomeView(imagesToRender);
  }
}

/* ====================================
   Utilidad: Obtener un color aleatorio
==================================== */
function getRandomColor() {
  const colors = ['green', 'blue', 'red'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* ====================================
   Funciones para Guardar Estado y Configuración
==================================== */
function saveState() {
  localStorage.setItem('albumClassImages', JSON.stringify(state.images));
  localStorage.setItem('albumClassClasses', JSON.stringify(state.classes));
  localStorage.setItem('albumClassSettings', JSON.stringify(state.settings));
}

function saveSettings() {
  const username = document.getElementById('usernameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  state.settings.username = username;
  state.settings.email = email;
  saveState();
  showToast('Configuración guardada.');
}

/* ====================================
   Abrir detalle de sección
==================================== */
function openSectionDetail(sectionId) {
  state.currentSection = sectionId;
  state.currentView = 'sectionDetail';
  renderView('sectionDetail');
  updateNavigation();
}