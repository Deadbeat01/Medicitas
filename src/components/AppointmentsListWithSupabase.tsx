import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAppointments, useUpdateAppointment, SupabaseAppointment } from '@/hooks/useSupabaseData';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  userType: 'patient' | 'doctor';
}

interface AppointmentsListProps {
  currentUser: CurrentUser;
}

const AppointmentsListWithSupabase = ({ currentUser }: AppointmentsListProps) => {
  const { data: appointments = [], isLoading } = useAppointments();
  const updateAppointment = useUpdateAppointment();

  // Filter appointments based on user type
  const filteredAppointments = appointments.filter(appointment => {
    if (currentUser.userType === 'patient') {
      return appointment.patient_id === currentUser.id;
    } else if (currentUser.userType === 'doctor') {
      return appointment.doctor_id === currentUser.id;
    }

    return false;
  });

  const getStatusColor = (status: SupabaseAppointment['status']) => {
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

  const getStatusIcon = (status: SupabaseAppointment['status']) => {
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

  const getStatusText = (status: SupabaseAppointment['status']) => {
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
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment.mutateAsync({ id: appointmentId, status: 'cancelled' });
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar el estado:", error?.message || error);
      toast({
        title: "Error",
        description: error?.message || "Error al cancelar la cita. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment.mutateAsync({ id: appointmentId, status: 'confirmed' });
      toast({
        title: "Cita confirmada",
        description: "La cita ha sido confirmada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast({
        title: "Error",
        description: "Error al confirmar la cita. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment.mutateAsync({ id: appointmentId, status: 'completed' });
      toast({
        title: "Cita completada",
        description: "La cita ha sido marcada como completada",
      });
    } catch (error: any) {
      console.error("Error al completar cita:", error?.message || error); 
      toast({
        title: "Error",
        description: error?.message || "Error al completar la cita. Intente nuevamente.",
        variant: "destructive",
      });
    }

  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando citas...</h3>
            <p className="text-gray-500">Un momento por favor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
    const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
    return dateA.getTime() - dateB.getTime();
  });

  const now = new Date();

  // Para doctores: solo mostrar citas futuras que están pendientes o confirmadas
  // Para pacientes: mostrar todas las citas pendientes y confirmadas (incluso vencidas)
  const upcomingAppointments = sortedAppointments.filter(apt => {
    const appointmentDateTime = new Date(apt.appointment_date + 'T' + apt.appointment_time);
    
    if (currentUser.userType === 'doctor') {
      // Para doctores: solo citas futuras pendientes o confirmadas
      return appointmentDateTime > now && (apt.status === 'pending' || apt.status === 'confirmed');
    } else {
      // Para pacientes: todas las citas pendientes y confirmadas
      return apt.status === 'pending' || apt.status === 'confirmed';
    }
  });

  // Solo las citas completadas o canceladas van al historial
  const pastAppointments = sortedAppointments.filter(apt => {
    return apt.status === 'completed' || apt.status === 'cancelled';
  });

  if (filteredAppointments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay citas programadas</h3>
            <p className="text-gray-500">
              {currentUser.userType === 'patient' 
                ? 'Cuando agende una cita, aparecerá aquí.' 
                : 'No tiene citas asignadas actualmente.'
              }
            </p>
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
                        <span>
                          {currentUser.userType === 'patient' 
                            ? (appointment.doctor?.name || 'Doctor no asignado')
                            : appointment.patient_name
                          }
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {appointment.specialty?.name || 'Especialidad no especificada'}
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
                        <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>
                          {currentUser.userType === 'patient' 
                            ? (appointment.doctor?.name || 'Doctor no asignado')
                            : appointment.patient_name
                          }
                        </span>
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
                  
                  <div className="flex justify-end space-x-2">
                    {currentUser.userType === 'patient' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={updateAppointment.isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    
                    {currentUser.userType === 'doctor' && (
                      <>
                        {appointment.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            disabled={updateAppointment.isPending}
                            className="text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        
                        {appointment.status?.toLowerCase() === 'confirmed' && new Date(appointment.appointment_date + 'T' + appointment.appointment_time) <= now && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          disabled={updateAppointment.isPending}
                          className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Atendida
                        </Button>
                      )}

                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={updateAppointment.isPending}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
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
                        <span>
                          {currentUser.userType === 'patient' 
                            ? (appointment.doctor?.name || 'Doctor no asignado')
                            : appointment.patient_name
                          }
                        </span>
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {appointment.specialty?.name || 'Especialidad no especificada'}
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
                        <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.appointment_time}</span>
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

export default AppointmentsListWithSupabase;
