import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRepository } from '../utils/apiRepository';

import utrgvLogo from "../assets/utrgv-logo.png";
import buildingBackground from "../assets/cs-building.jpg";
import './ReservationPage.css';

interface ReservationLocationState {
    roomId: number;
    roomNumber: string;
    date: string;
    selectedSlots: number[];
    startTime?: string;
    endTime?: string;
}


const ReservationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ReservationLocationState | null;

    const [studentIdInput, setStudentIdInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!state) {
            console.error("Reservation state missing. Redirecting home.");
            navigate('/');
        }
    }, [state, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);
        setError(null);

        if (!studentIdInput.trim()) {
            setFormError("Please enter your Student ID.");
            return;
        }

        const trimmedStudentId = studentIdInput.trim();


        if (!state) {
            setError("Reservation details are missing.");
            return;
        }

        const reservationData = {
            student: trimmedStudentId,
            study_room: state.roomId,
            timeslots: state.selectedSlots,
            date: state.date,
        };

        console.log("Submitting reservation with data (sending string student ID):", reservationData);
        setLoading(true);

        try {
            const createdReservation = await apiRepository.createReservation(reservationData);
            console.log("Reservation successful:", createdReservation);

            alert(`Reservation submitted! Please check your UTRGV email to confirm within 1 hour.`);
            navigate('/');
        } catch (err: any) {
            console.error("Reservation failed:", err.response?.data || err.message || err);
             let errorDetail = 'An unknown error occurred.';
             if (err.response?.data) {
                 const data = err.response.data;
                 errorDetail = data.detail ||
                              (Array.isArray(data.student) ? data.student.join(', ') : data.student) || 
                              (Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors) ||
                              (typeof data === 'string' ? data : JSON.stringify(data)); 
             } else {
                 errorDetail = err.message || errorDetail;
             }
            setError(`Reservation failed: ${errorDetail}.`);

        } finally {
            setLoading(false);
        }
    };

    if (!state) {
        return <div className="loading-container">Loading details...</div>;
    }

    return (
        <div className="reservation-page-container" style={{ backgroundImage: `url(${buildingBackground})` }}>
            <div className="reservation-parent-box">
                <div className="reservation-header-div">
                    <img className="reservation-header-image" src={utrgvLogo} alt="UTRGV Logo" />
                    <div className="reservation-header-text">
                        <p className="reservation-header-writing">Confirm Your Reservation</p>
                    </div>
                </div>

                <div className="reservation-main-content">
                    <h3>Booking Summary</h3>
                    <p><strong>Room:</strong> EIEAB {state.roomNumber}</p>
                    <p><strong>Date:</strong> {new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p> {/* Display formatted date */}
                    <p><strong>Time:</strong> {state.startTime} - {state.endTime}</p>
                     <p className="reservation-hold-info">
                        The room will be held for you from {state.startTime} to {state.endTime} on {new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                     </p>

                    <hr />

                    <h3>Enter Your Details</h3>
                    <p className="reservation-instruction">Please enter your UTRGV Student ID to complete the reservation.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="reservation-form-group">
                            <label htmlFor="studentId">Student ID:</label>
                            <input
                                type="text"
                                id="studentId"
                                value={studentIdInput}
                                onChange={(e) => setStudentIdInput(e.target.value)}
                                placeholder="e.g., 20448443"
                                required
                                disabled={loading}
                                aria-describedby="studentIdHelp" 
                            />
                            <small id="studentIdHelp" className="form-text text-muted">Enter your official UTRGV Student ID.</small>
                        </div>

                        {formError && <p className="reservation-error-message form-error">{formError}</p>}
                        {error && <p className="reservation-error-message submit-error">{error}</p>}

                        <div className="reservation-button-group">
                            <button
                                type="submit"
                                className="custom-button reserve-final-button"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Confirm Reservation'}
                            </button>
                             <Link to={`/room/${state.roomId}`} className="custom-button back-button reservation-back-button">
                                Cancel
                             </Link>
                        </div>
                    </form>
                    <p className="reservation-confirmation-note">
                       Once confirmed, you will receive an email. Please check your inbox (and spam folder) to finalize your booking within 1 hour.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReservationPage;