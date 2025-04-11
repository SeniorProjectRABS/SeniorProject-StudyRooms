import React, { useState, useEffect } from "react";
import "./LandingPage.css"; 
import AvailabilityPage from "./AvailabilityPage";

// Import assets
import utrgvLogo from "../assets/utrgv-logo.png";
import buildingBackground from "../assets/cs-building.jpg";
import roomImage1 from "../assets/Room2200.jpg"; 
import roomImage2 from "../assets/map.jpg";     


const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(false); 
  const [isAvailabilityPageOpen, setIsAvailabilityPageOpen] = useState<boolean>(false);


  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `url(${buildingBackground})` }}
    >
      <div className="landing-header">
        <img className="landing-header-logo" src={utrgvLogo} alt="UTRGV Logo" />
      </div>

      <div className="landing-content-box">
        <div className="landing-carousel-container">
          <div
            id="roomCarousel" 
            className="carousel slide carousel-fade"
            data-bs-ride="carousel"
            data-bs-interval="4000" 
          >
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  className="landing-slideshow-image d-block w-100"
                  src={roomImage1}
                  alt="Study Room Example 1"
                />
              </div>
              <div className="carousel-item">
                <img
                  className="landing-slideshow-image d-block w-100"
                  src={roomImage2} 
                  alt="Study Room Example 2"
                />
              </div>

            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#roomCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#roomCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
        <h1 className="landing-title">EIEAB Study Room Reservations</h1>


        <div className="landing-button-container">
          <button
            className="landing-action-button"
            onClick={() => setIsAvailabilityPageOpen(true)}
            disabled={loading} 
          >
            {loading ? "Loading..." : "View Availability"}
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