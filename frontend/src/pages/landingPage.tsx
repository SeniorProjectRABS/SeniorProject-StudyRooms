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
import "./Landing.css";
import AvailabilityPage from "./AvailabilityPage";
import { getTimeSlots } from "../services/api";

// Import assets
// Note: You may need to adjust these paths based on your actual asset locations
import utrgvLogo from "../assets/utrgv-logo.png";
import buildingBackground from "../assets/cs-building.jpg";
import room2200 from "../assets/Room2200.jpg";
import map from "../assets/map.jpg";

interface TimeSlot {
  time_label: string;
  is_available: boolean;
}

interface AvailabilityPage {
  onClose: () => void;
}

const LandingPage: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailabilityPageOpen, setIsOpen] = useState<boolean>(false); //here we will
  // make sure that the button functions to make the availability page open
  // then we will create the page and make sure all buttons work correctly

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const data = await getTimeSlots();
        // Ensure all time slots are marked as available with proper typing
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

        // Use the mock time slots function
        setTimeSlots(createMockTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const handleFloorClick = (floor: number) => {
    // In the future, this could use React Router for navigation
    console.log(`Navigating to floor ${floor}`);
    window.location.href = `/floor${floor}`; // Fallback method
  };

  const handleRoomClick = (floor: number, roomNumber: string) => {
    console.log(`Navigating to room ${roomNumber} on floor ${floor}`);
    window.location.href = `/room${floor}`; // Fallback method
  };

  // Bootstrap modal handling
  useEffect(() => {
    // Initialize Bootstrap modal functionality
    // This ensures Bootstrap JS initializes the modal properly
    const initializeBootstrapComponents = () => {
      // Check if window and bootstrap are available (ensure it's client-side)
      if (typeof window !== "undefined") {
        // Wait for bootstrap to be available
        const checkBootstrap = () => {
          if (window.bootstrap) {
            const modalElement = document.getElementById("availabilityModal");
            if (modalElement) {
              // Initialize the modal
              new window.bootstrap.Modal(modalElement);
            }
          } else {
            // If bootstrap isn't loaded yet, try again after a short delay
            setTimeout(checkBootstrap, 100);
          }
        };

        checkBootstrap();
      }
    };

    initializeBootstrapComponents();
  }, []);

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
            data-bs-toggle="modal"
            data-bs-target="#availabilityModal"
            onClick={() => setIsOpen(true)}
          >
            Availability
          </button>
          {isAvailabilityPageOpen && (
            <AvailabilityPage
              onClose={() => setIsOpen(false)}
              isOpen={isAvailabilityPageOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
