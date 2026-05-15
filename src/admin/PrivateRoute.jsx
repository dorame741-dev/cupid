import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  if (!localStorage.getItem('adminAuth')) {
    return <Navigate to="/login" replace />
  }
  return children
}
