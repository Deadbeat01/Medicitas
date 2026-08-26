
export interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}
