<?php
    session_start();
    if (isset($_SESSION["Id_Usuario"])){
        header("location: index.php");
    }
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Login-Register</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='assets/css/estilos.css'>
    <link href="https://fonts.googleapis.com/css2?family=Playwrite+ES:wght@100..400&family=Playwrite+NG+Modern:wght@100..400&display=swap" rel="stylesheet">
</head>
<body>
    <main>

        <div class="contenedor__todo">
            
            <div class="caja__trasera">

                <div class="caja__trasera-login">
                    <h3>¿Ya tienes una cuenta?</h3>
                    <p>Inicia sesión para entrar en la página</p>
                    <button id="btn__iniciar-sesion">Iniciar Sesión</button>
                </div>
                <div class="caja__trasera-register">
                    <h3>¿Aún no tienes una cuenta?</h3>
                    <p>Registrate para que puedas iniciar sesión</p>
                    <button id="btn__registrarse">Registrarse</button>
                </div>
            </div>
                <!--LOGIN-->
            <div class="contenedor__login-register">
                <form action="php/login_usuario_be.php" class="formulario__login" method="POST">
                    <h2>Iniciar Sesión</h2>
                    <input type="text" placeholder="Correo Electrónico" name="correo_electronico">
                    <input type="password" placeholder="Contraseña" name="contrasena">
                    <button>Entrar</button>
                </form>
                <!--REGISTER-->
                <form action="php/registro_usuario.php" method="POST" class="formulario__register">
                    <h2>Registrarse</h2>
                    <input type="text" placeholder="Correo Electrónico" name="correo_electronico">
                    <input type="password" placeholder="Contraseña" name="contrasena">
                    <button>Registrarse</button>
                </form>
            </div>
        </div>

    </main>
    <script src="assets/js/Script_LR.js"></script>
</body>
</html>