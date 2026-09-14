import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', icon: '🏠', label: 'Início' },
  { to: '/projects', icon: '📁', label: 'Projetos' },
  { to: '/tasks', icon: '📋', label: 'Tarefas' },
  { to: '/notes', icon: '📝', label: 'Notas' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {links.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
