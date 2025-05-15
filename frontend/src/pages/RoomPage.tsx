import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './RoomPage.css';
import { apiRepository } from '../utils/apiRepository';
// Make sure your StudyRoom type in schema.ts (or models.ts) includes `image: string | null;`
import { StudyRoom, TimeSlot as ApiTimeSlot } from '../utils/schema';

import utrgvLogo from "../assets/utrgv-logo.png";
// We will use a dynamic image now, so defaultRoomImage import can be removed or commented out if no longer needed elsewhere.
// import defaultRoomImage from "../assets/Room2200.jpg";
import whiteboardIcon from "../assets/icons/whiteboard.svg";
import chargingIcon from "../assets/icons/charging.svg";
import tvIcon from "../assets/icons/tv.svg";
import buildingBackground from "../assets/cs-building.jpg";

interface TimeSlotSelection extends ApiTimeSlot {
    selected: boolean;
    available: boolean;
}

const MAX_SLOTS = 4;

// Define a placeholder image path (place an image like 'placeholder-room.png' in your frontend/public/ directory)
const PLACEHOLDER_ROOM_IMAGE_SRC = "/placeholder-room.png"; // Or .jpg, etc.

const RoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<StudyRoom | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlotSelection[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [startSlotId, setStartSlotId] = useState<number | null>(null);
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
                console.log("Fetched Room Data:", roomData);
                setRoom(roomData);
                // No change needed here as roomData should now include the 'image' field from the API
            } catch (err) {
                console.error("Failed to fetch room details:", err);
                setError("Could not load room details. Please try again.");
            } finally { // Ensure loading is set to false in the finally block if it wasn't set in try/catch
                setLoading(false);
            }
        };
        fetchRoomData();
    }, [roomId]);

    useEffect(() => {
          if (!roomId || !room) { // If room is not yet loaded, or roomId is missing
             if (!loading && !error) setLoading(true); // Set loading only if not already loading or errored
             return;
         }
        const fetchAvailability = async () => {
             setError(null); // Clear previous errors
             // setLoading(true); // Already handled by the outer loading state or previous effect
            try {
                console.log(`Fetching availability for room ${roomId} on ${currentDate}`);
                const allPossibleSlots = await apiRepository.fetchTimeSlots();
                 const roomReservations = await apiRepository.fetchReservations();
                 const reservedSlotsForRoomDate = new Set<number>();
                 roomReservations.forEach(res => {
                      const resRoomId = typeof res.study_room === 'number' ? res.study_room : res.study_room.id;
                      if (resRoomId === room.id && res.date === currentDate && (res.status === 'confirmed' || res.status === 'pending')) {
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
                setStartSlotId(null);

            } catch (err) {
                console.error("Failed to fetch time slots or availability:", err);
                setError("Could not load time slot availability.");
                setTimeSlots([]);
            } finally {
                // setLoading(false); // This loading state seems tied to room data, not just availability
            }
        };
        // Only fetch availability if room data is present
        if (room) {
            fetchAvailability();
        }
    }, [roomId, room, currentDate, loading, error]); // Added loading and error to dependencies to re-evaluate if they change


    const resetSelection = () => {
        setStartSlotId(null);
        setSelectedSlots([]);
        setTimeSlots(prevSlots => prevSlots.map(slot => ({ ...slot, selected: false })));
    };

    const handleTimeSlotClick = (clickedSlotId: number) => {
        const clickedSlot = timeSlots.find(slot => slot.id === clickedSlotId);
        if (!clickedSlot || !clickedSlot.available) return;

        if (startSlotId === null) {
            setStartSlotId(clickedSlotId);
            setSelectedSlots([clickedSlotId]);
            setTimeSlots(prevSlots => prevSlots.map(slot => ({
                ...slot,
                selected: slot.id === clickedSlotId
            })));
        } else {
            if (clickedSlotId === startSlotId) {
                resetSelection();
                return;
            }

            const startIndex = timeSlots.findIndex(slot => slot.id === startSlotId);
            const endIndex = timeSlots.findIndex(slot => slot.id === clickedSlotId);

            if (startIndex === -1 || endIndex === -1) {
                console.error("Error finding slot indices");
                resetSelection();
                return;
            }

            const rangeStart = Math.min(startIndex, endIndex);
            const rangeEnd = Math.max(startIndex, endIndex);
            const slotsInRange = timeSlots.slice(rangeStart, rangeEnd + 1);

            if (slotsInRange.length > MAX_SLOTS) {
                alert(`Selection exceeds the maximum duration of ${MAX_SLOTS / 2} hours (${MAX_SLOTS} slots). Please select a shorter range.`);
                resetSelection();
                return;
            }

            const allAvailable = slotsInRange.every(slot => slot.available);
            if (!allAvailable) {
                alert("The selected range includes unavailable time slots. Please select a valid range.");
                resetSelection();
                return;
            }

            const newSelectionIds = slotsInRange.map(slot => slot.id);
            setSelectedSlots(newSelectionIds);
            setTimeSlots(prevSlots => prevSlots.map((slot, index) => ({
                ...slot,
                selected: index >= rangeStart && index <= rangeEnd
            })));
            setStartSlotId(null);
        }
    };

    const handleReserveClick = () => {
        if (selectedSlots.length === 0 || startSlotId !== null) {
            alert("Please select a complete time slot range.");
            return;
        }
        if (!room) {
            alert("Room data not loaded.");
            return;
        }

        const firstSelectedSlot = timeSlots.find(ts => ts.id === selectedSlots[0]);
         const sortedSelectedIds = [...selectedSlots].sort((a, b) => {
             const indexA = timeSlots.findIndex(s => s.id === a);
             const indexB = timeSlots.findIndex(s => s.id === b);
             return indexA - indexB;
         });
        const lastSelectedSlot = timeSlots.find(ts => ts.id === sortedSelectedIds[sortedSelectedIds.length - 1]);


        if (!firstSelectedSlot || !lastSelectedSlot) {
             alert("Error identifying selected time range.");
             return;
         }


        const reservationDetails = {
            roomId: room.id,
            roomNumber: room.room_number,
            date: currentDate,
            selectedSlots: sortedSelectedIds,
            startTime: firstSelectedSlot.start_time,
            endTime: lastSelectedSlot.end_time,
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
                    <Link to="/" className="custom-button">
                        Back to Home
                    </Link>
               </div>
            </div>
            );
    }

    if (!room) {
        // This case should ideally be covered by the loading or error state if fetchRoomData fails.
        // But as a fallback:
        return (
            <div className="room-page-container" style={{ backgroundImage: `url(${buildingBackground})` }}>
                <div className="error-container room-error">
                    <p>Room data could not be loaded.</p>
                    <Link to="/" className="custom-button">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }


    let selectedTimeText = "Select a start time slot below";
    if (startSlotId !== null) {
        const startSlot = timeSlots.find(ts => ts.id === startSlotId);
        selectedTimeText = `Selected start: ${startSlot?.start_time}. Now select an end time slot.`;
    } else if (selectedSlots.length > 0) {
         const sortedSelectedIds = [...selectedSlots].sort((a, b) => {
            const indexA = timeSlots.findIndex(s => s.id === a);
            const indexB = timeSlots.findIndex(s => s.id === b);
            return indexA - indexB;
         });
        const firstSelected = timeSlots.find(ts => ts.id === sortedSelectedIds[0]);
        const lastSelected = timeSlots.find(ts => ts.id === sortedSelectedIds[sortedSelectedIds.length - 1]);
        if (firstSelected && lastSelected) {
            selectedTimeText = `Selected: ${firstSelected.start_time} to ${lastSelected.end_time}`;
        }
    }


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
                         {/* MODIFIED IMAGE SOURCE HERE */}
                         <img
                            className="room-body-image"
                            src={room.image_url || PLACEHOLDER_ROOM_IMAGE_SRC}
                            alt={`Study Room ${room.room_number}`}
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_ROOM_IMAGE_SRC; }}
                         />
                     </div>
                </div>
                <div className="room-bottom-section">
                    <p className="room-seat-info">Seats available: 5</p>

                    <p className="room-selected-time">
                        {selectedTimeText}
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
                            disabled={selectedSlots.length === 0 || startSlotId !== null || loading}
                         >
                             RESERVE
                         </button>
                        <Link to="/" className="custom-button">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomPage;