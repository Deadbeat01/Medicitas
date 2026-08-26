
import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, UserCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSpecialties, useHospitals, useDoctors, useCreateAppointment } from '@/hooks/useSupabaseData';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  userType: 'patient' | 'doctor';
}

interface AppointmentFormProps {
  currentUser: CurrentUser;
}

const AppointmentFormWithSupabase = ({ currentUser }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    hospitalId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  const { data: specialties = [], isLoading: loadingSpecialties } = useSpecialties();
  const { data: hospitals = [], isLoading: loadingHospitals } = useHospitals();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();
  const createAppointment = useCreateAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.hospitalId || !formData.doctorId || 
        !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.appointmentDate + 'T' + formData.appointmentTime);
    if (selectedDate <= new Date()) {
      toast({
        title: "Error",
        description: "La fecha y hora deben ser futuras",
        variant: "destructive",
      });
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
    
    try {
      await createAppointment.mutateAsync({
        patient_name: currentUser.name,
        email: currentUser.email,
        phone: '', // Will be updated from patient table
        doctor_id: formData.doctorId,
        specialty_id: selectedDoctor?.specialty_id || null,
        hospital_id: formData.hospitalId,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        reason: formData.reason,
        status: 'pending',
        patient_id: currentUser.id
      });

      toast({
        title: "¡Cita agendada exitosamente!",
        description: `Su cita con ${selectedDoctor?.name} ha sido programada para el ${formData.appointmentDate} a las ${formData.appointmentTime}`,
      });

      // Reset form
      setFormData({
        hospitalId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la cita. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="flex items-center space-x-2 text-2xl text-gray-800">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span>Agendar Nueva Cita</span>
        </CardTitle>
        <CardDescription>
          Complete el formulario para programar su cita médica
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information - Read only */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Información del Paciente</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="patientName">Nombre Completo</Label>
                <Input
                  id="patientName"
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="bg-gray-100 border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    readOnly
                    className="pl-10 bg-gray-100 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select value={formData.hospitalId} onValueChange={(value) => handleInputChange('hospitalId', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Seleccione un hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingHospitals ? (
                      <SelectItem value="loading" disabled>Cargando hospitales...</SelectItem>
                    ) : (
                      hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span>Detalles de la Cita</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Seleccione un doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <SelectItem value="loading" disabled>Cargando doctores...</SelectItem>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{doctor.name}</span>
                            <span className="text-sm text-gray-500">{doctor.specialty?.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Select value={formData.appointmentTime} onValueChange={(value) => handleInputChange('appointmentTime', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Seleccione una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de la Consulta</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <Textarea
                  id="reason"
                  placeholder="Describa brevemente el motivo de su consulta..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className="pl-10 min-h-20 border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={createAppointment.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {createAppointment.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Agendando cita...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agendar Cita</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentFormWithSupabase;
