import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, type User } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PatientHistory from '@/components/PatientHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  email: z.string().trim().email('Ingresa un correo válido.').max(254),
  phone: z.string().trim().max(25).refine(value => !value || (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, '').length >= 7), 'Ingresa un teléfono válido (mínimo 7 dígitos).'),
});

type Profile = { id: string; name: string; email: string; phone: string | null };

function ProfileForm({ profile, user, onSaved }: { profile: Profile; user: User; onSaved: (profile: Profile) => void }) {
  const [fields, setFields] = useState({ name: profile.name, email: profile.email, phone: profile.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage('');
    const parsed = profileSchema.safeParse(fields);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setSaving(true);
    try {
      const { data, error: updateError } = await supabase.from('patients')
        .update({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null })
        .eq('id', user.id).select('id, name, email, phone').single();
      if (updateError || !data) throw updateError;
      localStorage.setItem('user', JSON.stringify({ ...user, name: data.name, email: data.email, phone: data.phone ?? undefined }));
      onSaved(data);
      setFields({ name: data.name, email: data.email, phone: data.phone ?? '' });
      setMessage('Perfil actualizado correctamente.');
    } catch { setError('No se pudo guardar el perfil. Comprueba tu conexión y los permisos de tu cuenta.'); }
    finally { setSaving(false); }
  }
  return <form onSubmit={save} className="space-y-4">
    <fieldset disabled={saving} className="space-y-4">
      <div><Label htmlFor="patient-name">Nombre</Label><Input id="patient-name" autoComplete="name" required minLength={2} maxLength={100} value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} /></div>
      <div><Label htmlFor="patient-email">Correo electrónico</Label><Input id="patient-email" type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={e => setFields({ ...fields, email: e.target.value })} /><p className="text-sm text-muted-foreground">El correo actualizado se utilizará para iniciar sesión.</p></div>
      <div><Label htmlFor="patient-phone">Teléfono (opcional)</Label><Input id="patient-phone" type="tel" autoComplete="tel" maxLength={25} value={fields.phone} onChange={e => setFields({ ...fields, phone: e.target.value })} /></div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{saving ? 'Guardando...' : 'Guardar cambios'}</Button><Button type="button" variant="outline" onClick={() => { setFields({ name: profile.name, email: profile.email, phone: profile.phone ?? '' }); setError(''); setMessage(''); }}>Descartar cambios</Button></div>
    </fieldset>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {message && <p role="status" className="text-green-700">{message}</p>}
  </form>;
}

export default function PatientProfile() {
  const queryClient = useQueryClient();
  const { getCurrentUser } = useAuth();
  const [user] = useState(getCurrentUser);
  const profile = useQuery({
    queryKey: ['patient-profile', user?.id],
    enabled: user?.userType === 'patient',
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('id, name, email, phone').eq('id', user!.id).single();
      if (error) throw error;
      return data;
    },
  });
  if (!user) return <Navigate to="/auth" replace />;
  if (user.userType !== 'patient') return <Navigate to="/" replace />;
  return <main className="min-h-screen bg-gray-50 py-8 px-4"><div className="max-w-3xl mx-auto space-y-6">
    <Button variant="outline" asChild><Link to="/">Volver a mis citas</Link></Button>
    <div><h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1><p className="text-muted-foreground">Actualiza tus datos personales y consulta tus citas anteriores.</p></div>
    <Card><CardHeader><CardTitle>Datos del paciente</CardTitle></CardHeader><CardContent>
      {profile.isPending ? <p role="status">Cargando perfil...</p> : profile.isError ? <div role="alert"><p>No se pudo cargar el perfil.</p><Button variant="outline" onClick={() => profile.refetch()}>Reintentar</Button></div>
        : <ProfileForm profile={profile.data} user={user} onSaved={data => queryClient.setQueryData(['patient-profile', user.id], data)} />}
    </CardContent></Card>
    <PatientHistory currentUser={user} />
  </div></main>;
}
