import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import CoordHome from './pages/CoordHome';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Sem Navbar) */}
        <Route path="/" element={<Login />} />
        
        {/* Rotas Protegidas (Ficam DENTRO do Layout Global) */}
        <Route element={<Layout />}>
          <Route path="/aluno" element={<StudentHome />} />
          <Route path="/professor" element={<TeacherHome />} />
          <Route path="/coordenador" element={<CoordHome />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/historico" element={<History />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;