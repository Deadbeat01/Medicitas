
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User, Lock, Mail, Phone, UserPlus } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !userType) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !name) {
      toast({
        title: "Error",
        description: "El nombre es requerido para el registro",
        variant: "destructive",
      });
      return;
    }

    let result;
    if (isLogin) {
      result = await login(email, password, userType);
    } else {
      result = await register({
        name,
        email,
        password,
        phone,
        userType
      });
    }
    
    if (result.success) {
      toast({
        title: isLogin ? "¡Bienvenido!" : "¡Registro exitoso!",
        description: `${isLogin ? 'Sesión iniciada' : 'Usuario registrado'} como ${userType}`,
      });
      window.location.href = '/';
    } else {
      toast({
        title: `Error de ${isLogin ? 'autenticación' : 'registro'}`,
        description: result.error || `${isLogin ? 'Credenciales incorrectas' : 'Error al registrar usuario'}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <span>MediCitas</span>
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Ingrese sus credenciales para acceder al sistema' : 'Registre una nueva cuenta'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Usuario</Label>
              <Select value={userType} onValueChange={(value: 'patient' | 'doctor') => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ingrese su nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingrese su email"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!isLogin && userType === 'patient' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ingrese su teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? 'Iniciando sesión...' : 'Registrando...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isLogin ? <User className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
