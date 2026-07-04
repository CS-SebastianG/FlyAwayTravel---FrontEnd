import { Fragment, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractErrorMessage } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Flight, FlightSearchResponse, NewId } from '../types';

const BOOKED_IDS_KEY = 'bookedFlightIds';

function saveBookingId(id: number) {
  const raw = localStorage.getItem(BOOKED_IDS_KEY);
  const ids: number[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(BOOKED_IDS_KEY, JSON.stringify(ids));
  }
}

function formatDateTime(iso: string) {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString();
}

function toIsoOrUndefined(localDateTime: string): string | undefined {
  if (!localDateTime) return undefined;
  const date = new Date(localDateTime);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

interface BookingFeedback {
  flightId: number;
  type: 'success' | 'error';
  message: string;
}

export default function SearchPage() {
  const { isAuthenticated } = useAuth();

  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [departureFrom, setDepartureFrom] = useState('');
  const [departureTo, setDepartureTo] = useState('');

  const [results, setResults] = useState<Flight[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [bookingLoadingId, setBookingLoadingId] = useState<number | null>(null);
  const [bookingFeedback, setBookingFeedback] = useState<BookingFeedback | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setBookingFeedback(null);
    setLoading(true);
    try {
      const res = await api.get<FlightSearchResponse>('/flights/search', {
        params: {
          flightNumber: flightNumber.trim() || undefined,
          airlineName: airlineName.trim() || undefined,
          estDepartureTimeFrom: toIsoOrUndefined(departureFrom),
          estDepartureTimeTo: toIsoOrUndefined(departureTo),
        },
      });
      setResults(res.data.items);
      setHasSearched(true);
    } catch (error) {
      setSearchError(extractErrorMessage(error, 'No se pudo realizar la búsqueda.'));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(flightId: number) {
    setBookingFeedback(null);
    setBookingLoadingId(flightId);
    try {
      const res = await api.post<NewId>('/flights/book', { flightId });
      saveBookingId(res.data.id);
      setBookingFeedback({
        flightId,
        type: 'success',
        message: `¡Reserva creada con éxito! ID de reserva: ${res.data.id}`,
      });
    } catch (error) {
      setBookingFeedback({
        flightId,
        type: 'error',
        message: extractErrorMessage(error, 'No se pudo reservar el vuelo.'),
      });
    } finally {
      setBookingLoadingId(null);
    }
  }

  return (
    <div className="page">
      <h1>Buscar vuelos</h1>
      <p className="page-subtitle">Busca por número de vuelo, aerolínea o rango de fechas de salida.</p>

      <form className="card form form-row" onSubmit={handleSearch}>
        <label className="field">
          <span>Número de vuelo</span>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="LA123"
          />
        </label>

        <label className="field">
          <span>Aerolínea</span>
          <input
            type="text"
            value={airlineName}
            onChange={(e) => setAirlineName(e.target.value)}
            placeholder="LATAM"
          />
        </label>

        <label className="field">
          <span>Salida desde</span>
          <input
            type="datetime-local"
            value={departureFrom}
            onChange={(e) => setDepartureFrom(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Salida hasta</span>
          <input
            type="datetime-local"
            value={departureTo}
            onChange={(e) => setDepartureTo(e.target.value)}
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {searchError && <div className="alert alert-error">{searchError}</div>}

      {!isAuthenticated && (
        <div className="alert alert-info">
          Inicia sesión para poder reservar un vuelo. <Link to="/login">Iniciar sesión</Link>
        </div>
      )}

      {hasSearched && results && results.length === 0 && !searchError && (
        <div className="alert alert-info">No se encontraron vuelos con esos criterios.</div>
      )}

      {results && results.length > 0 && (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Asientos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((flight) => (
                <Fragment key={flight.id}>
                  <tr>
                    <td>{flight.flightNumber}</td>
                    <td>{flight.airlineName}</td>
                    <td>{formatDateTime(flight.estDepartureTime)}</td>
                    <td>{formatDateTime(flight.estArrivalTime)}</td>
                    <td>{flight.availableSeats}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-small"
                        disabled={!isAuthenticated || bookingLoadingId === flight.id}
                        onClick={() => handleBook(flight.id)}
                      >
                        {bookingLoadingId === flight.id ? 'Reservando...' : 'Reservar'}
                      </button>
                    </td>
                  </tr>
                  {bookingFeedback && bookingFeedback.flightId === flight.id && (
                    <tr>
                      <td colSpan={6}>
                        <div
                          className={`alert ${
                            bookingFeedback.type === 'success' ? 'alert-success' : 'alert-error'
                          }`}
                        >
                          {bookingFeedback.message}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
