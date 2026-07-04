export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  role: string;
}

export interface Flight {
  id: number;
  airlineName: string;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

export interface FlightSearchResponse {
  items: Flight[];
}

export interface NewBookingPayload {
  flightId: number;
}

export interface NewId {
  id: number;
}

export interface BookingDetail {
  id: number;
  bookingDate: string;
  flightId: number;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
}
