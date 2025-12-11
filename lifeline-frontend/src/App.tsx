import { useEffect, useState } from 'react';
import axios from 'axios';

interface Drone {
  id: number;
  hospital_name: string; // This is actually "Base Name"
  ward_name: string;     // This is actually "Drone Name"
  total_beds: number;    // Capacity
  occupied_beds: number; // Used Load
}

function App() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // USE YOUR RENDER URL HERE
  const API_URL = 'https://lifeline-backend.onrender.com'; 
  // OR use 'http://localhost:5000' if running locally

  const fetchDrones = async () => {
    try {
      // CORRECT
      const res = await axios.get(`${API_URL}/api/units`);
      setDrones(res.data);
    } catch (err) {
      console.error("Connection Error", err);
    }
  };

  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 2000); // Live radar updates
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = async (droneId: number) => {
    setLoading(true);
    setStatusMsg('INITIATING LAUNCH SEQUENCE...');

    try {
      await axios.post(`${API_URL}/api/book`, {
        unitId: droneId,
        patientName: `Mission-${Math.floor(Math.random() * 9999)}`, // Mission ID
        severity: 'URGENT'
      });

      setStatusMsg('🚀 LAUNCH CONFIRMED');
      fetchDrones();
    } catch (error: any) {
      setStatusMsg(`⚠️ LAUNCH ABORTED: ${error.response?.data?.message || 'Error'}`);
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