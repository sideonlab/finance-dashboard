import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// 공통 차트 옵션
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: function(context: { dataset: { label: string }; parsed: { y?: number } | number }) {
          const value = (typeof context.parsed === 'number' ? context.parsed : context.parsed.y) || 0;
          return `${context.dataset.label}: ${formatAmount(value)}`;
        }
      }
    },
  },
};

// 막대 차트 옵션
export const barChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: string | number) {
          return formatAmount(typeof value === 'string' ? parseFloat(value) : value);
        }
      }
    },
  },
};

// 도넛 차트 옵션
export const doughnutChartOptions = {
  ...commonChartOptions,
  cutout: '60%',
};

// 금액 포맷팅 함수
export function formatAmount(amount: number): string {
  if (amount === 0) return '0원';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000000) { // 조 단위
    return `${(amount / 1000000000000).toFixed(1)}조원`;
  } else if (absAmount >= 100000000) { // 억 단위
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (absAmount >= 10000) { // 만 단위
    return `${(amount / 10000).toFixed(1)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
}
