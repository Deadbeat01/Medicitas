
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import AppointmentFormWithSupabase from '@/components/AppointmentFormWithSupabase';
import AppointmentsListWithSupabase from '@/components/AppointmentsListWithSupabase';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'appointments'>('book');
  const { user, getCurrentUser, logout } = useAuth();

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Si no hay usuario, redirigir al login
      window.location.href = '/auth';
    }
  }, [getCurrentUser]);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  // Para doctores, solo mostrar la lista de citas
  if (user.userType === 'doctor' && activeTab === 'book') {
    setActiveTab('appointments');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userType={user.userType}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Bienvenido, {user.name}
            </h2>
            <p className="text-gray-600">
              {user.userType === 'patient' ? 'Panel de Paciente' : 'Panel de Doctor'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {activeTab === 'book' && user.userType === 'patient' ? (
          <AppointmentFormWithSupabase currentUser={user} />
        ) : (
          <AppointmentsListWithSupabase currentUser={user} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
