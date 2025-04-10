import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AvailabilityPage.css";
import { apiRepository } from "../utils/apiRepository";
import { StudyRoom, TimeSlot as ApiTimeSlot, ReservationDetails } from "../utils/schema";

interface GroupedRooms {
  [floor: string]: StudyRoom[];
}

interface RoomAvailability {
    [roomId: number]: { 
        [timeSlotId: number]: boolean;
    };
}


interface AvailabilityPageProps {
  onClose: () => void;
  isOpen: boolean;
}



const AvailabilityPage: React.FC<AvailabilityPageProps> = ({ onClose, isOpen }) => {
  const [groupedRooms, setGroupedRooms] = useState<GroupedRooms>({});
  const [allTimeSlots, setAllTimeSlots] = useState<ApiTimeSlot[]>([]);
  const [availabilityData, setAvailabilityData] = useState<RoomAvailability>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) {
        return;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setAvailabilityData({}); 

      try {
        const [roomsData, timeSlotsData, reservationsData] = await Promise.all([
             apiRepository.fetchStudyRooms(),
             apiRepository.fetchTimeSlots(),
             apiRepository.fetchReservations() 
        ]);


        const grouped: GroupedRooms = roomsData.reduce((acc, room) => {
          const floor = room.floor || 'Unknown Floor';
          if (!acc[floor]) {
            acc[floor] = [];
          }
          acc[floor].push(room);
          return acc;
        }, {} as GroupedRooms);
        setGroupedRooms(grouped);
        setAllTimeSlots(timeSlotsData);


        const tempAvailability: RoomAvailability = {};

        roomsData.forEach(room => {
            tempAvailability[room.id] = {};
            timeSlotsData.forEach(slot => {
                tempAvailability[room.id][slot.id] = true; 
            });
        });

        const relevantReservations = reservationsData.filter(
            res => res.date === currentDate && (res.status === 'confirmed' || res.status === 'pending')
        );

        relevantReservations.forEach(res => {
            const roomId = typeof res.study_room === 'number' ? res.study_room : res.study_room.id;

             if (tempAvailability[roomId]) {
                res.timeslots.forEach(slotId => {
                     if (tempAvailability[roomId].hasOwnProperty(slotId)) { 
                        tempAvailability[roomId][slotId] = false; 
                     }
                });
             } else {
                 console.warn(`Reservation found for unknown room ID: ${roomId}`);
             }
        });

        setAvailabilityData(tempAvailability);

      } catch (err) {
        console.error("Failed to fetch availability data:", err);
        setError("Failed to load room or availability data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, currentDate]); 


   const isSlotAvailable = (roomId: number, timeSlotId: number): boolean => {
     return availabilityData[roomId]?.[timeSlotId] ?? false;
   };


  return (
    <div className={`availability-modal ${isOpen ? "show" : ""}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Room Availability ({new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          {loading && <p>Loading availability...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && Object.keys(groupedRooms).length === 0 && <p>No rooms found.</p>}

          {!loading && !error && Object.keys(groupedRooms).sort().map((floor) => (
            <div key={floor} className="floor-section">
              <h4>{floor.includes('Floor') ? floor : `${floor} Floor`}</h4>

              {groupedRooms[floor].sort((a,b) => a.room_number.localeCompare(b.room_number)).map((room) => ( // Sort rooms numerically
                <div key={room.id} className="room-section">
                  <Link to={`/room/${room.id}`} className="room-link" onClick={onClose}>
                    EIEAB {room.room_number}
                  </Link>
                  <div className="time-slots-row">
                    {allTimeSlots.map((timeSlot) => (
                      <div
                        key={timeSlot.id}
                        className={`time-slot ${isSlotAvailable(room.id, timeSlot.id) ? "available" : "unavailable"}`}
                        title={isSlotAvailable(room.id, timeSlot.id)
                                ? `${timeSlot.start_time} - ${timeSlot.end_time} (Available)`
                                : `${timeSlot.start_time} - ${timeSlot.end_time} (Unavailable)`
                            } 
                      >
                        {timeSlot.start_time.replace(/ (AM|PM)$/, '')} 
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
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