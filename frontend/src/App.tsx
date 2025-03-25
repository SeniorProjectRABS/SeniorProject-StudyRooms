import Landing from './pages/LandingPage.tsx';
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ReservationPage from "./pages/ReservationPage.tsx";

function App() {
  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}>
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