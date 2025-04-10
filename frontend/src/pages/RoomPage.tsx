import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './RoomPage.css';
import { apiRepository } from '../utils/apiRepository';
import { StudyRoom, TimeSlot as ApiTimeSlot, Reservation } from '../utils/schema';

import utrgvLogo from "../assets/utrgv-logo.png";
import defaultRoomImage from "../assets/Room2200.jpg";
import whiteboardIcon from "../assets/icons/whiteboard.svg";
import chargingIcon from "../assets/icons/charging.svg";
import tvIcon from "../assets/icons/tv.svg";
import buildingBackground from "../assets/cs-building.jpg";

interface TimeSlotSelection extends ApiTimeSlot {
    selected: boolean;
    available: boolean;
}

const RoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<StudyRoom | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlotSelection[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);


    useEffect(() => {
        if (!roomId) {
            setError("Room ID is missing.");
            setLoading(false);
            return;
        }

        const fetchRoomData = async () => {
            setError(null);
            try {
                const roomData = await apiRepository.fetchStudyRoomByID(parseInt(roomId, 10));
                setRoom(roomData);
            } catch (err) {
                console.error("Failed to fetch room details:", err);
                setError("Could not load room details. Please try again.");
                setLoading(false); 
            }
        };

        fetchRoomData();
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !room) {
             if (room) setLoading(true);
             return;
        }


        const fetchAvailability = async () => {
             setError(null);
            try {
                const allPossibleSlots = await apiRepository.fetchTimeSlots();
                const availableSlotsData = await apiRepository.fetchAvailableTimeSlots(currentDate);
                const availableSlotIds = new Set(availableSlotsData.map(slot => slot.id));

                const mergedSlots: TimeSlotSelection[] = allPossibleSlots.map(slot => ({
                    ...slot,
                    selected: false,
                    available: availableSlotIds.has(slot.id),
                }));

                setTimeSlots(mergedSlots);
                setSelectedSlots([]);

            } catch (err) {
                console.error("Failed to fetch time slots or availability:", err);
                setError("Could not load time slot availability.");
                setTimeSlots([]);
            } finally {
                setLoading(false); 
            }
        };

        fetchAvailability();
    }, [roomId, room, currentDate]);

    const handleTimeSlotClick = (clickedSlotId: number) => {
        const clickedIndex = timeSlots.findIndex(slot => slot.id === clickedSlotId);
        if (clickedIndex === -1 || !timeSlots[clickedIndex].available) return;

        const currentSelection = [...selectedSlots];
        const alreadySelected = currentSelection.includes(clickedSlotId);

        let newSelection: number[] = [];

        if (alreadySelected) {
             newSelection = [];
        } else {
             if (currentSelection.length === 0) {
                 newSelection = [clickedSlotId];
             } else {
                 const selectedIndices = currentSelection.map(id => timeSlots.findIndex(s => s.id === id));
                 const minSelectedIndex = Math.min(...selectedIndices);
                 const maxSelectedIndex = Math.max(...selectedIndices);

                 if (clickedIndex < minSelectedIndex) {
                     for (let i = clickedIndex; i <= maxSelectedIndex; i++) {
                         if (timeSlots[i]?.available) newSelection.push(timeSlots[i].id); 
                         else { newSelection = [clickedSlotId]; break; } 
                     }
                 } else if (clickedIndex > maxSelectedIndex) {
                     for (let i = minSelectedIndex; i <= clickedIndex; i++) {
                         if (timeSlots[i]?.available) newSelection.push(timeSlots[i].id); 
                          else { newSelection = [clickedSlotId]; break; } 
                     }
                 } else {
                     newSelection = []; 
                 }
            }
        }

         const MAX_SLOTS = 4;
         if (newSelection.length > MAX_SLOTS) {
             alert(`You can only select up to ${MAX_SLOTS / 2} hours (${MAX_SLOTS} time slots).`);
             newSelection = newSelection.slice(0, MAX_SLOTS);
         }

         if (newSelection.length > 1) {
            const sortedIndices = newSelection
                .map(id => timeSlots.findIndex(s => s.id === id))
                .sort((a, b) => a - b);
            for (let i = 0; i < sortedIndices.length - 1; i++) {
                if (sortedIndices[i+1] !== sortedIndices[i] + 1) {
                    alert("Please select consecutive time slots.");
                    newSelection = [clickedSlotId];
                    break;
                }
                if (!timeSlots[sortedIndices[i+1]]?.available) {
                     alert("Cannot select range over an unavailable time slot.");
                     newSelection = [clickedSlotId];
                     break;
                }
            }
         }

        setSelectedSlots(newSelection);

        setTimeSlots(prevSlots => prevSlots.map(slot => ({
            ...slot,
            selected: newSelection.includes(slot.id)
        })));
    };

     const handleReserveClick = async () => {
         if (selectedSlots.length === 0) {
             alert("Please select at least one time slot.");
             return;
         }

         const studentId = "20448443"; 
         let studentPk: number;

         switch(studentId) {
            case "20448443": studentPk = 1; break;
            case "20312345": studentPk = 2; break;
            case "12345678": studentPk = 3; break;
            case "23112402": studentPk = 4; break;
            default:
                alert("Demo student ID not found. Cannot reserve.");
                return;
         }


         if (!room) {
             alert("Room data not loaded.");
             return;
         }

         const reservationData: Partial<Reservation> = {
             student: studentPk,
             study_room: room.id,
             timeslots: selectedSlots,
             date: currentDate,
         };

         console.log("Attempting reservation with data:", reservationData);
         setLoading(true); 
         setError(null); 

         try {
             const createdReservation = await apiRepository.createReservation(reservationData);
             console.log("Reservation successful:", createdReservation);

             const studentEmail = createdReservation.student?.email || "[student email not available]";
             alert(`Reservation submitted! Please check your email (${studentEmail}) to confirm within 1 hour.`);

             navigate('/');
         } catch (error: any) {
              console.error("Reservation failed:", error.response?.data || error.message);
              const errorDetail = error.response?.data?.detail;
              const nonFieldErrors = error.response?.data?.non_field_errors?.join(', ');
              const timeslotErrors = error.response?.data?.timeslots?.join(', ');
              const studentErrors = error.response?.data?.student?.join(', ');
              const roomErrors = error.response?.data?.study_room?.join(', '); 

              const errorMsg = errorDetail || nonFieldErrors || timeslotErrors || studentErrors || roomErrors || "An error occurred during reservation.";

              setError(`Reservation failed: ${errorMsg}`);
              alert(`Reservation failed: ${errorMsg}`);
         } finally {
             setLoading(false); 
         }
     };


    if (loading && !room) { 
        return <div className="loading-container room-loading">Loading Room...</div>;
    }

     if (!loading && (error || !room)) {
         return <div className="error-container room-error">{error || "Room not found."}</div>;
     }


    const firstSelected = timeSlots.find(ts => ts.id === selectedSlots[0]);
    const lastSelected = timeSlots.find(ts => ts.id === selectedSlots[selectedSlots.length - 1]);

    return (
        <div className="room-page-container" style={{ backgroundImage: `url(${buildingBackground})` }}>
            <div className="room-parent-box">
                <div className="room-header-div">
                    <img className="room-header-image" src={utrgvLogo} alt="UTRGV Logo" />
                    <div className="room-header-text">
                        <p className="room-header-writing">EIEAB Room {room?.room_number}</p>
                    </div>
                </div>

                <div className="room-center-body">
                    <div className="room-features-container">
                        <p className="room-features-title">Features:</p>
                        <div className="room-feature-item">
                            <img src={whiteboardIcon} alt="Whiteboard" /> <span>Whiteboard</span>
                        </div>
                        <div className="room-feature-item">
                            <img src={chargingIcon} alt="Charging" /> <span>Charging Stations</span>
                        </div>
                        <div className="room-feature-item">
                            <img src={tvIcon} alt="TV" /> <span>Television</span>
                        </div>
                    </div>

                    <div className="room-image-container">
                        <img className="room-body-image" src={defaultRoomImage} alt={`Study Room ${room?.room_number}`} />
                    </div>

                </div>

                <div className="room-bottom-section">
                    <p className="room-seat-info">Seats available: 5</p>

                     {firstSelected && lastSelected && (
                         <p className="room-selected-time">
                             Selected: {firstSelected.start_time} to {lastSelected.end_time}
                         </p>
                     )}


                    {loading && timeSlots.length === 0 && <p className="loading-text">Loading availability...</p> }
                    {!loading && error && timeSlots.length === 0 && <p className="room-error-message">{error}</p>}

                    <div className="room-time-slots-container">
                        <div className="room-reserve-blocks">
                            {timeSlots.map((slot) => (
                                <div key={slot.id} className="room-time-block-item">
                                    <p className="room-time-text">{slot.start_time}</p>
                                    <div
                                        className={`room-block ${!slot.available ? 'unavailable' : ''} ${slot.selected ? 'selected' : ''}`}
                                        onClick={() => handleTimeSlotClick(slot.id)}
                                        title={slot.available ? `${slot.start_time} - ${slot.end_time}` : 'Unavailable'}
                                    >
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     {error && <div className="room-error-message">{error}</div>}

                    <div className="room-button-bot">
                         <button
                            type="button"
                            className="custom-button reserve-button"
                            onClick={handleReserveClick}
                            disabled={selectedSlots.length === 0 || loading} 
                         >
                            {loading ? 'Reserving...' : 'RESERVE'}
                         </button>
                        <Link to="/" className="custom-button back-button">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomPage;