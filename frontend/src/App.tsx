import LandingPage from './pages/LandingPage';
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ReservationPage from "./pages/ReservationPage.tsx"; 
import RoomPage from './pages/RoomPage.tsx';

function App() {
  return (
    <>
     <BrowserRouter>
     <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/room/:roomId" element={<RoomPage />} />

          <Route path="/reserve" element={<ReservationPage />} />

        </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;