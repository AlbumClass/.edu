<?php
session_start();

include 'conexion_be.php';

// 1. Obtener los datos del formulario
// Usamos trim() para eliminar espacios en blanco al inicio y al final
$correo_electronico = trim($_POST['correo_electronico']);
$contrasena = trim($_POST['contrasena']);

// 2. Encriptación de contraseña (¡Asegúrate de que así es como las guardas en tu DB!)
$contrasena_encriptada = hash('sha512', $contrasena);

// 3. Validar que los campos no estén vacíos
if (empty($correo_electronico) || empty($contrasena)) {
    echo '
        <script>
            alert("Por favor, rellene todos los campos.");
            window.location = "../login_register.php";
        </script>
    ';
    exit();
}

// 4. Preparar la consulta para evitar inyección SQL
// Seleccionamos Id_Usuario y Contrasena basándonos en el correo electrónico proporcionado
$stmt = $conn->prepare("SELECT Id_Usuario, Contrasena FROM cuentas WHERE Correo = ?");
$stmt->bind_param("s", $correo_electronico); // 's' indica que es un string
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id_usuario_db, $contrasena_db); // Vinculamos los resultados a estas variables

// 5. Verificar si se encontró un usuario con ese correo
if ($stmt->num_rows > 0) {
    $stmt->fetch(); // Obtenemos los valores de las columnas

    // 6. Verificar la contraseña
    if ($contrasena_encriptada === $contrasena_db) {
        // 7. Si el login es exitoso, establecer el Id_Usuario en la sesión
        $_SESSION['Id_Usuario'] = $id_usuario_db;
        // Opcional: Si necesitas el correo en la sesión, puedes guardarlo también
        // $_SESSION['Correo'] = $correo_electronico;

        header("location: ../index.php");
        exit();
    } else {
        // Contraseña incorrecta
        echo '
            <script>
                alert("Contraseña incorrecta. Por favor verifique los datos introducidos.");
                window.location = "../login_register.php";
            </script>
        ';
        exit();
    }
} else {
    // Usuario no existe
    echo '
        <script>
            alert("El correo electrónico no está registrado. Por favor verifique los datos introducidos.");
            window.location = "../login_register.php";
        </script>
    ';
    exit();
}



?>