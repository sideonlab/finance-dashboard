'use client';

import { Doughnut } from 'react-chartjs-2';
import { doughnutChartOptions } from './ChartConfig';

interface BalanceSheetChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
}

export default function BalanceSheetChart({ data }: BalanceSheetChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        📊 재무상태표
      </h3>
      <div className="h-80">
        <Doughnut data={data} options={doughnutChartOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>• 자산총계: 회사가 보유한 모든 자산의 합계</p>
        <p>• 부채총계: 회사가 갚아야 할 모든 부채의 합계</p>
        <p>• 자본총계: 주주의 몫 (자산 - 부채)</p>
      </div>
    </div>
  );
}
