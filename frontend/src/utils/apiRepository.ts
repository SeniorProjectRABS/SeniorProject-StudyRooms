import axiosInstance from "./axios";
import {
    StudyRoom,
    TimeSlot,
    Reservation, 
    Student 
} from "./schema.ts";


interface CreateReservationPayload {
    student: number;       // Student Primary Key
    study_room: number;    // StudyRoom Primary Key
    timeslots: number[];   // Array of TimeSlot Primary Keys
    date: string;          // YYYY-MM-DD format
}


interface ReservationResponse {
    id: number;
    status: string;
    start_time: string;
    end_time: string;
    created_at: string;
    student: { id: number; name: string; email: string; student_id: string } | number;
    study_room: { id: number; room_number: string; floor: string } | number;
    date: string;
    timeslots: number[];
 }


interface ActionResponse {
    message: string;
}


const DEMO_STUDENTS: Student[] = [
     { id: 1, student_id: '20448443', name: 'Bradley Puga', email: 'bradley.puga02@utrgv.edu' },
     { id: 2, student_id: '20312345', name: 'Ruben Gonzalez', email: 'ruben.gonzalez02@utrgv.edu' },
     { id: 3, student_id: '12345678', name: 'Samantha Cadena', email: 'samantha.cadena01@utrgv.edu' },
     { id: 4, student_id: '23112402', name: 'Armamdo Vazquez', email: 'armamdo.vazquez01@utrgv.edu' },
];
// --- END TEMPORARY DEMO DATA ---

class ApiRepository{

    async fetchReservations(): Promise<ReservationResponse[]>{
        const response = await axiosInstance.get("/api/reservations/");
        return response.data;
    }

    async createReservation(
        reservationData: CreateReservationPayload,
    ): Promise<ReservationResponse>{
        const response = await axiosInstance.post("/api/reservations/", reservationData);
        return response.data;
    }

    async fetchReservationByID(reservationID:number): Promise<ReservationResponse>{
        const response = await axiosInstance.get(`/api/reservations/${reservationID}/`);
        return response.data;
    }



    async cancelReservation(reservationID: number): Promise<ActionResponse>{
        const response = await axiosInstance.get(`/api/reservations/cancel/${reservationID}/`);
        return response.data;
    }
    async confirmReservation(reservationID: number): Promise<ActionResponse>{
        const response = await axiosInstance.get(`/api/reservations/confirm/${reservationID}/`);
        return response.data;
    }

    // ----- TIME SLOTS -----
    async fetchTimeSlots(): Promise<TimeSlot[]> {
        const response = await axiosInstance.get("/api/timeslots/");
        return response.data;
    }

    async fetchTimeSlotByID(timeSlotID: number): Promise<TimeSlot>{
        const response = await axiosInstance.get(`/api/timeslots/${timeSlotID}/`);
        return response.data;
    }

    async fetchAvailableTimeSlots(date:string): Promise<TimeSlot[]>{
        const response = await axiosInstance.get("/api/timeslots/availability/", {
            params: { date: date },
        });
        return response.data;
    }

    // ----- STUDY ROOMS -----
    async fetchStudyRooms(): Promise<StudyRoom[]> {
        const response = await axiosInstance.get("/api/studyrooms/");
        return response.data;
    }

    async fetchStudyRoomByID(roomID: number): Promise<StudyRoom> {
        const response = await axiosInstance.get(`/api/studyrooms/${roomID}/`);
        return response.data;
    }

     // ----- STUDENTS -----

     // !! TEMPORARY DEMO FUNCTION !!
     // In a real app, replace this with an API call to a backend endpoint
     // like /api/students/find/?student_id=... or /api/students/find/?email=...
     async findStudentPk(identifier: string): Promise<number | null> {
         const normalizedIdentifier = identifier.trim().toLowerCase();
         const student = DEMO_STUDENTS.find(
             s => s.student_id === normalizedIdentifier || s.email.toLowerCase() === normalizedIdentifier
         );
         return student ? student.id : null;
     }
     // !! END TEMPORARY DEMO FUNCTION !!


}

export const apiRepository = new ApiRepository();