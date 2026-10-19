import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusLabels = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };

export default function PatientHistory({ currentUser }: { currentUser: User }) {
  const history = useQuery({
    queryKey: ['patient-history', currentUser.id],
    enabled: currentUser.userType === 'patient',
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments')
        .select('id, patient_id, appointment_date, appointment_time, status, doctor:doctors(name), specialty:specialties(name), hospital:hospitals(name)')
        .eq('patient_id', currentUser.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      if (error) throw error;
      const now = new Date();
      return data.filter(appointment => new Date(`${appointment.appointment_date}T${appointment.appointment_time}`) < now);
    },
  });

  return <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle>Historial de citas anteriores</CardTitle></CardHeader>
      <CardContent>
        {currentUser.userType !== 'patient' ? <p>Acceso reservado al paciente titular.</p>
          : history.isPending ? <p role="status">Cargando historial...</p>
          : history.isError ? <div role="alert"><p>No se pudo cargar el historial.</p><Button variant="outline" onClick={() => history.refetch()}>Reintentar</Button></div>
          : !history.data?.length ? <p className="text-muted-foreground">Aún no tienes citas anteriores.</p>
          : <ul className="space-y-4">{history.data.map(appointment => <li key={appointment.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{appointment.specialty?.name ?? 'Consulta médica'}</h3>
              <Badge variant="secondary">{appointment.status ? statusLabels[appointment.status] : 'Sin estado'}</Badge></div>
            <p>{new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}</p>
            <p className="text-muted-foreground">{appointment.doctor?.name ?? 'Médico no disponible'} · {appointment.hospital?.name ?? 'Centro no disponible'}</p>
          </li>)}</ul>}
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Notas médicas · demostración</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Estructura inicial con datos ficticios. No ingresar información clínica real.</p>
        {/* This is a UI-only demo guard. Real notes require server authorization and RLS. */}
        {currentUser.userType === 'doctor' ? <article className="border rounded-lg p-4"><h3 className="font-semibold">Ejemplo ficticio de seguimiento</h3><p>Paciente de demostración: revisión de rutina, sin información clínica real.</p><p className="text-sm text-muted-foreground">Autor: médico de ejemplo · Fecha: 01/01/2026</p></article>
          : <p>Acceso restringido al personal médico. Las notas no están disponibles para el rol paciente.</p>}
      </CardContent>
    </Card>
  </div>;
}
