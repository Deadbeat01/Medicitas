import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, User, Lock, Mail } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string, userType: 'patient' | 'doctor') => void;
  onShowRegister: () => void;
  onShowForgotPassword: () => void;
}

const LoginForm = ({ onLogin, onShowRegister, onShowForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, userType);
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
              <CardTitle className="text-2xl font-bold text-gray-800">MediCitas</CardTitle>
              <CardDescription>Iniciar Sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Type Selection */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 flex-1 justify-center ${
                userType === 'patient'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Paciente</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 flex-1 justify-center ${
                userType === 'doctor'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="text-right">
              <button
                type="button"
                onClick={onShowForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Iniciar Sesión como {userType === 'patient' ? 'Paciente' : 'Doctor'}
            </Button>
          </form>

          {/* Show register button only for doctors */}
          {userType === 'doctor' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?
              </p>
              <Button 
                variant="outline" 
                onClick={onShowRegister}
                className="w-full"
              >
                Registrarse como Doctor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
