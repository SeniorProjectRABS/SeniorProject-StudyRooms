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

const LandingPage: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          >
            Availability
          </button>
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade bd-example-modal-lg"
        id="availabilityModal"
        tabIndex={-1}
        aria-labelledby="availabilityModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h3
                className="modal-title"
                id="availabilityModalLabel"
                style={{ fontFamily: "Patua One, serif" }}
              >
                Room Availability
              </h3>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Floor 1 Rooms */}
              <h4>Floor 1</h4>
              <h5 onClick={() => handleRoomClick(1, "1.203")}>EIEAB 1.203</h5>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <td key={index} className="time-slot">
                          {slot.time_label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h5 onClick={() => handleRoomClick(1, "1.204")}>EIEAB 1.204</h5>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <td key={index} className="time-slot">
                          {slot.time_label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Floor 2 Rooms */}
              <h4>Floor 2</h4>
              <h5 onClick={() => handleRoomClick(2, "2.203")}>EIEAB 2.203</h5>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <td key={index} className="time-slot">
                          {slot.time_label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h5 onClick={() => handleRoomClick(2, "2.204")}>EIEAB 2.204</h5>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <td key={index} className="time-slot">
                          {slot.time_label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Floor 3 Rooms */}
              <h4>Floor 3</h4>
              <h5 onClick={() => handleRoomClick(3, "3.205")}>EIEAB 3.205</h5>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr>
                      {timeSlots.slice(0, 8).map((slot, index) => (
                        <td key={index} className="time-slot">
                          {slot.time_label}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer-text-div">
                <span className="label label-avail">&nbsp;&nbsp;</span>
                <p style={{ padding: "5px 10px 0px 5px" }}>Available</p>
              </div>
              <button
                type="button"
                className="custom-button"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
