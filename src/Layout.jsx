import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function initials(name = '') {
    return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Phòng<em>Khám</em></div>
        <div className="sidebar-user">
          <div className="name">{user?.fullName}</div>
          <div className="role">{user?.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}</div>
        </div>
        <nav className="nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}