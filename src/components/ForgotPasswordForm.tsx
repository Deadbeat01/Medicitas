
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Stethoscope, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Navegación de demostración.
    // Pendiente: enviar el código real al correo.
    navigate('/verificar-codigo', {
      state: { email }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                MediCitas
              </CardTitle>
              <CardDescription>
                Recuperar contraseña
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Solicitud registrada en esta demostración.
                El envío del enlace de recuperación todavía
                no está habilitado.
              </p>
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setSubmitted(false)}
              >
                Volver al formulario
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Ingresa tu correo electrónico para solicitar
                un enlace de recuperación de contraseña.
              </p>

              <div className="space-y-2">
                <Label htmlFor="recovery-email">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Solicitar enlace de recuperación
              </Button>
            </form>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a iniciar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
