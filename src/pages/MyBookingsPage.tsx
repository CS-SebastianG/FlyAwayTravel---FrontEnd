import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractErrorMessage } from '../api';
import { BookingDetail } from '../types';

const BOOKED_IDS_KEY = 'bookedFlightIds';

function getSavedBookingIds(): number[] {
  const raw = localStorage.getItem(BOOKED_IDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDateTime(iso: string) {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString();
}

interface BookingRow {
  id: number;
  detail?: BookingDetail;
  error?: string;
}

export default function MyBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getSavedBookingIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await api.get<BookingDetail>(`/flights/book/${id}`);
          return { id, detail: res.data } as BookingRow;
        } catch (error) {
          return { id, error: extractErrorMessage(error, 'No se pudo cargar la reserva.') } as BookingRow;
        }
      })
    ).then((loaded) => {
      if (!cancelled) {
        setRows(loaded);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <h1>Mis reservas</h1>
      <p className="page-subtitle">
        Reservas hechas desde este navegador (se guardan localmente en tu dispositivo).
      </p>

      {loading && <div className="alert alert-info">Cargando reservas...</div>}

      {!loading && rows.length === 0 && (
        <div className="alert alert-info">
          Todavía no tienes reservas. <Link to="/search">Busca un vuelo</Link> para reservar.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID reserva</th>
                <th>Número de vuelo</th>
                <th>Fecha de salida</th>
                <th>Fecha de reserva</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  {row.detail ? (
                    <>
                      <td>{row.detail.flightNumber}</td>
                      <td>{formatDateTime(row.detail.estDepartureTime)}</td>
                      <td>{formatDateTime(row.detail.bookingDate)}</td>
                    </>
                  ) : (
                    <td colSpan={3} className="text-error">
                      {row.error}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
