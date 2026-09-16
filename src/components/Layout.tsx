import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/context/AuthContext';

export function Layout() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const isEditor = /^\/apontamentos\/[^/]+\/[^/]+$/.test(pathname);

  return (
    <>
      <Outlet context={{ logout }} />
      {!isEditor && <BottomNav />}
    </>
  );
}
