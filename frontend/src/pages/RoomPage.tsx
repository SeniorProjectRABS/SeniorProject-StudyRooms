import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './RoomPage.css';
import { apiRepository } from '../utils/apiRepository';
import { StudyRoom, TimeSlot as ApiTimeSlot } from '../utils/schema'; 

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
            setLoading(true);
            setError(null);
            try {
                const roomData = await apiRepository.fetchStudyRoomByID(parseInt(roomId, 10));
                setRoom(roomData);
            } catch (err) {
                console.error("Failed to fetch room details:", err);
                setError("Could not load room details. Please try again.");
            } finally {
                 // Don't set loading false here, wait for availability
            }
        };
        fetchRoomData();
    }, [roomId]);


    useEffect(() => {
          if (!roomId || !room) {
             if (room && loading === false) setLoading(true);
             return;
         }

        const fetchAvailability = async () => {
             setError(null); 
            try {
                console.log(`Fetching availability for room ${roomId} on ${currentDate}`);
                const allPossibleSlots = await apiRepository.fetchTimeSlots();

                 const roomReservations = await apiRepository.fetchReservations();
                 const reservedSlotsForRoomDate = new Set<number>();
                 roomReservations.forEach(res => {
                     if (res.study_room === room.id && res.date === currentDate && (res.status === 'confirmed' || res.status === 'pending')) {
                         res.timeslots.forEach(slotId => reservedSlotsForRoomDate.add(slotId));
                     }
                 });


                const mergedSlots: TimeSlotSelection[] = allPossibleSlots.map(slot => ({
                    ...slot,
                    selected: false,
                     available: !reservedSlotsForRoomDate.has(slot.id),
                }));

                console.log("Merged Slots:", mergedSlots);
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

        const currentSelectionIds = [...selectedSlots]; 

        let newSelectionIds: number[] = [];
        const isCurrentlySelected = currentSelectionIds.includes(clickedSlotId);

        if (isCurrentlySelected) {
            newSelectionIds = [];
        } else {
            if (currentSelectionIds.length === 0) {
                newSelectionIds = [clickedSlotId];
            } else {
                const selectedIndices = currentSelectionIds.map(id => timeSlots.findIndex(s => s.id === id)).sort((a, b) => a - b);
                const minSelectedIndex = selectedIndices[0];
                const maxSelectedIndex = selectedIndices[selectedIndices.length - 1];

                if (clickedIndex === minSelectedIndex - 1) { 
                    if (timeSlots[clickedIndex].available) {
                        newSelectionIds = [clickedSlotId, ...currentSelectionIds];
                    } else {
                        newSelectionIds = [clickedSlotId]; 
                    }
                } else if (clickedIndex === maxSelectedIndex + 1) { 
                     if (timeSlots[clickedIndex].available) {
                        newSelectionIds = [...currentSelectionIds, clickedSlotId];
                    } else {
                        newSelectionIds = [clickedSlotId]; 
                    }
                } else {
                    newSelectionIds = [clickedSlotId];
                }
            }
        }


         const MAX_SLOTS = 4; 
         if (newSelectionIds.length > MAX_SLOTS) {
             alert(`You can only select up to ${MAX_SLOTS / 2} hours (${MAX_SLOTS} time slots).`);
             newSelectionIds = newSelectionIds.includes(clickedSlotId) ? [clickedSlotId] : [];
         }

         if (newSelectionIds.length > 1) {
             const sortedIndices = newSelectionIds
                 .map(id => timeSlots.findIndex(s => s.id === id))
                 .sort((a, b) => a - b);

             let consecutive = true;
             for (let i = 0; i < sortedIndices.length - 1; i++) {
                 if (sortedIndices[i+1] !== sortedIndices[i] + 1) {
                     consecutive = false;
                     break;
                 }
                 if (!timeSlots[sortedIndices[i+1]]?.available) {
                     consecutive = false;
                     break;
                 }
             }

             if (!consecutive) {
                 alert("Please select consecutive available time slots.");
                 newSelectionIds = newSelectionIds.includes(clickedSlotId) ? [clickedSlotId] : [];
             }
         }


        setSelectedSlots(newSelectionIds);

        setTimeSlots(prevSlots => prevSlots.map(slot => ({
            ...slot,
            selected: newSelectionIds.includes(slot.id)
        })));
    };

    const handleReserveClick = () => {
        if (selectedSlots.length === 0) {
            alert("Please select at least one time slot.");
            return;
        }
        if (!room) {
            alert("Room data not loaded.");
            return;
        }

        const firstSelectedSlot = timeSlots.find(ts => ts.id === selectedSlots[0]);
        const lastSelectedSlot = timeSlots.find(ts => ts.id === selectedSlots[selectedSlots.length - 1]);

        const reservationDetails = {
            roomId: room.id,
            roomNumber: room.room_number,
            date: currentDate,
            selectedSlots: selectedSlots,
            startTime: firstSelectedSlot?.start_time,
            endTime: lastSelectedSlot?.end_time,
        };

        console.log("Navigating to /reserve with state:", reservationDetails);
        navigate('/reserve', { state: reservationDetails });
    };

    if (loading) { 
        return <div className="loading-container room-loading">Loading Room & Availability...</div>;
    }

     if (error) { 
         return (
             <div className="room-page-container" style={{ backgroundImage: `url(${buildingBackground})` }}>
                <div className="error-container room-error">
                    <p>{error}</p>
                     <Link to="/" className="custom-button back-button">
                         Back to Home
                     </Link>
                </div>
             </div>
             );
     }

    if (!room) { 
         return <div className="error-container room-error">Room not found.</div>;
     }


    const firstSelected = selectedSlots.length > 0 ? timeSlots.find(ts => ts.id === selectedSlots[0]) : null;
    const lastSelected = selectedSlots.length > 0 ? timeSlots.find(ts => ts.id === selectedSlots[selectedSlots.length - 1]) : null;

    return (
        <div className="room-page-container" style={{ backgroundImage: `url(${buildingBackground})` }}>
            <div className="room-parent-box">
                <div className="room-header-div">
                     <img className="room-header-image" src={utrgvLogo} alt="UTRGV Logo" />
                     <div className="room-header-text">
                         <p className="room-header-writing">EIEAB Room {room.room_number}</p>
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
                         <img className="room-body-image" src={defaultRoomImage} alt={`Study Room ${room.room_number}`} />
                     </div>
                </div>
                <div className="room-bottom-section">
                    <p className="room-seat-info">Seats available: 5</p>

                    <p className="room-selected-time">
                         {firstSelected && lastSelected
                             ? `Selected: ${firstSelected.start_time} to ${lastSelected.end_time}`
                             : 'Select a time slot below'}
                    </p>

                     {timeSlots.length === 0 && !loading && <p className="room-error-message">No time slots available for this date.</p>}
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

                     <div className="room-button-bot">
                         <button
                            type="button"
                            className="custom-button reserve-button"
                            onClick={handleReserveClick} 
                            disabled={selectedSlots.length === 0 || loading} 
                         >
                             RESERVE
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