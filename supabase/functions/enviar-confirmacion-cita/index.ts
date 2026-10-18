
import "@supabase/functions-js/edge-runtime.d.ts";
import { crearCorreoConfirmacion } from "./template.ts";
import { enviarCorreoBrevo } from "./brevo.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Método no permitido" },
      { status: 405 },
    );
  }

  // Pendiente: validar identidad y autorización con Supabase Auth.
  // Pendiente: consultar la cita por ID desde Supabase.
  // Pendiente: evitar envíos duplicados.

  return Response.json(
    {
      message: "Servicio de confirmación preparado",
      status: "pending_integration",
    },
    { status: 501 },
  );
});
