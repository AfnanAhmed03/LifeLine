const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
// PASTE YOUR SUPABASE URL HERE INSIDE THE QUOTES
const connectionString = "postgresql://postgres:[Hospitalproject20251]@db.gpbzszbxyblmhgzaddzj.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // FIXES THE SSL ERROR
});

// --- API ROUTES ---

// 1. GET UNITS (With Auto-Fix for Empty DB)
// REPLACE THE 'app.get' BLOCK WITH THIS:

app.get('/api/units', async (req, res) => {
    console.log("Frontend connected! Sending TEST data...");
    
    // We are NOT connecting to the database. We are sending fake data directly.
    const fakeData = [
        { 
            id: 1, 
            hospital_name: "TEST HOSPITAL", 
            ward_name: "Trauma Ward", 
            total_beds: 5, 
            occupied_beds: 2 
        },
        { 
            id: 2, 
            hospital_name: "DEMO MEDICAL", 
            ward_name: "General ICU", 
            total_beds: 10, 
            occupied_beds: 8 
        }
    ];

    res.json(fakeData);
});

// 2. BOOKING ROUTE
app.post('/api/book', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { unitId } = req.body;
        
        // Lock row
        const unitRes = await client.query('SELECT * FROM icu_units WHERE id = $1 FOR UPDATE', [unitId]);
        const unit = unitRes.rows[0];

        if (unit.occupied_beds >= unit.total_beds) {
            throw new Error('WARD FULL');
        }

        await client.query('UPDATE icu_units SET occupied_beds = occupied_beds + 1 WHERE id = $1', [unitId]);
        await client.query('COMMIT');
        res.json({ message: 'Success' });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.listen(5000, () => console.log("LifeLine Server running on port 5000"));