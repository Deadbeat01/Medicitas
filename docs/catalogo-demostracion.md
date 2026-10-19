# Directorio de demostración

La base compartida del proyecto tiene seis médicos disponibles y seis centros. Los nombres, direcciones y teléfonos del catálogo se usan como datos ficticios para la universidad.

| Médico | Especialidad | Centro |
| --- | --- | --- |
| Médico Demo | Medicina general | Centro Medico Miraflores |
| Dra. Lucía Herrera | Cardiologia | Clinica San Borja |
| Dr. Mateo Ríos | Pediatria | Centro Médico Los Olivos |
| Dra. Sofía Vargas | Medicina general | Centro Médico San Miguel |
| Dr. Daniel Paredes | Cardiologia | Centro Médico Surco |
| Dra. Camila Salazar | Pediatria | Centro Médico La Molina |

Las cuentas nuevas se registraron mediante Supabase Auth, con contraseñas aleatorias no incluidas en Git ni en el ZIP. Un administrador autorizó el rol médico y la asignación de centro/especialidad. El directorio utiliza la misma base a la que conecta .env.example, por lo que los compañeros ven esos registros al abrir el proyecto.

La migración ampliar_catalogo_centros permite reproducir los cuatro centros adicionales en otra base. En una base diferente, el propietario debe registrar las cuentas y asignarles el rol desde Administración; no hay contraseñas universales ni cuentas con privilegios creadas por código del navegador.

El modo oscuro se activa desde el botón superior. La preferencia se guarda en el navegador y se aplica también al acceso, recuperación y página de error.
