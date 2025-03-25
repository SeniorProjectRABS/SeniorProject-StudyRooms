export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Student {
    student_id: string,
    name: string,
    email: string,
}

export interface StudyRoom {
    room_number: string,
    floor: string,
}

export interface TimeSlot {
    start_time: string;
    end_time: string;
}

export interface Reservation{
    studentId: string; // ForeignKey to Student, using student_id (CharField) as identifier
     studyRoomNumber: string; // ForeignKey to StudyRoom, using room_number (CharField) as identifier
    timeslots: TimeSlot[]; // ManyToManyField to TimeSlot, using the TimeSlot interface
    startTime: string | null; // TimeField, can be null, represented as string (or null)
    endTime: string | null;   // TimeField, can be null, represented as string (or null)
    date: string; // DateField, represented as string (ISO date format: YYYY-MM-DD)
    createdAt: string; // DateTimeField, represented as string (ISO datetime format)
    status: ReservationStatus;
}

