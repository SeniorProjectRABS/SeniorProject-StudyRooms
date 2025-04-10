// frontend/src/pages/AvailabilityPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import "./AvailabilityPage.css";
import { apiRepository } from "../utils/apiRepository"; // Import apiRepository
import { StudyRoom, TimeSlot as ApiTimeSlot } from "../utils/schema"; // Import types

// Define a type for grouped rooms
interface GroupedRooms {
  [floor: string]: StudyRoom[];
}

interface AvailabilityPageProps {
  onClose: () => void;
  isOpen: boolean;
}

// --- Mock Time Slots (Keep for fallback or initial state) ---
const createMockTimeSlots = (): ApiTimeSlot[] => {
    // Example: Generating simple mock timeslots if needed
    const slots: ApiTimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
        slots.push({ id: hour * 2, start_time: `${hour}:00 AM/PM`, end_time: `${hour}:30 AM/PM` }); // Format needs adjustment
        slots.push({ id: hour * 2 + 1, start_time: `${hour}:30 AM/PM`, end_time: `${hour + 1}:00 AM/PM` }); // Format needs adjustment
    }
    return slots;
};
// --- End Mock Time Slots ---


const AvailabilityPage: React.FC<AvailabilityPageProps> = ({ onClose, isOpen }) => {
  const [groupedRooms, setGroupedRooms] = useState<GroupedRooms>({});
  const [allTimeSlots, setAllTimeSlots] = useState<ApiTimeSlot[]>([]); // To store all possible timeslots
  const [availabilityData, setAvailabilityData] = useState<{ [roomId: number]: { [timeSlotId: number]: boolean } }>({}); // Store availability status per room/timeslot
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]); // Get today's date in YYYY-MM-DD

  useEffect(() => {
    if (!isOpen) return; // Don't fetch if modal is closed

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all study rooms
        const roomsData = await apiRepository.fetchStudyRooms();
        const grouped: GroupedRooms = roomsData.reduce((acc, room) => {
          const floor = room.floor || 'Unknown Floor'; // Handle potential null floor
          if (!acc[floor]) {
            acc[floor] = [];
          }
          acc[floor].push(room);
          return acc;
        }, {} as GroupedRooms);
        setGroupedRooms(grouped);

        // Fetch all possible timeslots
        const timeSlotsData = await apiRepository.fetchTimeSlots();
        setAllTimeSlots(timeSlotsData);

        // --- Fetch Availability (Simplified for now) ---
        // This part is tricky with the current API. The modal shows ALL slots per room.
        // A better API would return availability per room for the given date.
        // Let's simulate it by fetching *all* available slots for the day and assuming
        // if a slot is *not* in the available list, it's unavailable *globally*.
        // THIS IS AN APPROXIMATION and needs a better backend endpoint for accuracy per room.
        const availableSlotsData = await apiRepository.fetchAvailableTimeSlots(currentDate);
        const availableSlotIds = new Set(availableSlotsData.map(slot => slot.id));

        const tempAvailability: { [roomId: number]: { [timeSlotId: number]: boolean } } = {};
        roomsData.forEach(room => {
            tempAvailability[room.id] = {};
            timeSlotsData.forEach(slot => {
                // Simplified logic: Assume available if it's in the global available list for the day
                tempAvailability[room.id][slot.id] = availableSlotIds.has(slot.id);
            });
        });
        setAvailabilityData(tempAvailability);
        // --- End Simplified Availability Fetch ---

      } catch (err) {
        console.error("Failed to fetch availability data:", err);
        setError("Failed to load room or availability data. Please try again later.");
        // Optionally set mock data as fallback
        // setGroupedRooms({ '1st': [{ id: 1, room_number: '1.203', floor: '1st' }, { id: 2, room_number: '1.205', floor: '1st' }], /* ... more floors */ });
        // setAllTimeSlots(createMockTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, currentDate]); // Refetch if the modal opens or date changes (if date selection is added later)


  // Helper to check availability (using the simplified state)
   const isSlotAvailable = (roomId: number, timeSlotId: number): boolean => {
     // Default to unavailable if data isn't loaded yet
     return availabilityData[roomId]?.[timeSlotId] ?? false;
   };


  return (
    <div className={`availability-modal ${isOpen ? "show" : ""}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Room Availability ({currentDate})</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          {loading && <p>Loading availability...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && Object.keys(groupedRooms).sort().map((floor) => (
            <div key={floor} className="floor-section">
              {/* Ensure floor name matches StudyRoom model (e.g., '1st', '2nd') */}
              <h4>{floor.includes('Floor') ? floor : `${floor} Floor`}</h4>

              {groupedRooms[floor].map((room) => (
                <div key={room.id} className="room-section">
                  {/* Use Link component */}
                  <Link to={`/room/${room.id}`} className="room-link" onClick={onClose}>
                    EIEAB {room.room_number} {/* Display room number */}
                  </Link>
                  <div className="time-slots-row">
                    {allTimeSlots.map((timeSlot) => (
                      <div
                        key={timeSlot.id}
                        className={`time-slot ${isSlotAvailable(room.id, timeSlot.id) ? "available" : "unavailable"}`}
                        title={`${timeSlot.start_time} - ${timeSlot.end_time}`} // Add tooltip for clarity
                      >
                        {/* Display only start time for brevity, or adjust as needed */}
                        {timeSlot.start_time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {!loading && !error && Object.keys(groupedRooms).length === 0 && <p>No rooms found.</p>}
        </div>

        <div className="modal-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="indicator available-indicator"></span>
              <p>Available</p>
            </div>
            <div className="legend-item">
              <span className="indicator unavailable-indicator"></span>
              <p>Unavailable</p>
            </div>
          </div>
          <button onClick={onClose} className="custom-button close-modal-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;