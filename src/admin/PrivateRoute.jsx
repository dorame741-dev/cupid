export default function PrivateRoute({ children }) {
  if (!localStorage.getItem('adminAuth')) {
    window.location.replace('/login')
    return null
  }
  return children
}
