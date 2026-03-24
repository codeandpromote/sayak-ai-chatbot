export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Appointment {
  id: string;
  tenantId: string;
  chatbotId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface WeeklySchedule {
  mon: TimeSlot[];
  tue: TimeSlot[];
  wed: TimeSlot[];
  thu: TimeSlot[];
  fri: TimeSlot[];
  sat: TimeSlot[];
  sun: TimeSlot[];
}

export interface BookingConfig {
  timezone: string;
  slotDurationMin: number;
  bufferMin: number;
  maxAdvanceDays: number;
  weeklySchedule: WeeklySchedule;
}
