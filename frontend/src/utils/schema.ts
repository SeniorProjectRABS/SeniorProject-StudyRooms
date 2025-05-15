// frontend/src/utils/schema.ts

export interface Student {
    id: number;
    student_id: string;
    name: string;
    email: string;
}

export interface StudyRoom {
    id: number;
    room_number: string;
     floor: string;
    image_url?: string | null; 

}

export interface TimeSlot {
    id: number;
    start_time: string; // e.g., "09:00 AM"
    end_time: string;   // e.g., "09:30 AM"
}

// Interface for CREATING a reservation (Payload)
export interface Reservation {
    student: number;       // Student Primary Key
    study_room: number;    // StudyRoom Primary Key
    timeslots: number[];   // Array of TimeSlot Primary Keys
    date: string;          // YYYY-MM-DD format
}


export interface ReservationDetails extends Reservation {
    id: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    start_time: string; 
    end_time: string;  
    created_at: string;

    student: Student;
    study_room: StudyRoom;

}