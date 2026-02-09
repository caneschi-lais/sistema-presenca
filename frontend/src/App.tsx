import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import CoordHome from './pages/CoordHome';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';
import AllClasses from './pages/AllClasses';
import TeamList from './pages/TeamList';
import StudentList from './pages/StudentList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<StudentHome />} />
        <Route path="/professor" element={<TeacherHome />} />
        <Route path="/coordenador" element={<CoordHome />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/historico" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/todas-turmas" element={<AllClasses />} />
        <Route path="/equipe" element={<TeamList />} />
        <Route path="/alunos" element={<StudentList />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;