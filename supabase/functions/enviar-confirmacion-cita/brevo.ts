
interface CorreoBrevo {
  destinatario: string;
  nombre: string;
  asunto: string;
  html: string;
}

export async function enviarCorreoBrevo(correo: CorreoBrevo) {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const remitente = Deno.env.get("BREVO_SENDER_EMAIL");

  if (!apiKey || !remitente) {
    throw new Error("Falta configurar Brevo");
  }

  const respuesta = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Medicitas",
          email: remitente,
        },
        to: [
          {
            email: correo.destinatario,
            name: correo.nombre,
          },
        ],
        subject: correo.asunto,
        htmlContent: correo.html,
      }),
    },
  );

  if (!respuesta.ok) {
    throw new Error(
      `Error de Brevo: ${respuesta.status}`,
    );
  }

  return await respuesta.json();
}
