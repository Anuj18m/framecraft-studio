import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Galleries from './pages/Galleries';
import GalleryDetails from './pages/GalleryDetails';
import GalleryShare from './pages/GalleryShare';
import Analytics from './pages/Analytics';
import PublicGallery from './pages/PublicGallery';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/galleries"
            element={
              <ProtectedRoute>
                <Galleries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/galleries/:galleryId"
            element={
              <ProtectedRoute>
                <GalleryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/galleries/:galleryId/share"
            element={
              <ProtectedRoute>
                <GalleryShare />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route path="/view/:token" element={<PublicGallery />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;