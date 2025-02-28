// this will be the availability page popup
// i am creating this one on another page or file
// in order to keep a more organized code and be able to have a simpler better way of design

import React from "react";
import "./AvailabilityPage.css";

interface AvailabilityPageProps {
  onClose: () => void;
  isOpen: boolean; // we add this to make the popup window transition smooth
}

const AvailabilityPage: React.FC<AvailabilityPageProps> = ({ onClose }) => {
  return (
    <div className={'popup ${isOpen ? "show" : ""}'}>
      <div className="X">
        <button onClick={onClose} className="close-button">
          ✖
        </button>
        <div></div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
