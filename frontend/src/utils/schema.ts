

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
}

export interface TimeSlot {
    id: number;        // Add this
    start_time: string;
    end_time: string;
}

export interface Reservation {
    student: number;
    studyRoom: number;
    timeslotIds: number[];
    date: string;
}
