import { useEffect, useState } from 'react';
import axios from 'axios';

interface Drone {
  id: number;
  hospital_name: string;
  ward_name: string;
  total_beds: number;
  occupied_beds: number;
}

function App() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // --- HARDCODED URL FIX ---
  // We use the full link directly. No variables.
  const FULL_API_URL = "https://lifeline-backend-q03a.onrender.com/api/units";
  const BOOK_API_URL = "https://lifeline-backend-q03a.onrender.com/api/book";

  const fetchDrones = async () => {
    try {
      console.log("Fetching from:", FULL_API_URL); // Debug log
      const res = await axios.get(FULL_API_URL);
      console.log("Data received:", res.data); // Debug log
      setDrones(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
    }
  };

  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 2000);
    return () => clearInterval(interval);
  }, []);

const handleLaunch = async (droneId: number) => {
    setLoading(true);
    setStatusMsg('INITIATING LAUNCH SEQUENCE...');

    try {
      // DEBUG: Log exactly where we are sending data
      console.log(`Attempting POST to: ${BOOK_API_URL}`);

      // "Universal Payload" - sends both old and new field names
      const payload = {
        unitId: droneId,       // For new "SkyLift" backend
        slotId: droneId,       // For old "Ticket Booking" backend
        patientName: `Mission-${Math.floor(Math.random() * 9999)}`, // For Hospital backend
        userName: `Mission-${Math.floor(Math.random() * 9999)}`,    // For Ticket backend
        severity: 'URGENT'
      };

      await axios.post(BOOK_API_URL, payload);

      setStatusMsg('🚀 LAUNCH CONFIRMED');
      fetchDrones(); // Refresh the list
    } catch (error: any) {
      console.error("Launch Error Details:", error); // Check Console if this fails
      // Show the exact error message from the server
      const serverMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown Error';
      setStatusMsg(`⚠️ LAUNCH ABORTED: ${serverMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>SKYLIFT // COMMAND</h1>
          <p style={{color: '#0f0', opacity: 0.7}}>{'>'} AUTONOMOUS MEDICAL DRONE NETWORK</p>
        </div>
        <div className="status-msg" style={{ color: statusMsg.includes('ABORTED') ? '#ff003c' : '#0f0' }}>
          {statusMsg}
        </div>
      </div>

      {drones.length === 0 && (
        <div style={{color: 'white', marginTop: '50px', border: '1px solid red', padding: '20px'}}>
           ⚠️ RADAR OFFLINE (No Data Found). <br/>
           Check Network Tab in Console.
        </div>
      )}

      <div className="stats-container">
        {drones.map((drone) => {
          const percentage = (drone.occupied_beds / drone.total_beds) * 100;
          const isFull = drone.occupied_beds >= drone.total_beds;

          return (
            <div key={drone.id} className={`unit-card ${isFull ? 'critical' : ''}`}>
              <h3>{drone.ward_name}</h3>
              <p style={{letterSpacing: '2px'}}>{drone.hospital_name.toUpperCase()}</p>
              
              <div className="progress-bar">
                <div className="fill" style={{ width: `${percentage}%` }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontFamily: 'monospace' }}>
                <span>PAYLOAD:</span>
                <strong>{drone.occupied_beds} / {drone.total_beds} KG</strong>
              </div>

              <button 
                className={`btn ${isFull ? 'danger' : ''}`}
                onClick={() => handleLaunch(drone.id)}
                disabled={isFull || loading}
              >
                {isFull ? '❌ MAX PAYLOAD' : '⚡ DISPATCH DRONE'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;