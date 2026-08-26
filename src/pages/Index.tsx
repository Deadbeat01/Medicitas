
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirigir automáticamente al dashboard
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">MediCitas</h1>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default Index;
