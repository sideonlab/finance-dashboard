'use client';

import { Bar } from 'react-chartjs-2';
import { barChartOptions } from './ChartConfig';

interface IncomeStatementChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  };
}

export default function IncomeStatementChart({ data }: IncomeStatementChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        📈 손익계산서
      </h3>
      <div className="h-80">
        <Bar data={data} options={barChartOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>• 매출액: 회사가 벌어들인 총 수익</p>
        <p>• 영업이익: 본업에서 발생한 이익</p>
        <p>• 당기순이익: 모든 비용을 제외한 최종 이익</p>
      </div>
    </div>
  );
}
