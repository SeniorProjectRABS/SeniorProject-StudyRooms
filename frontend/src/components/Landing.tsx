import React, { useState, useEffect } from 'react';
import './Landing.css';
import utrgvLogo from '../assets/utrgv-logo.svg'; 
import buildingBackground from '../assets/building-background.jpg'; 
import room2200 from '../assets/Room2200.jpg';
import map from '../assets/map.jpg'
import { getTimeSlots } from '../services/api';

const Landing: React.FC = () => {
    const [timeSlots, setTimeSlots] = useState<{ time_label: string; is_available: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                const data = await getTimeSlots();
                setTimeSlots(data);
            } catch (error) {
                console.error("Failed to fetch time slots:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeSlots();
    }, []);

    const handleFloorClick = (floor: number) => {
        console.log(`Navigating to floor ${floor}`);
    };

      const handleRoomClick = (room: number) => {
        console.log(`Navigating to room ${room}`);
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <div className="parent-box" style={{ backgroundImage: `url(${buildingBackground})` }}>
            <div className="header-div">
                <div className="image-div">
                    <img className="header-image" src={utrgvLogo} alt="UTRGV Logo" />
                </div>
                <div className="header-text">
                    <p className="header-writing">EIEAB Room Reservation System</p>
                </div>
            </div>

            <div className="slideshow-div">
                <div id="carouselExampleSlidesOnly" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval={5000}>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img className="slideshow" src={buildingBackground} alt="First slide" />
                        </div>
                        <div className="carousel-item">
                            <img src={room2200} className="slideshow" alt="Second slide" />
                        </div>
                        <div className="carousel-item">
                            <img src={map} className="slideshow" alt="Third slide" />
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleSlidesOnly" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleSlidesOnly" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <div className="floor-selection-div">
                <div className="button-div">
                    <button className="custom-button" onClick={() => handleFloorClick(1)}>Floor 1</button>
                </div>
                <div className="floor2-div">
                    <button className="custom-button" onClick={() => handleFloorClick(2)}>Floor 2</button>
                </div>
                <div className="floor3-div">
                    <button className="custom-button" onClick={() => handleFloorClick(3)}>Floor 3</button>
                </div>
            </div>

            <div className="rooms-available-div">
                <button className="custom-button" id="room-availability-button" onClick={openModal}>Availability</button>
            </div>

            {showModal && (
                <div className="modal fade bd-example-modal-lg show" style={{ display: 'block' }} id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title" id="exampleModalLabel">Room Availability</h3>
                                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-body-headers">
                                    <h4>Floor 1</h4>
                                     <h5 onClick={() => handleRoomClick(1)}>EIEAB 1.203</h5>
                                    <div className="table-container">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    {timeSlots.map((slot, index) => (
                                                        <td key={index} className={`time-slot ${slot.is_available ? 'available' : 'booked'}`}>
                                                            {slot.time_label}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                     <h5 onClick={() => handleRoomClick(1)}>EIEAB 1.204</h5>
                                    <div className="table-container">
                                       <table>
                                            <tbody>
                                                <tr>
                                                    {timeSlots.map((slot, index) => (
                                                        <td key={index} className={`time-slot ${slot.is_available ? 'available' : 'booked'}`}>
                                                            {slot.time_label}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <h4>Floor 2</h4>
                                     <h5 onClick={() => handleRoomClick(2)}>EIEAB 2.203</h5>
                                    <div className="table-container">
                                       <table>
                                            <tbody>
                                                <tr>
                                                    {timeSlots.map((slot, index) => (
                                                        <td key={index} className={`time-slot ${slot.is_available ? 'available' : 'booked'}`}>
                                                            {slot.time_label}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                     <h5 onClick={() => handleRoomClick(2)}>EIEAB 2.204</h5>
                                     <div className="table-container">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    {timeSlots.map((slot, index) => (
                                                        <td key={index} className={`time-slot ${slot.is_available ? 'available' : 'booked'}`}>
                                                            {slot.time_label}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <h4>Floor 3</h4>
                                     <h5 onClick={() => handleRoomClick(3)}>EIEAB 3.205</h5>
                                     <div className="table-container">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    {timeSlots.map((slot, index) => (
                                                        <td key={index} className={`time-slot ${slot.is_available ? 'available' : 'booked'}`}>
                                                            {slot.time_label}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-footer-text-div">
                                    <span className="label label-avail">  </span>
                                    <p>Available</p>
                                    <span className="label label-booked">  </span>
                                    <p>Unavailable</p>
                                </div>
                                <button type="button" className="custom-button" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
             {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Landing;