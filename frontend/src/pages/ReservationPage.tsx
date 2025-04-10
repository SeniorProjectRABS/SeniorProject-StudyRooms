import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRepository } from '../utils/apiRepository';
import { Student } from '../utils/schema'; 

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
    const [emailInput, setEmailInput] = useState('');
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

        if (!studentIdInput.trim() || !emailInput.trim()) {
            setFormError("Please enter both Student ID and Email.");
            return;
        }

        let studentPk: number | null = null;
        const lowerCaseEmail = emailInput.trim().toLowerCase();
        const trimmedStudentId = studentIdInput.trim();

        const studentMap: { [key: string]: number } = {
            '20448443': 1,
            'bradley.puga02@utrgv.edu': 1,
            '20312345': 2,
            'ruben.gonzalez02@utrgv.edu': 2,
            '12345678': 3,
            'samantha.cadena01@utrgv.edu': 3,
            '23112402': 4,
            'armamdo.vazquez01@utrgv.edu': 4, 
        };

        studentPk = studentMap[trimmedStudentId] ?? studentMap[lowerCaseEmail];

        if (studentPk === null) {
             setFormError("Student ID or Email not found in demo data. Use a seeded ID/Email.");
             return;
         }
         // --- End Temporary Mapping ---

        if (!state) {
            setError("Reservation details are missing."); // Should be caught by useEffect, but safety check
            return;
        }

        const reservationData = {
            student: studentPk,
            study_room: state.roomId,
            timeslots: state.selectedSlots,
            date: state.date,
        };

        console.log("Submitting reservation with data:", reservationData);
        setLoading(true);

        try {
            const createdReservation = await apiRepository.createReservation(reservationData);
            console.log("Reservation successful:", createdReservation);

            const studentEmail = (createdReservation.student as Student)?.email || emailInput; 

            alert(`Reservation submitted! Please check your email (${studentEmail}) to confirm within 1 hour.`);
            navigate('/'); 
        } catch (err: any) {
            console.error("Reservation failed:", err.response?.data || err.message || err);
             const errorDetail = err.response?.data?.detail || err.response?.data?.non_field_errors?.join(', ') || err.response?.data?.timeslots?.join(', ') || err.response?.data?.student?.join(', ') || err.response?.data?.study_room?.join(', ');
            setError(`Reservation failed: ${errorDetail || 'Please check details and try again.'}`);

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
                    <p><strong>Date:</strong> {state.date}</p>
                    <p><strong>Time:</strong> {state.startTime} - {state.endTime}</p>
                     <p className="reservation-hold-info">
                        The room will be held for you from {state.startTime} to {state.endTime} on {new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                     </p>


                    <hr />

                    <h3>Enter Your Details</h3>
                    <p className="reservation-instruction">Please enter your UTRGV Student ID and Email to complete the reservation.</p>

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
                            />
                        </div>
                        <div className="reservation-form-group">
                            <label htmlFor="email">UTRGV Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="e.g., bradley.puga02@utrgv.edu"
                                required
                                disabled={loading}
                            />
                             <small>Enter @utrgv.edu addresses only</small>
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