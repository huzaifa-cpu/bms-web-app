import { ToastContainer } from 'react-toastify'
import { AppRouter } from './core/navigation/app_router'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </>
  )
}
