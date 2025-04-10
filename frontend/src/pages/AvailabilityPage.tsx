import React from "react";
import "./AvailabilityPage.css";

interface TimeSlot {
  time_label: string;
  is_available: boolean;
}

interface AvailabilityPageProps {
  onClose: () => void;
  isOpen: boolean;
}

const AvailabilityPage: React.FC<AvailabilityPageProps> = ({ onClose, isOpen }) => {
  // Mock time slots - this would typically come from props or API
  const mockTimeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", 
    "10:30 AM", "11:00 AM", "11:30 AM"
  ];
  
  const rooms = [
    { floor: 1, rooms: ["EIEAB 1.203", "EIEAB 1.204"] },
    { floor: 2, rooms: ["EIEAB 2.203", "EIEAB 2.204"] },
    { floor: 3, rooms: ["EIEAB 3.205"] }
  ];

  // Just for demo - first room has all available slots, others have first slot unavailable
  const isAvailable = (roomIndex: number, slotIndex: number) => {
    if (roomIndex === 0) return true;
    return slotIndex !== 0;
  };

  return (
    <div className={`availability-modal ${isOpen ? "show" : ""}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Room Availability</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="modal-body">
          {rooms.map((floorData, floorIndex) => (
            <div key={floorIndex} className="floor-section">
              <h4>Floor {floorData.floor}</h4>
              
              {floorData.rooms.map((room, roomIndex) => (
                <div key={roomIndex} className="room-section">
                  <a href="#" className="room-link">{room}</a>
                  <div className="time-slots-row">
                    {mockTimeSlots.map((timeSlot, slotIndex) => (
                      <div 
                        key={slotIndex} 
                        className={`time-slot ${isAvailable(roomIndex + floorIndex, slotIndex) ? "available" : "unavailable"}`}
                      >
                        {timeSlot}
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