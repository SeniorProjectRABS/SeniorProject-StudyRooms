import LandingPage from './pages/LandingPage';
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ReservationPage from "./pages/ReservationPage.tsx";

function App() {
  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          {/*<Route path="floors" element={<FloorPage />} />*/}
          <Route path="contact" element={<ReservationPage />} />
          {/*<Route path="*" element={<NoPage />} />*/}
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;