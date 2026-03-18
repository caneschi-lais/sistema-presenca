interface Presenca {
  logId: string;
  horario: string | Date;
  ra: string;
  aluno: string;
}

interface AttendanceTableProps {
  presencas: Presenca[];
  loading?: boolean;
}

export default function AttendanceTable({ presencas, loading = false }: AttendanceTableProps) {
  
  // Se estiver a carregar, mostra apenas o spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 border border-base-200 rounded-lg bg-base-50">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto h-80 border border-base-200 rounded-lg">
      <table className="table table-zebra w-full header-fixed">
        <thead className="bg-base-200 text-gray-600 sticky top-0 z-10">
          <tr>
            <th>Horário</th>
            <th>RA</th>
            <th>Aluno</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {presencas.map((p) => (
            <tr key={p.logId}>
              <td className="font-mono text-xs">
                {new Date(p.horario).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="font-mono text-gray-500">{p.ra}</td>
              <td className="font-bold text-gray-700">{p.aluno}</td>
              <td>
                <span className="badge badge-success badge-sm border-none text-white font-medium">
                  Presente
                </span>
              </td>
            </tr>
          ))}
          
          {/* Estado Vazio: Quando ninguém marcou presença */}
          {presencas.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-10 text-gray-400">
                Ninguém registrou presença hoje.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}