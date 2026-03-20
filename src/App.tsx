import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { CommandCenter } from './pages/CommandCenter';
import { Conversations } from './pages/Conversations';
import { Operations } from './pages/Operations';
import { Intelligence } from './pages/Intelligence';
import { Reservations } from './pages/Reservations';
import { Settings } from './pages/Settings';
import { CallCenter } from './pages/CallCenter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CommandCenter />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="operations" element={<Operations />} />
          <Route path="intelligence" element={<Intelligence />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="call-center" element={<CallCenter />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
