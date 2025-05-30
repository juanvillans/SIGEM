
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar contraseña</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 25px;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3490dc;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        @if($logoUrl)
            <img src="{{ $logoUrl }}" alt="Logo de la empresa" class="logo" data-skip-tracking="true">
        @endif
        <h2>Recuperar contraseña</h2>
    </div>

    <div class="content">
        <p>Hola {{$data['user']->name}},</p>
        
        <p>Para cambiar su contraseña haga clic en el siguiente botón :</p>
        <a href="{{ env('SESSION_DOMAIN', 'localhost:5173') }}/#/olvide_contraseña/{{$data['token']}}" class="button">Cambiar mi contraseña</a>
        <p>O copia esta URL en tu navegador:<br>
        <small>{{ env('SESSION_DOMAIN', 'localhost:5173') }}/#/olvide_contraseña/{{$data['token']}}</small></p>

        <p>Este link solo estara disponible durante <strong>30 minutos</strong></p>


        <p>Si tienes alguna pregunta, no dudes en contactarnos por: <strong>ostisaludfalcon@gmail.com</strong>.</p>
        
        <p>Atentamente,<br>
        El equipo de Sistemas</p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Secretaria de Salud. Todos los derechos reservados.</p>
        {{-- <p>
            <a href="{{ url('/politica-privacidad') }}">Política de Privacidad</a> | 
            <a href="{{ url('/contacto') }}">Contacto</a>
        </p> --}}
        <p>Si no solicitaste este correo, por favor ignóralo.</p>
    </div>
</body>
