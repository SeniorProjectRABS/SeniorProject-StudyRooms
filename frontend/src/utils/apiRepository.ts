import axiosInstance from "./axios";
import {
    StudyRoom,
    TimeSlot,
    Reservation
} from "./schema.ts";


class ApiRepository{


    // ----- RESERVATIONS -----
    async fetchReservations(): Promise<Reservation[]>{
        const response = await axiosInstance.get("/reservations/");
        return response.data;
    }

    async createReservation(
        reservationData: Partial<Reservation>,
    ): Promise<Reservation>{
        const response = await axiosInstance.post("/reservations/", reservationData);
        return response.data;
    }

    async fetchReservationByID(reservationID:number): Promise<Reservation>{
        const response = await axiosInstance.post(`/reservations/${reservationID}/`)
        return response.data;
    }

    async updateReservation(
        reservationID:number,
        reservationData: Partial<Reservation>,
    ): Promise<Reservation> {
        const response = await axiosInstance.put(
            `/reservations/${reservationID}/`,
             reservationData,
        )
        return response.data;
    }
    async deleteReservation(reservationID: number): Promise<void>{
        const response = await axiosInstance.delete(`/reservations/${reservationID}/`);
        return response.data;
    }

    async cancelReservation(reservationID: number): Promise<void>{
        const response = await axiosInstance.get(`/reservations/cancel/${reservationID}/`);
        return response.data;
    }
    async confirmReservation(reservationID: number): Promise<void>{
        const response = await axiosInstance.get(`/reservations/confirm/${reservationID}/`);
        return response.data;
    }

    // ----- TIME SLOTS -----
    async fetchTimeSlots(): Promise<TimeSlot[]> {
        const response = await axiosInstance.get("/timeslots");
        return response.data;
    }

    async fetchTimeSlotByID(timeSlotID: number): Promise<TimeSlot>{
        const response = await axiosInstance.get(`/timeslots/${timeSlotID}/`);
        return response.data;
    }

    async fetchAvailableTimeSlots(date:string): Promise<TimeSlot[]>{
        const response = await axiosInstance.get("/timeslots/availability/", {
            params: { // Use the 'params' option to send query parameters
                date: date, // Send the 'date' argument as the 'date' query parameter
            },
        });
        return response.data;
    }

    // ----- USERS -----
    // TO BE ADDED LATER (MAYBE?)

    // ----- STUDY ROOMS -----
    async fetchStudyRooms(): Promise<StudyRoom[]> {
    const response = await axiosInstance.get("/studyrooms", );
    return response.data;
    }

    async fetchStudyRoomByID(roomID: number): Promise<StudyRoom> {
    const response = await axiosInstance.get(`/studyrooms/${roomID}`);
    return response.data;
    }

}

export const apiRepository = new ApiRepository();

