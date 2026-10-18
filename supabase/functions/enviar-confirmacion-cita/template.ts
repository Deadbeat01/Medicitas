
interface DatosCita {
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
  hospital: string;
  estado: string;
}

const escaparHTML = (texto: string): string =>
  texto.replace(/[&<>"']/g, (caracter) => {
    const entidades: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entidades[caracter];
  });

export function crearCorreoConfirmacion(cita: DatosCita) {
  const paciente = escaparHTML(cita.paciente);
  const medico = escaparHTML(cita.medico);
  const especialidad = escaparHTML(cita.especialidad);
  const fecha = escaparHTML(cita.fecha);
  const hora = escaparHTML(cita.hora);
  const hospital = escaparHTML(cita.hospital);
  const estado = escaparHTML(cita.estado);

  return {
    asunto: "Medicitas - Registro de cita médica",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;color:#263238">
        <h2 style="color:#2563eb">Medicitas</h2>
        <h3>Registro de cita médica</h3>
        <p>Hola, <strong>${paciente}</strong>.</p>
        <p>Tu cita médica se ha registrado correctamente.</p>

        <table style="width:100%;border-collapse:collapse">
          <tr><td>Médico:</td><td>${medico}</td></tr>
          <tr><td>Especialidad:</td><td>${especialidad}</td></tr>
          <tr><td>Hospital:</td><td>${hospital}</td></tr>
          <tr><td>Fecha:</td><td>${fecha}</td></tr>
          <tr><td>Hora:</td><td>${hora}</td></tr>
          <tr><td>Estado:</td><td><strong>${estado}</strong></td></tr>
        </table>

        <p style="margin-top:20px">
          Si tu cita está pendiente, espera su confirmación.
        </p>
        <hr style="border:0;border-top:1px solid #ddd">
        <p style="font-size:12px;color:#777">
          Medicitas - Sistema de citas médicas
        </p>
      </div>
    `,
  };
}
