
import { Calendar, Stethoscope } from 'lucide-react';

interface HeaderProps {
  activeTab: 'book' | 'appointments';
  onTabChange: (tab: 'book' | 'appointments') => void;
  userType?: 'patient' | 'doctor';
}

const Header = ({ activeTab, onTabChange, userType = 'patient' }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediCitas</h1>
              <p className="text-blue-100">Sistema de Gestión de Citas Médicas</p>
            </div>
          </div>
        </div>
        
        {userType === 'patient' ? (
          <nav className="flex space-x-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => onTabChange('book')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'book'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Agendar Cita</span>
            </button>
            <button
              onClick={() => onTabChange('appointments')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'appointments'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Mis Citas</span>
            </button>
          </nav>
        ) : (
          <nav className="flex space-x-1 bg-white/10 rounded-lg p-1">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-blue-600 shadow-md">
              <Calendar className="h-5 w-5" />
              <span>Mis Citas</span>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
