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