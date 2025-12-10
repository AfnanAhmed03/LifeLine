import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. TypeScript Interfaces (Required for the assessment)
interface IcuUnit {
  id: number;
  hospital_name: string;
  ward_name: string;
  total_beds: number;
  occupied_beds: number;
}

function App() {
  const [units, setUnits] = useState<IcuUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // 2. Fetch Data from your Backend
  const fetchUnits = async () => {
    try {
      const res = await axios.get('https://lifeline-backend-q03a.onrender.com');
      setUnits(res.data);
    } catch (err) {
      console.error("Error connecting to backend", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnits();
    // Optional: Poll every 2 seconds to see live updates from other users
    const interval = setInterval(fetchUnits, 2000);
    return () => clearInterval(interval);
  }, []);

  // 3. The "Life Saving" Action
  const handleAllocate = async (unitId: number) => {
    setLoading(true);
    setStatusMsg('Attempting allocation...');

    try {
      // Simulate a random patient name for the demo
      const randomPatient = `Patient-${Math.floor(Math.random() * 1000)}`;
      
      await axios.post('http://localhost:5000/api/book', {
        unitId,
        patientName: randomPatient,
        severity: 'CRITICAL'
      });

      setStatusMsg('✅ Bed Allocated Successfully!');
      fetchUnits(); // Refresh data immediately
    } catch (error: any) {
      // This handles the Concurrency Error from the backend
      setStatusMsg(`❌ ALLOCATION FAILED: ${error.response?.data?.message || 'Error'}`);
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>🚑 LifeLine ICU Dashboard</h1>
          <p>Emergency Bed Allocation System</p>
        </div>
        <div style={{ fontWeight: 'bold', color: statusMsg.includes('FAILED') ? 'red' : 'green' }}>
          {statusMsg}
        </div>
      </div>

      <div className="stats-container">
        {units.map((unit) => {
          const percentage = (unit.occupied_beds / unit.total_beds) * 100;
          const isFull = unit.occupied_beds >= unit.total_beds;

          return (
            <div key={unit.id} className={`unit-card ${isFull ? 'critical' : ''}`}>
              <h3>{unit.hospital_name}</h3>
              <p style={{ color: '#64748b' }}>{unit.ward_name}</p>
              
              <div className="progress-bar">
                <div 
                  className="fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: isFull ? '#ef4444' : '#0ea5e9'
                  }}
                ></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span>Occupancy:</span>
                <strong>{unit.occupied_beds} / {unit.total_beds} Beds</strong>
              </div>

              <button 
                className={`btn ${isFull ? 'danger' : ''}`}
                onClick={() => handleAllocate(unit.id)}
                disabled={isFull || loading}
              >
                {isFull ? '⛔ WARD FULL' : '⚡ ALLOCATE BED'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;