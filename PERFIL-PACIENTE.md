# Perfil e historial integrado

El perfil ahora utiliza Supabase Auth y la tabla profiles del nuevo proyecto Medicitas (qpkvjnykirgfgdljqirl). El archivo histórico docs/perfil-paciente/Informe-perfil-paciente.docx describe la entrega inicial anterior a esta integración; sus capturas eran simuladas y no son evidencia de esta versión.

Nombre y teléfono se guardan con la sesión del titular. El correo se actualiza mediante Supabase Auth y requiere confirmación. Las citas se consultan con políticas de acceso en la base y la sección histórica filtra las fechas anteriores.

Las notas solo contienen ejemplos ficticios y el servidor limita la consulta al médico asignado. No se admite la creación de notas clínicas reales desde esta versión.
