const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Time Slots ----
const TIME_SLOTS = [
    { id: 1, time: '06:00 AM – 09:00 AM' },
    { id: 2, time: '09:00 AM – 12:00 PM' },
    { id: 3, time: '12:00 PM – 03:00 PM' },
    { id: 4, time: '03:00 PM – 06:00 PM' },
    { id: 5, time: '06:00 PM – 09:00 PM' },
    { id: 6, time: '09:00 PM – 12:00 AM' },
    { id: 7, time: '12:00 AM – 03:00 AM' }
];

const PRICING = {
    cricket: 600,
    football: 800,
    badminton: 300
};

// ---- Helpers ----
function readBookings() {
    try {
        if (!fs.existsSync(BOOKINGS_FILE)) return [];
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data) || [];
    } catch { return []; }
}

function writeBookings(bookings) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
}

// ---- Routes ----

// GET /api/pricing
app.get('/api/pricing', (req, res) => {
    res.json(PRICING);
});

// GET /api/slots?sport=cricket&date=2026-04-10
app.get('/api/slots', (req, res) => {
    const { sport, date } = req.query;
    if (!sport || !date) return res.status(400).json({ error: 'sport and date are required' });

    const bookings = readBookings();
    const bookedSlotIds = bookings
        .filter(b => b.sport.toLowerCase() === sport.toLowerCase() && b.date === date)
        .map(b => b.slotId);

    const slots = TIME_SLOTS.map(s => ({
        ...s,
        available: !bookedSlotIds.includes(s.id),
        price: PRICING[sport.toLowerCase()] || 0
    }));

    res.json({ sport, date, slots });
});

// POST /api/bookings
app.post('/api/bookings', (req, res) => {
    const { sport, date, slotId, slotTime, name, phone, email, payment } = req.body;

    if (!sport || !date || !slotId || !slotTime || !name || !phone || !email || !payment) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const bookings = readBookings();
    const taken = bookings.find(b =>
        b.sport.toLowerCase() === sport.toLowerCase() &&
        b.date === date &&
        b.slotId === slotId
    );
    if (taken) return res.status(409).json({ error: 'This slot is already booked. Please choose another.' });

    const bookingId = 'TZ' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const price = PRICING[sport.toLowerCase()] || 0;

    const booking = {
        id: bookingId,
        sport, date, slotId, slotTime,
        name, phone, email,
        payment, price,
        status: payment === 'pay_later' ? 'pending_payment' : 'confirmed',
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    writeBookings(bookings);

    res.status(201).json({ success: true, booking });
});

// GET /api/bookings?secret=admin123
app.get('/api/bookings', (req, res) => {
    if (req.query.secret !== 'admin123') return res.status(403).json({ error: 'Forbidden' });
    res.json(readBookings());
});

app.listen(PORT, () => {
    console.log(`\n🏏  Bails Session server running at http://localhost:${PORT}\n`);
});
