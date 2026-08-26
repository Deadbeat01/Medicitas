
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';
import { toast } from '@/hooks/use-toast';

interface AppointmentsListProps {
  appointments: Appointment[];
  onAppointmentUpdate: (appointmentId: string, status: Appointment['status']) => void;
}

const AppointmentsList = ({ appointments, onAppointmentUpdate }: AppointmentsListProps) => {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    onAppointmentUpdate(appointmentId, 'cancelled');
    toast({
      title: "Cita cancelada",
      description: "Su cita ha sido cancelada exitosamente",
    });
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingAppointments = sortedAppointments.filter(apt => {
    const appointmentDateTime = new Date(apt.date + 'T' + apt.time);
    return appointmentDateTime > new Date() && apt.status !== 'cancelled';
  });

  const pastAppointments = sortedAppointments.filter(apt => {
    const appointmentDateTime = new Date(apt.date + 'T' + apt.time);
    return appointmentDateTime <= new Date() || apt.status === 'cancelled';
  });

  if (appointments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay citas programadas</h3>
            <p className="text-gray-500">Cuando agende una cita, aparecerá aquí.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>Próximas Citas</span>
          </h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-800 flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>{appointment.doctor}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {appointment.specialty}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                      {getStatusIcon(appointment.status)}
                      <span>{getStatusText(appointment.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{appointment.patientName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Motivo de la consulta:</p>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.status === 'pending' && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar Cita
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-gray-600" />
            <span>Historial de Citas</span>
          </h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="shadow-md opacity-75 border-l-4 border-l-gray-400">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-700 flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span>{appointment.doctor}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {appointment.specialty}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                      {getStatusIcon(appointment.status)}
                      <span>{getStatusText(appointment.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
