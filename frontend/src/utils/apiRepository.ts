import axiosInstance from "./axios";
import {
    StudyRoom,
    TimeSlot,
    Student,
    ReservationDetails 
} from "./schema.ts";


interface CreateReservationPayload {
    student: string;      
    study_room: number;    
    timeslots: number[];   
    date: string;          
}


interface ReservationResponse {
    id: number;
    status: string;
    start_time: string;
    end_time: string;
    created_at: string;
    student: Student | number | string; 
    study_room: StudyRoom | number; 
    date: string;
    timeslots: number[];
 }


interface ActionResponse {
    message: string;
}


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



}

export const apiRepository = new ApiRepository();