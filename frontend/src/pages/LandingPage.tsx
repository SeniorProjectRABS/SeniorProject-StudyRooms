// Mock data in case API call fails during development - ALL AVAILABLE
const createMockTimeSlots = () => {
  return Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return {
      time_label: `${displayHour}:${minute === 0 ? "00" : minute} ${period}`,
      is_available: true, // All slots available
    };
  });
};
import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import AvailabilityPage from "./AvailabilityPage";
import { getTimeSlots } from "../services/api";

import utrgvLogo from "../assets/utrgv-logo.png";
import buildingBackground from "../assets/cs-building.jpg";
import room2200 from "../assets/Room2200.jpg";
import map from "../assets/map.jpg";

interface TimeSlot {
  time_label: string;
  is_available: boolean;
}

const LandingPage: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailabilityPageOpen, setIsAvailabilityPageOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const data = await getTimeSlots();
        const availableData = data.map(
          (slot: { time_label: string; is_available: boolean }) => ({
            ...slot,
            is_available: true,
          })
        );
        setTimeSlots(availableData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        setTimeSlots(createMockTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const handleFloorClick = (floor: number) => {
    console.log(`Navigating to floor ${floor}`);
    window.location.href = `/floor${floor}`;
  };

  const handleRoomClick = (floor: number, roomNumber: string) => {
    console.log(`Navigating to room ${roomNumber} on floor ${floor}`);
    window.location.href = `/room${floor}/${roomNumber}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="loading-text">Loading room information...</p>
      </div>
    );
  }

  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `url(${buildingBackground})` }}
    >
      <div className="header-div">
        <img className="header-image" src={utrgvLogo} alt="UTRGV Logo" />
      </div>
      <div className="h1">
        <div className="slideshow-div">
          <div
            id="carouselExampleControls"
            className="carousel slide carousel-fade"
            data-bs-ride="carousel"
            data-bs-interval="5000"
          >
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  className="slideshow d-block w-100"
                  src={room2200}
                  alt="Study Room"
                />
              </div>
              <div className="carousel-item">
                <img
                  className="slideshow d-block w-100"
                  src={map}
                  alt="Floor Map"
                />
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleControls"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleControls"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>
      <div className="parent-box">
        {error && (
          <div className="alert alert-warning m-3" role="alert">
            {error}
          </div>
        )}

        <div className="floor-selection-div">
          <div>
            <h1>Room Reservation</h1>
          </div>
          <div className="buttons">
            <button
              className="custom-button"
              onClick={() => handleFloorClick(1)}
            >
              Floor 1
            </button>
            <button
              className="custom-button"
              onClick={() => handleFloorClick(2)}
            >
              Floor 2
            </button>
            <button
              className="custom-button"
              onClick={() => handleFloorClick(3)}
            >
              Floor 3
            </button>
          </div>
        </div>

        <div className="rooms-available-div">
          <button
            className="custom-button"
            id="room-availability-button"
            onClick={() => setIsAvailabilityPageOpen(true)}
          >
            Availability
          </button>
        </div>
      </div>
      
      {isAvailabilityPageOpen && (
        <AvailabilityPage
          onClose={() => setIsAvailabilityPageOpen(false)}
          isOpen={isAvailabilityPageOpen}
        />
      )}
    </div>
  );
};

export default LandingPage;