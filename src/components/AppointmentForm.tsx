
import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, UserCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Appointment, Doctor } from '@/types/appointment';

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: Appointment) => void;
}

const doctors: Doctor[] = [
  { id: '1', name: 'Dr. María González', specialty: 'Medicina General', available: true },
  { id: '2', name: 'Dr. Carlos Rodríguez', specialty: 'Cardiología', available: true },
  { id: '3', name: 'Dra. Ana Martínez', specialty: 'Dermatología', available: true },
  { id: '4', name: 'Dr. Luis Fernández', specialty: 'Pediatría', available: true },
  { id: '5', name: 'Dra. Carmen López', specialty: 'Ginecología', available: true },
];

const locales = [
  'Hospital de V.E.S',
  'Hospital de Surquillo',
  'Hospital de Jesús María',
  'Hospital de Miraflores',
  'Hospital de Chorrillos'
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const AppointmentForm = ({ onAppointmentCreated }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    local: '',
    doctor: '',
    date: '',
    time: '',
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.patientName || !formData.email || !formData.phone || 
        !formData.local || !formData.doctor || 
        !formData.date || !formData.time || !formData.reason) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date + 'T' + formData.time);
    if (selectedDate <= new Date()) {
      toast({
        title: "Error",
        description: "La fecha y hora deben ser futuras",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === formData.doctor);
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      email: formData.email,
      phone: formData.phone,
      doctor: selectedDoctor?.name || '',
      specialty: selectedDoctor?.specialty || '',
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onAppointmentCreated(newAppointment);
    
    toast({
      title: "¡Cita agendada exitosamente!",
      description: `Su cita con ${selectedDoctor?.name} ha sido programada para el ${formData.date} a las ${formData.time}`,
    });

    // Reset form
    setFormData({
      patientName: '',
      email: '',
      phone: '',
      local: '',
      doctor: '',
      date: '',
      time: '',
      reason: ''
    });

    setIsSubmitting(false);
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
          {/* Patient Information */}
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
                  placeholder="Ingrese su nombre completo"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+51 999-999-999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="local">Local</Label>
                <Select value={formData.local} onValueChange={(value) => handleInputChange('local', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Seleccione un local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((local) => (
                      <SelectItem key={local} value={local}>
                        {local}
                      </SelectItem>
                    ))}
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
                <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Seleccione un doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-gray-500">{doctor.specialty}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
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
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
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

export default AppointmentForm;
