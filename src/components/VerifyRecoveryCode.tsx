
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Stethoscope, ShieldCheck, ArrowLeft } from 'lucide-react';

const VerifyRecoveryCode = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pendiente: verificar el código con Supabase Auth.
    // No permitir cambiar la contraseña sin verificarlo.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">MediCitas</CardTitle>
              <CardDescription>Verificación de identidad</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="text-center space-y-2">
            <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto" />
            <h2 className="font-semibold text-lg">Verifica tu correo</h2>
            <p className="text-sm text-gray-600">
              Ingresa el código de 6 dígitos enviado a tu correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-code">Código de verificación</Label>
              <Input
                id="recovery-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ''))
                }
                className="text-center text-2xl tracking-widest"
                required
                pattern="[0-9]{6}"
              />
            </div>

            <Button
              type="submit"
              disabled={code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Verificar código
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500">
            La verificación estará disponible cuando se conecte
            el servicio de recuperación.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/recuperar-contrasena')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyRecoveryCode;
