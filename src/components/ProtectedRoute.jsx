import { Outlet } from 'react-router-dom';
// Simplified: all routes are accessible, admin auth is handled per-page via sessionStorage
export default function ProtectedRoute() {
  return <Outlet />;
}
