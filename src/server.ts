import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { v4 as uuid, validate as validateUuid, version as uuidVersion } from 'uuid';
import { tables, clients, reservations, Reservation } from './data';

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function isUuidV4(id: string) {
    return validateUuid(id) && uuidVersion(id) === 4;
}

function timeOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
    // HH:mm strings
    return aStart < bEnd && bStart < aEnd;
}

// Tables
app.get('/api/v1/tables', (_req: Request, res: Response) => {
    res.json({ data: tables, meta: { total: tables.length, page: 1, limit: tables.length, totalPages: 1 } });
});

// Clients
app.get('/api/v1/clients', (req: Request, res: Response) => {
    const { search } = req.query as { search?: string };
    let result = clients;
    if (search) {
        result = clients.filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()));
    }
    res.json(result);
});

app.post('/api/v1/clients', (req: Request, res: Response) => {
    const { fullName, phone, email } = req.body || {};
    const errors: string[] = [];
    if (!fullName) errors.push('fullName is required');
    if (!phone) errors.push('phone is required');
    if (errors.length) return res.status(400).json({ message: errors });
    const newClient = { id: uuid(), fullName, phone, email, createdAt: new Date().toISOString() };
    clients.push(newClient);
    res.status(201).json(newClient);
});

// Reservations list
app.get('/api/v1/reservations', (req: Request, res: Response) => {
    const { date } = req.query as { date?: string };
    let result = reservations;
    if (date) {
        result = result.filter(r => r.date === date);
    }
    res.json(result);
});

// Create reservation
app.post('/api/v1/reservations', (req: Request, res: Response) => {
    const { tableId, clientId, date, startTime, endTime, people, notes } = req.body || {};
    const errors: string[] = [];

    if (!tableId || !clientId) {
        errors.push('tableId must be a UUID, clientId must be a UUID');
    } else {
        if (!isUuidV4(tableId)) errors.push('tableId must be a UUID');
        if (!isUuidV4(clientId)) errors.push('clientId must be a UUID');
    }
    if (!date) errors.push('date is required');
    if (!startTime) errors.push('startTime is required');
    if (!endTime) errors.push('endTime is required');
    if (startTime && endTime && startTime >= endTime) errors.push('endTime must be after startTime');
    if (!people || people < 1) errors.push('people must be >=1');

    const table = tables.find(t => t.id === tableId);
    if (table && people && people > table.capacity) errors.push('people exceeds table capacity');
    if (!table) errors.push('Table not found');
    if (table && !table.isActive) errors.push('Table is inactive');
    const client = clients.find(c => c.id === clientId);
    if (!client) errors.push('Client not found');

    if (errors.length) return res.status(400).json({ message: errors });

    // Collision check
    const collision = reservations.some(r => r.tableId === tableId && r.date === date && r.status === 'BOOKED' && timeOverlap(startTime, endTime, r.startTime, r.endTime));
    if (collision) return res.status(409).json({ message: 'Time slot not available for this table.' });

    const newReservation: Reservation = {
        id: uuid(),
        tableId,
        clientId,
        date,
        startTime,
        endTime,
        people,
        notes,
        status: 'BOOKED',
        createdAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    res.status(201).json(newReservation);
});

// Cancel & complete
app.post('/api/v1/reservations/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const r = reservations.find(r => r.id === id);
    if (!r) return res.status(404).json({ message: 'Reservation not found' });
    r.status = 'CANCELLED';
    res.json({ success: true });
});

app.post('/api/v1/reservations/:id/complete', (req: Request, res: Response) => {
    const { id } = req.params;
    const r = reservations.find(r => r.id === id);
    if (!r) return res.status(404).json({ message: 'Reservation not found' });
    r.status = 'COMPLETED';
    res.json({ success: true });
});

// Occupancy report
app.get('/api/v1/reports/occupancy/day', (req: Request, res: Response) => {
    const { date } = req.query as { date?: string };
    const dayReservations = reservations.filter(r => !date || r.date === date);
    const booked = dayReservations.filter(r => r.status === 'BOOKED').length;
    const occupancyPercent = tables.length ? Math.round((booked / tables.length) * 100) : 0;
    res.json({
        occupancyPercent,
        totalReservations: dayReservations.length,
        availableTables: tables.filter(t => t.isActive).length - booked,
        cancelledToday: dayReservations.filter(r => r.status === 'CANCELLED').length,
    });
});

// Availability by slot (simple variant)
app.get('/api/v1/availability/by-slot', (req: Request, res: Response) => {
    const { date, startTime, endTime } = req.query as Record<string, string>;
    const bookedTables = reservations
        .filter(r => r.date === date && r.status === 'BOOKED' && timeOverlap(startTime, endTime, r.startTime, r.endTime))
        .map(r => r.tableId);
    const available = tables.filter(t => t.isActive && !bookedTables.includes(t.id)).map(t => t.number);
    const occupied = tables.filter(t => bookedTables.includes(t.id)).map(t => t.number);
    res.json({ available, occupied });
});

// Calendar events
app.get('/api/v1/availability/calendar', (_req: Request, res: Response) => {
    const events = reservations.map(r => ({
        id: r.id,
        title: `Mesa ${r.tableId.substring(0, 4)} - ${clients.find(c => c.id === r.clientId)?.fullName || 'Cliente'}`,
        start: `${r.date}T${r.startTime}:00`,
        end: `${r.date}T${r.endTime}:00`,
        status: r.status,
        tableNumber: tables.find(t => t.id === r.tableId)?.number || '?'
    }));
    res.json(events);
});

app.get('/api/v1/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Root route friendly message
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Restaurant API running', version: '0.1.0', endpoints: ['/api/v1/tables', '/api/v1/clients', '/api/v1/reservations'] });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Backend API listening on http://localhost:${PORT}`);
});
