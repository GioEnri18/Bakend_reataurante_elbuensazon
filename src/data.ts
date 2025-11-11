import { v4 as uuid } from 'uuid';

export interface Table {
    id: string;
    number: number;
    capacity: number;
    isActive: boolean;
    location?: string;
    createdAt: string;
}

export interface Client {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    createdAt: string;
}

export type ReservationStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export interface Reservation {
    id: string;
    tableId: string;
    clientId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    people: number;
    notes?: string;
    status: ReservationStatus;
    createdAt: string;
}

export const tables: Table[] = Array.from({ length: 10 }, (_, i) => ({
    id: uuid(),
    number: i + 1,
    capacity: (i % 4) * 2 + 2,
    isActive: i % 5 !== 0,
    location: ['Patio', 'Interior', 'Ventana'][i % 3],
    createdAt: new Date().toISOString(),
}));

export const clients: Client[] = [
    { id: uuid(), fullName: 'John Doe', phone: '555000111', email: 'john@example.com', createdAt: new Date().toISOString() },
    { id: uuid(), fullName: 'Jane Smith', phone: '555222333', email: 'jane@example.com', createdAt: new Date().toISOString() },
    { id: uuid(), fullName: 'Peter Jones', phone: '555444555', email: 'peter@example.com', createdAt: new Date().toISOString() },
];

export const reservations: Reservation[] = [
    {
        id: uuid(),
        tableId: tables[0].id,
        clientId: clients[0].id,
        date: new Date().toISOString().slice(0, 10),
        startTime: '19:00',
        endTime: '21:00',
        people: 2,
        notes: '',
        status: 'BOOKED',
        createdAt: new Date().toISOString(),
    },
];
