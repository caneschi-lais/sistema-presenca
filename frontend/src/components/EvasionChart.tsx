import { BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DadosEvasao {
  semestre: string;
  taxa: number;
}

interface EvasionChartProps {
  data: DadosEvasao[];
}

export default function EvasionChart({ data }: EvasionChartProps) {
  return (
    <div className="card bg-base-100 shadow-sm mb-8 border border-base-200">
      <div className="card-body">
        <h3 className="card-title text-base-content mb-6 flex items-center gap-2">
          <BarChart3 className="text-primary" /> Histórico de Evasão (Taxa Geral FATEC)
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="semestre" stroke="#6b7280" fontStyle="bold" />
              <YAxis unit="%" stroke="#6b7280" />
              <Tooltip
                formatter={(value: any) => [`${value}%`, 'Taxa de Evasão']}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="#ef4444"
                strokeWidth={4}
                dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-sm text-gray-500 mt-4 text-center">
          *A taxa de evasão considera alunos que abandonaram o curso ou estouraram o limite de 25% de faltas.
        </div>
      </div>
    </div>
  );
}