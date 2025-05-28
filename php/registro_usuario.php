<?php

session_start(); // ¡Importante! Inicia la sesión aquí también para poder usar $_SESSION
include 'conexion_be.php';

// 1. Obtener los datos del formulario
$correo_electronico = trim($_POST["correo_electronico"]);
$contrasena = trim($_POST["contrasena"]);

// 2. Encriptamiento de contraseña
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

// 4. Verificar que el correo no se repita en la base de datos de forma segura
$stmt_check = $conn->prepare("SELECT Correo FROM cuentas WHERE Correo = ?");
$stmt_check->bind_param("s", $correo_electronico);
$stmt_check->execute();
$stmt_check->store_result();

if ($stmt_check->num_rows > 0) {
    echo '
        <script>
            alert("Este correo ya está registrado, intenta con otro diferente");
            window.location = "../login_register.php";
        </script>
    ';
    exit();
}
$stmt_check->close();

// 5. Si el correo no está registrado, procede con el registro de forma segura
$stmt_insert = $conn->prepare("INSERT INTO cuentas (Correo, Contrasena) VALUES (?, ?)");
$stmt_insert->bind_param("ss", $correo_electronico, $contrasena_encriptada);

if ($stmt_insert->execute()) {
    // Registro exitoso

    // ¡NUEVO! Obtener el ID del usuario recién insertado
    // Asumiendo que 'Id_Usuario' es un campo AUTO_INCREMENT en tu tabla 'cuentas'
    $id_usuario_nuevo = $conn->insert_id; 

    // ¡NUEVO! Iniciar la sesión para el usuario recién registrado
    $_SESSION["Id_Usuario"] = $id_usuario_nuevo;
    $_SESSION["Correo"] = $correo_electronico; // Opcional: guardar también el correo en sesión

    echo '
        <script>
            alert("Usuario registrado exitosamente. ¡Bienvenido!");
            window.location = "../index.php"; // Redirigir al index.php
        </script>
    ';
    exit();
} else {
    // Error en la inserción
    echo '
        <script>
            alert("Error al registrar el usuario. Por favor, intente de nuevo.");
            window.location = "../login_register.php";
        </script>
    ';
    exit();
}
?>