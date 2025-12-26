import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import CoordHome from './pages/CoordHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<StudentHome />} />
        <Route path="/professor" element={<TeacherHome />} />
        <Route path="/coordenador" element={<CoordHome />} />
        
        {/* Qualquer rota desconhecida volta para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;