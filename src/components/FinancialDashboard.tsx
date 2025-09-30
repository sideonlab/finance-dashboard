'use client';

import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/types/company';
import BalanceSheetChart from './charts/BalanceSheetChart';
import IncomeStatementChart from './charts/IncomeStatementChart';
import AIAnalysis from './AIAnalysis';
import { formatAmount } from './charts/ChartConfig';

interface FinancialMetric {
  thstrm_amount: string;
  frmtrm_amount?: string;
  bfefrmtrm_amount?: string;
}

interface FinancialData {
  corpCode: string;
  bsnsYear: string;
  reprtCode: string;
  keyMetrics: {
    totalAssets?: FinancialMetric;
    totalLiabilities?: FinancialMetric;
    totalEquity?: FinancialMetric;
    totalRevenue?: FinancialMetric;
    operatingProfit?: FinancialMetric;
    netIncome?: FinancialMetric;
  };
  chartData: {
    balanceSheet: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
      }[];
    };
    incomeStatement: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
      }[];
    };
  };
}

interface FinancialDashboardProps {
  company: Company;
}

export default function FinancialDashboard({ company }: FinancialDashboardProps) {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2024'); // 2024년으로 기본값 변경
  const [selectedReport, setSelectedReport] = useState<string>('11011'); // 사업보고서

  const reportTypes = [
    { code: '11011', name: '사업보고서' },
    { code: '11012', name: '반기보고서' },
    { code: '11013', name: '1분기보고서' },
    { code: '11014', name: '3분기보고서' },
  ];

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/financial-data?corp_code=${company.corp_code}&bsns_year=${selectedYear}&reprt_code=${selectedReport}`
      );
      const result = await response.json();

      if (result.success) {
        setFinancialData(result.data);
      } else {
        let errorMessage = result.error || '재무 데이터를 가져오는데 실패했습니다.';
        
        // 특정 에러에 대한 사용자 친화적 메시지
        if (errorMessage.includes('해당 조건의 재무 데이터가 없습니다')) {
          errorMessage = `${selectedYear}년 ${reportTypes.find(r => r.code === selectedReport)?.name} 데이터가 없습니다. 다른 연도나 보고서를 선택해보세요.`;
        }
        
        setError(errorMessage);
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [company.corp_code, selectedYear, selectedReport, reportTypes]);

  useEffect(() => {
    fetchFinancialData();
  }, [company.corp_code, selectedYear, selectedReport, fetchFinancialData]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg text-gray-600">재무 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">데이터 로드 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* 도움말 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">💡 도움말</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 최근 데이터는 2024년까지 제공됩니다</li>
              <li>• 분기보고서는 해당 분기에만 제공됩니다</li>
              <li>• 일부 회사는 특정 연도 데이터가 없을 수 있습니다</li>
              <li>• 사업보고서(연간)를 먼저 확인해보세요</li>
            </ul>
          </div>
          
          <button
            onClick={fetchFinancialData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📊 {company.corp_name} 재무 분석
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {/* 연도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업연도
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = 2024 - i; // 2024년부터 시작
                return (
                  <option key={year} value={year.toString()}>
                    {year}년
                  </option>
                );
              })}
            </select>
          </div>

          {/* 보고서 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              보고서 유형
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 주요 지표 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financialData.keyMetrics.totalRevenue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800">매출액</h4>
              <p className="text-2xl font-bold text-blue-900">
                {formatAmount(parseInt(financialData.keyMetrics.totalRevenue.thstrm_amount.replace(/,/g, '')))}
              </p>
            </div>
          )}
          
          {financialData.keyMetrics.operatingProfit && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800">영업이익</h4>
              <p className="text-2xl font-bold text-green-900">
                {formatAmount(parseInt(financialData.keyMetrics.operatingProfit.thstrm_amount.replace(/,/g, '')))}
              </p>
            </div>
          )}
          
          {financialData.keyMetrics.netIncome && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800">당기순이익</h4>
              <p className="text-2xl font-bold text-purple-900">
                {formatAmount(parseInt(financialData.keyMetrics.netIncome.thstrm_amount.replace(/,/g, '')))}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceSheetChart data={financialData.chartData.balanceSheet} />
        <IncomeStatementChart data={financialData.chartData.incomeStatement} />
      </div>

      {/* AI 분석 섹션 */}
      <AIAnalysis company={company} financialData={financialData} />

      {/* 추가 정보 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📋 보고서 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">회사명:</span>
            <span className="ml-2 text-gray-900">{company.corp_name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">종목코드:</span>
            <span className="ml-2 text-gray-900">{company.stock_code || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">사업연도:</span>
            <span className="ml-2 text-gray-900">{financialData.bsnsYear}년</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">보고서 유형:</span>
            <span className="ml-2 text-gray-900">
              {reportTypes.find(type => type.code === financialData.reprtCode)?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
