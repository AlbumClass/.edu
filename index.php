<?php
    session_start();
    if (!isset($_SESSION["Id_Usuario"])){
        echo '
            <script>
                alert("Por favor debes iniciar sesión");
                window.location = "login_register.php";
            </script>
        ';
        header('location: login_register.php');
        session_destroy();
        die(); 
    }
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ÁlbumClass</title>
    <link rel="icon" href="assets/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/dark-mode.css"> <--------------------- Added link to dark-mode.css
    <style>
        /* Estilos adicionales para el campo Tema y otros */
        .form-group label[for="photoTema"] {
            font-weight: bold;
        }

        #photoTema {
            border: 1px solid #dadce0;
            border-radius: 6px;
            padding: 10px;
            font-size: 15px;
            width: 100%;
        }

        /* Estilo para mostrar el tema en la vista detalle de la sección */
        .section-detail p.tema {
            font-style: italic;
            color: #555;
        }

        /* Estilos para el apartado de Juegos */
        .games-container {
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .games-container h2 {
            color: #1976d2;
            margin-bottom: 16px;
        }

        .games-container button {
            background: #1976d2;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: background 0.3s ease;
        }

        .games-container button:hover {
            background: #1565c0;
        }

        .games-container ul {
            list-style: none;
            padding: 0;
        }

        .games-container li {
            margin-bottom: 10px;
        }

        .games-container li span {
            margin-right: 10px;
            font-weight: bold;
        }

        /* Estilos para la sección de creadores */
        .creadores-container {
            display: flex;
            justify-content: space-around;
            align-items: flex-start;
            flex-wrap: wrap;
            margin-top: 40px;
        }

        .creador-card {
            background: #e3f2fd;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 20px;
            text-align: center;
            margin: 10px;
            width: 45%;
            min-width: 300px;
            transition: transform 0.2s ease-in-out;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .creador-card:hover {
            transform: scale(1.03);
        }

        .creador-imagen {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 15px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .creador-nombre {
            font-size: 1.2em;
            font-weight: 500;
            color: #1976d2;
            margin-bottom: 8px;
        }

        .creador-info {
            font-size: 1em;
            color: #333;
            text-align: left;
        }

        /* Estilos para el modo oscuro/claro (mover a dark-mode.css) */
        .night-light-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            margin-left: 15px; /* Espacio del botón de perfil */
            background-color: transparent; /* Fondo transparente */
        border: 2px solid transparent; /* Necesitamos un borde transparente para que la sombra no quede pegada */
        box-shadow: 0 0 10px 3px rgba(0, 149, 255, 0.8); /* Sombra naranja brillante */        padding: 4px 8px; /* Reducimos el padding */
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        }

        #night-light-checkbox {
            opacity: 0;
            position: absolute;
        }

        .night-light-ball {
            width: 20px;
            height: 20px;
            background-color: #fff;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease-in-out;
        }

        .sun-svg,
        .moon-svg {
            width: 24px;
            height: 24px;
            fill: #ffc107; /* Color del sol */
            transition: opacity 0.3s ease-in-out;
        }

        .moon-svg {
            fill: #fff; /* Color de la luna */
            opacity: 0;
            position: absolute;
        }

        #night-light-checkbox:checked+.night-light-ball {
            transform: translateX(20px);
        }

        #night-light-checkbox:checked~.sun-svg {
            opacity: 0;
        }

        #night-light-checkbox:checked~.moon-svg {
            opacity: 1;
        }
    </style>
</head>

<body>
    <header class="header">
        <button class="menu-btn" aria-label="Menú">
            <i class="fas fa-bars"></i>
        </button>
        <div class="logo">
            <i class="fas fa-camera"></i>
            <span>Album Class</span>
        </div>
        <div class="header-center">
            <div class="search-container">
                <input type="text" class="search-bar" placeholder="Buscar por título o etiquetas..."
                    aria-label="Buscar">
                <button class="search-btn" aria-label="Buscar">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
        <div class="header-right">
            <button class="add-btn" aria-label="Añadir">
                <i class="fas fa-plus"></i>
            </button>
            <small class="section-info">Presiona</small>
            <button class="profile-btn" aria-label="Perfil">
                <i class="fas fa-user-circle"></i>
            </button>
            <!-- Botón de modo oscuro/claro añadido aquí -->
            <label for="night-light-checkbox" class="night-light-label">
                <input type="checkbox" id="night-light-checkbox">
                <span class="night-light-ball"></span>
                <svg viewBox="0 0 512 512" class="sun-svg">
                    <path id="sun-svg" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z">
                    </path>
                </svg>
                <svg viewBox="0 0 512 512" class="moon-svg">
                    <path id="moon-svg" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z">
                    </path>
                </svg>
            </label>
        </div>
    </header>

    <aside class="sidebar">
        <nav>
            <div class="nav-item" data-view="home">
                <i class="fas fa-home"></i>
                <span>Inicio</span>
            </div>
            <div class="nav-item" data-view="calendar">
                <i class="far fa-calendar"></i>
                <span>Calendario</span>
            </div>
            <div class="nav-item" data-view="classes">
                <i class="fas fa-graduation-cap"></i>
                <span>Mis Clases</span>
            </div>
            <div class="nav-item" data-view="archived">
                <i class="fas fa-archive"></i>
                <span>Archivadas</span>
            </div>
            <a href="games.html" target="_blank" class="nav-item">
                <i class="fas fa-gamepad"></i>
                <span>Juegos</span>
              </a>
              
            <div class="nav-item" data-view="settings">
                <i class="fas fa-cog"></i>
                <span>Configuración</span>
            </div>
            <div class="nav-item" data-view="contacto">
                <i class="fas fa-envelope"></i>
                <span>Contacto</span>
            </div>
        </nav>
    </aside>

    <main class="main-content" id="mainContent">
        <!-- Aquí se cargará el contenido de las diferentes secciones -->
    </main>

    <div id="sectionModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" id="sectionModalClose" aria-label="Cerrar">&times;</span>
            <div class="modal-body" id="sectionModalBody">
                <h3>Selecciona una opción</h3>
                <button id="createSectionBtn">Crear sección</button>
                <button id="joinSectionBtn">Unirse a sección</button>
                <button id="uploadNoClassBtn">Subir foto sin clase</button>
            </div>
        </div>
    </div>

    <div id="photoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" id="photoModalClose" aria-label="Cerrar">&times;</span>
            <div class="modal-body" id="photoModalBody">
                <h3>Subir Foto</h3>
                <form id="photoUploadForm">
                    <div class="form-group">
                        <label for="photoDescription">Descripción/Palabra clave</label>
                        <input type="text" id="photoDescription" required>
                    </div>
                    <div class="form-group">
                        <label for="photoTema">Tema (opcional)</label>
                        <input type="text" id="photoTema"
                            placeholder="Escribe el tema o déjalo en blanco para 'Sin tema'">
                    </div>
                    <div class="form-group">
                        <label for="photoInput">Selecciona la foto</label>
                        <input type="file" id="photoInput" accept="image/*" required>
                    </div>
                    <button type="submit">Subir</button>
                </form>
            </div>
        </div>
    </div>

    <div id="photoNoClassModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" id="photoNoClassModalClose" aria-label="Cerrar">&times;</span>
            <div class="modal-body" id="photoNoClassModalBody">
                <h3>Subir Foto sin Clase</h3>
                <form id="photoNoClassForm">
                    <div class="form-group">
                        <label>Asignatura</label>
                        <input type="text" id="photoNoClassSubject" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción/Palabra clave</label>
                        <input type="text" id="photoNoClassDescription" required>
                    </div>
                    <div class="form-group">
                        <label>Selecciona la foto</label>
                        <input type="file" id="photoNoClassInput" accept="image/*" required>
                    </div>
                    <button type="submit">Subir</button>
                </form>
            </div>
        </div>
    </div>

    <div id="photoPreviewModal" class="modal hidden">
        <div class="modal-content preview-content">
            <span class="close" id="photoPreviewModalClose" aria-label="Cerrar">&times;</span>
            <div class="modal-body" id="photoPreviewBody">
                <img id="previewImage" src="" alt="">
                <p id="previewDescription"></p>
            </div>
        </div>
    </div>

    <div id="dropdownContainer"></div>

    <div id="toast" class="toast"></div>

    <template id="contactoTemplate">
        <div class="contacto-view">
            <h2>Contacto y Sugerencias</h2>
            <p>Si tienes dudas o sugerencias para agregar nuevos juegos, envíanos un mensaje. Los mensajes se enviarán a
                <strong>jafettelles9@gmail.com</strong>.</p>
            <form id="contactForm" action="https://formspree.io/f/mqapalbg" method="POST">
                <div class="form-group">
                    <label for="contactName">Tu Nombre</label>
                    <input type="text" name="name" id="contactName" placeholder="Ingresa tu nombre" required>
                </div>
                <div class="form-group">
                    <label for="contactEmail">Tu Correo</label>
                    <input type="email" name="email" id="contactEmail" placeholder="Ingresa tu correo" required>
                </div>
                <div class="form-group">
                    <label for="contactSubject">Asunto</label>
                    <input type="text" name="_subject" id="contactSubject" placeholder="Asunto del mensaje"
                        required>
                </div>
                <div class="form-group">
                    <label for="contactMessage">Mensaje</label>
                    <textarea name="message" id="contactMessage" rows="5"
                        placeholder="Escribe tu mensaje o sugerencia" required></textarea>
                </div>
                <button type="submit">Enviar Mensaje</button>
            </form>

            <div class="creadores-container">
                <div class="creador-card">
                    <img src="imagenes/img1.jpg" alt="Jafet Azarías Téllez Meza" class="creador-imagen">
                    <h3 class="creador-nombre">Jafet Azarías Téllez Meza</h3>
                    <p class="creador-info">
                        Líder del equipo de desarrollo y arquitecto de software con una pasión por crear experiencias web
                        intuitivas y eficientes. Responsable del diseño y la implementación del front-end, así como de la
                        integración de las diversas funcionalidades del sitio web. Su enfoque se centra en la usabilidad,
                        el rendimiento y la accesibilidad, asegurando que Album Class sea una plataforma robusta y fácil de
                        usar para todos los usuarios.
                    </p>
                </div>

                <div class="creador-card">
                    <img src="imagenes/img2.jpg" alt="Agustin Lopez Orozco" class="creador-imagen">
                    <h3 class="creador-nombre">Agustin Lopez Orozco</h3>
                    <p class="creador-info">
                        Especialista en gestión de información y desarrollo de bases de datos, encargado de la creación y
                        mantenimiento de la infraestructura de datos de Album Class. Responsable de la documentación
                        técnica detallada del sitio web, asegurando que la información sea clara, precisa y accesible para
                        todos los miembros del equipo. Su experiencia en el diseño de bases de datos relacionales y no
                        relacionales garantiza la integridad y la eficiencia en el manejo de la información de la
                        plataforma.
                    </p>
                </div>
            </div>
        </div>
    </template>

    <script src="assets/js/script.js"></script>
    <script src="assets/js/dark-mode.js"></script> 

</body>

</html>