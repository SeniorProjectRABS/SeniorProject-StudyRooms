import axiosInstance from "./axios";
import {
    StudyRoom,
    TimeSlot,
    Reservation // Using the interface defined in schema.ts
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

class ApiRepository{

    // ----- RESERVATIONS -----
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

    async updateReservation(
        reservationID:number,
        reservationData: Partial<CreateReservationPayload>,
    ): Promise<ReservationResponse> {
        const response = await axiosInstance.put(
            `/api/reservations/${reservationID}/`,
             reservationData,
        );
        return response.data;
    }
    async deleteReservation(reservationID: number): Promise<void>{
        await axiosInstance.delete(`/api/reservations/${reservationID}/`);
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

}

export const apiRepository = new ApiRepository();