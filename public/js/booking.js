// ======== booking.js — Bails Session ========

const API = window.location.origin;

const booking = {
    sport: null, sportName: null, price: 0,
    date: null,
    slotId: null, slotTime: null,
    name: null, phone: null, email: null,
    payment: null
};

let currentStep = 1;

// ---- DOM helpers ----
const steps = Array.from({ length: 6 }, (_, i) => document.getElementById(`step${i + 1}`));
const pSteps = document.querySelectorAll('.progress-step');
const pLines = document.querySelectorAll('.progress-line');

function goToStep(n) {
    steps.forEach((s, i) => s.classList.toggle('active', i === n - 1));
    pSteps.forEach((s, i) => {
        s.classList.toggle('active', i === n - 1);
        s.classList.toggle('done', i < n - 1);
    });
    pLines.forEach((l, i) => l.classList.toggle('done', i < n - 1));
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Step 1: Sport ----
const sportCards = document.querySelectorAll('.book-sport-card');
const s1Next = document.getElementById('s1Next');

// Pre-select via URL param
const urlParam = new URLSearchParams(window.location.search).get('sport');
if (urlParam) {
    const match = document.querySelector(`.book-sport-card[data-sport="${urlParam}"]`);
    if (match) setTimeout(() => match.click(), 50);
}

sportCards.forEach(card => {
    card.addEventListener('click', () => {
        sportCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        booking.sport = card.dataset.sport;
        booking.sportName = card.querySelector('.book-sport-name').textContent;
        booking.price = parseInt(card.dataset.price);
        s1Next.disabled = false;
    });
});
s1Next.addEventListener('click', () => goToStep(2));

// ---- Step 2: Date ----
const dateInput = document.getElementById('bookingDate');
const s2Next = document.getElementById('s2Next');
const s2Back = document.getElementById('s2Back');

const today = new Date();
const maxD = new Date(); maxD.setDate(today.getDate() + 7);

function toDateStr(d) { return d.toISOString().split('T')[0]; }
dateInput.min = toDateStr(today);
dateInput.max = toDateStr(maxD);
dateInput.value = toDateStr(today);
booking.date = dateInput.value;
s2Next.disabled = false;

dateInput.addEventListener('change', () => {
    booking.date = dateInput.value;
    s2Next.disabled = !booking.date;
});
s2Back.addEventListener('click', () => goToStep(1));
s2Next.addEventListener('click', () => { goToStep(3); fetchSlots(); });

// ---- Step 3: Slots ----
const slotsGrid = document.getElementById('slotsGrid');
const s3Next = document.getElementById('s3Next');
const s3Back = document.getElementById('s3Back');

async function fetchSlots() {
    slotsGrid.innerHTML = `
        <div class="slots-loading">
            <div class="loading-spinner"></div>
            <span>Loading available slots...</span>
        </div>`;
    try {
        const res = await fetch(`${API}/api/slots?sport=${booking.sport}&date=${booking.date}`);
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        renderSlots(data.slots);
    } catch {
        slotsGrid.innerHTML = `<div class="slots-loading">⚠️ Could not load slots. Is the server running?</div>`;
    }
}

function renderSlots(slots) {
    slotsGrid.innerHTML = slots.map(s => `
        <div class="slot-card ${s.available ? 'available' : 'booked'}"
             data-id="${s.id}" data-time="${s.time}"
             ${!s.available ? 'tabindex="-1"' : ''}>
            <span class="slot-time">${s.time}</span>
            <span class="slot-status">${s.available ? 'Available' : 'Booked'}</span>
        </div>`).join('');

    slotsGrid.querySelectorAll('.slot-card.available').forEach(card => {
        card.addEventListener('click', () => {
            slotsGrid.querySelectorAll('.slot-card').forEach(c => {
                c.classList.remove('selected');
                if (c.classList.contains('available'))
                    c.querySelector('.slot-status').textContent = 'Available';
            });
            card.classList.add('selected');
            card.querySelector('.slot-status').textContent = 'Selected';
            booking.slotId = parseInt(card.dataset.id);
            booking.slotTime = card.dataset.time;
            s3Next.disabled = false;
        });
    });
}

s3Back.addEventListener('click', () => goToStep(2));
s3Next.addEventListener('click', () => { goToStep(4); renderMiniSummary(); });

// ---- Step 4: Details ----
const inpName  = document.getElementById('bookName');
const inpPhone = document.getElementById('bookPhone');
const inpEmail = document.getElementById('bookEmail');
const s4Next   = document.getElementById('s4Next');
const s4Back   = document.getElementById('s4Back');

function renderMiniSummary() {
    const icons = { cricket: '🏏', football: '⚽', badminton: '🏸' };
    const el = document.getElementById('miniSummary');
    const d = new Date(booking.date + 'T00:00:00');
    const fmt = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    el.innerHTML = `<strong>Your Selection:</strong> &nbsp;
        ${icons[booking.sport] || '🏟️'} <strong>${booking.sportName}</strong> &nbsp;·&nbsp;
        📅 ${fmt} &nbsp;·&nbsp;
        ⏰ ${booking.slotTime} &nbsp;·&nbsp;
        💰 <strong style="color:var(--accent-green)">₹${booking.price}</strong>`;
}

s4Back.addEventListener('click', () => goToStep(3));
s4Next.addEventListener('click', () => {
    if (!inpName.value.trim() || !inpPhone.value.trim() || !inpEmail.value.trim()) {
        showToast('⚠️ Please fill in all required fields.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inpEmail.value)) {
        showToast('⚠️ Please enter a valid email address.'); return;
    }
    booking.name  = inpName.value.trim();
    booking.phone = inpPhone.value.trim();
    booking.email = inpEmail.value.trim();
    goToStep(5);
});

// ---- Step 5: Payment ----
const payNowCard   = document.getElementById('payNow');
const payLaterCard = document.getElementById('payLater');
const payNowForm   = document.getElementById('payNowForm');
const payLaterInfo = document.getElementById('payLaterInfo');
const s5Next = document.getElementById('s5Next');
const s5Back = document.getElementById('s5Back');

payNowCard.addEventListener('click', () => {
    payNowCard.classList.add('selected'); payLaterCard.classList.remove('selected');
    payNowForm.classList.add('visible'); payLaterInfo.classList.remove('visible');
    booking.payment = 'pay_now'; s5Next.disabled = false;
});
payLaterCard.addEventListener('click', () => {
    payLaterCard.classList.add('selected'); payNowCard.classList.remove('selected');
    payLaterInfo.classList.add('visible'); payNowForm.classList.remove('visible');
    booking.payment = 'pay_later'; s5Next.disabled = false;
});

// Payment tabs
document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.pay-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');
    });
});

// Card input formatting
const cardNum = document.getElementById('cardNumber');
if (cardNum) cardNum.addEventListener('input', e => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v.match(/.{1,4}/g)?.join(' ') || v;
});
const cardExp = document.getElementById('cardExpiry');
if (cardExp) cardExp.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v;
});

s5Back.addEventListener('click', () => goToStep(4));
s5Next.addEventListener('click', submitBooking);

// ---- Submit ----
async function submitBooking() {
    s5Next.disabled = true;
    s5Next.textContent = 'Processing...';
    try {
        const res = await fetch(`${API}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sport: booking.sport, date: booking.date,
                slotId: booking.slotId, slotTime: booking.slotTime,
                name: booking.name, phone: booking.phone, email: booking.email,
                payment: booking.payment
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Booking failed');
        showConfirmation(data.booking);
        goToStep(6);
    } catch (err) {
        showToast(`❌ ${err.message}`);
        s5Next.disabled = false;
        s5Next.textContent = 'Confirm Booking →';
    }
}

// ---- Confirmation ----
function showConfirmation(b) {
    const icons = { cricket: '🏏', football: '⚽', badminton: '🏸' };
    const d = new Date(b.date + 'T00:00:00');
    const fmt = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const payLabel = b.payment === 'pay_now' ? '💳 Online Payment' : '🏟️ Pay at Venue';
    const statusColor = b.payment === 'pay_now' ? 'var(--accent-green)' : '#ffd700';

    document.getElementById('confirmationWrap').innerHTML = `
        <div class="confirm-icon">🎉</div>
        <h2 class="confirm-title">Booking Confirmed!</h2>
        <p class="confirm-subtitle">Your slot is locked in. See you on the turf!</p>
        <div class="confirm-id">
            <span class="confirm-id-label">Booking ID</span>
            <span class="confirm-id-value">${b.id}</span>
        </div>
        <div class="confirm-details">
            <div class="confirm-detail-row"><span>Sport</span><strong>${icons[b.sport] || ''} ${cap(b.sport)}</strong></div>
            <div class="confirm-detail-row"><span>Date</span><strong>${fmt}</strong></div>
            <div class="confirm-detail-row"><span>Time Slot</span><strong>${b.slotTime}</strong></div>
            <div class="confirm-detail-row"><span>Name</span><strong>${b.name}</strong></div>
            <div class="confirm-detail-row"><span>Phone</span><strong>${b.phone}</strong></div>
            <div class="confirm-detail-row"><span>Amount</span><strong>₹${b.price}</strong></div>
            <div class="confirm-detail-row"><span>Payment</span><strong>${payLabel}</strong></div>
            <div class="confirm-detail-row"><span>Status</span><strong style="color:${statusColor}">✅ ${b.payment === 'pay_now' ? 'Confirmed' : 'Reserved – Pay at Venue'}</strong></div>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:24px;">
            Save your Booking ID <strong style="color:var(--accent-green)">${b.id}</strong> for reference.
        </p>
        <div class="confirm-actions">
            <a href="booking.html" class="btn btn-primary">Book Another Slot</a>
            <a href="index.html" class="btn btn-ghost">← Back to Home</a>
        </div>`;
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function showToast(msg, duration = 4000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 350); }, duration);
}

// Init
goToStep(1);
