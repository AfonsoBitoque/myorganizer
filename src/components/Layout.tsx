import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/context/AuthContext';

export function Layout() {
  const { logout } = useAuth();

  return (
    <>
      <Outlet context={{ logout }} />
      <BottomNav />
    </>
  );
}
