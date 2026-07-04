import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-brand"> Fly Away Travel</div>
      <nav className="navbar-links">
        <Link to="/search">Buscar vuelos</Link>
        {isAuthenticated && <Link to="/my-bookings">Mis reservas</Link>}
        {!isAuthenticated && <Link to="/register">Registro</Link>}
        {!isAuthenticated && <Link to="/login">Iniciar sesión</Link>}
      </nav>
      <div className="navbar-user">
        {isAuthenticated ? (
          <>
            <span className="navbar-username">
              {currentUser ? currentUser.username : 'Cargando...'}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <span className="navbar-username navbar-username-guest">Invitado</span>
        )}
      </div>
    </header>
  );
}
