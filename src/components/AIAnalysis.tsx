'use client';

import { useState } from 'react';
import { Company } from '@/types/company';

interface AIAnalysisData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskFactors: string[];
  investmentOutlook: string;
}

interface FinancialMetric {
  thstrm_amount: string;
  frmtrm_amount?: string;
  bfefrmtrm_amount?: string;
}

interface AIAnalysisProps {
  company: Company;
  financialData: {
    bsnsYear: string;
    reprtCode: string;
    keyMetrics: {
      totalRevenue?: FinancialMetric;
      operatingProfit?: FinancialMetric;
      netIncome?: FinancialMetric;
      totalAssets?: FinancialMetric;
      totalLiabilities?: FinancialMetric;
      totalEquity?: FinancialMetric;
    };
  };
}

export default function AIAnalysis({ company, financialData }: AIAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes: { [key: string]: string } = {
    '11011': '사업보고서',
    '11012': '반기보고서',
    '11013': '1분기보고서',
    '11014': '3분기보고서',
  };

  const analyzeFinancialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 재무 데이터 유효성 검사
      if (!financialData || !financialData.keyMetrics) {
        setError('재무 데이터가 없습니다. 먼저 차트 분석 탭에서 데이터를 로드해주세요.');
        setLoading(false);
        return;
      }

      // 재무 지표를 숫자로 변환
      const keyMetrics = {
        totalRevenue: financialData.keyMetrics.totalRevenue 
          ? parseInt(financialData.keyMetrics.totalRevenue.thstrm_amount.replace(/,/g, '')) 
          : undefined,
        operatingProfit: financialData.keyMetrics.operatingProfit 
          ? parseInt(financialData.keyMetrics.operatingProfit.thstrm_amount.replace(/,/g, '')) 
          : undefined,
        netIncome: financialData.keyMetrics.netIncome 
          ? parseInt(financialData.keyMetrics.netIncome.thstrm_amount.replace(/,/g, '')) 
          : undefined,
        totalAssets: financialData.keyMetrics.totalAssets 
          ? parseInt(financialData.keyMetrics.totalAssets.thstrm_amount.replace(/,/g, '')) 
          : undefined,
        totalLiabilities: financialData.keyMetrics.totalLiabilities 
          ? parseInt(financialData.keyMetrics.totalLiabilities.thstrm_amount.replace(/,/g, '')) 
          : undefined,
        totalEquity: financialData.keyMetrics.totalEquity 
          ? parseInt(financialData.keyMetrics.totalEquity.thstrm_amount.replace(/,/g, '')) 
          : undefined,
      };

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: company.corp_name,
          year: financialData.bsnsYear,
          reportType: reportTypes[financialData.reprtCode] || '사업보고서',
          keyMetrics,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('AI 분석 성공, 받은 데이터:', result.data);
        setAnalysisData(result.data);
      } else {
        console.log('AI 분석 실패:', result.error);
        setError(result.error || 'AI 분석에 실패했습니다.');
      }
    } catch {
      setError('AI 분석 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 유효한 내용인지 확인하는 헬퍼 함수
  const isValidContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return content.length > 0 && 
             !content[0].includes('분석하는 중입니다') && 
             !content[0].includes('준비하는 중입니다') && 
             !content[0].includes('평가하는 중입니다') &&
             !content[0].includes('AI 분석이 완료되었으나') &&
             !content[0].includes('새로고침') &&
             !content[0].includes('추가적인 재무 분석') &&
             !content[0].includes('시장 리스크');
    }
    return content && content.length > 10 && 
           !content.includes('분석하는 중입니다') &&
           !content.includes('분석할 수 없습니다');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI가 분석 중입니다...</h3>
            <p className="text-gray-600">재무 데이터를 꼼꼼히 분석하고 있어요. 잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🤖💥</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">AI 분석 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={analyzeFinancialData}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            다시 분석하기
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-purple-500 text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">AI 재무 분석</h3>
          <p className="text-gray-600 mb-6">
            AI가 {company.corp_name}의 재무 데이터를 분석하여 
            <br />쉽고 명확한 인사이트를 제공해드립니다.
          </p>
          <button
            onClick={analyzeFinancialData}
            className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
          >
            🚀 AI 분석 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4">
          <span className="text-white text-2xl">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI 재무 분석</h2>
          <p className="text-gray-600">
            {company.corp_name} • {financialData.bsnsYear}년 • {reportTypes[financialData.reprtCode]}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 종합 분석 */}
        {isValidContent(analysisData.summary) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              📊 종합 분석
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysisData.summary}
              </p>
            </div>
          </div>
        )}

        {/* 재무적 강점 */}
        {isValidContent(analysisData.strengths) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              💪 재무적 강점
            </h3>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg space-y-3">
              {analysisData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <span className="mr-3 text-green-600 text-lg flex-shrink-0">✓</span>
                  <p className="text-gray-700 leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 주의사항 */}
        {isValidContent(analysisData.weaknesses) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              ⚠️ 주의사항
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg space-y-3">
              {analysisData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start">
                  <span className="mr-3 text-yellow-600 text-lg flex-shrink-0">!</span>
                  <p className="text-gray-700 leading-relaxed">{weakness}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 투자 가이드 */}
        {isValidContent(analysisData.recommendations) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              💡 투자 가이드
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-3">
              {analysisData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <span className="mr-3 text-blue-600 text-lg flex-shrink-0">💡</span>
                  <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 위험 요소 */}
        {isValidContent(analysisData.riskFactors) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              🚨 위험 요소
            </h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg space-y-3">
              {analysisData.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start">
                  <span className="mr-3 text-red-600 text-lg flex-shrink-0">⚠</span>
                  <p className="text-gray-700 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 투자 전망 */}
        {isValidContent(analysisData.investmentOutlook) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              🎯 투자 전망
            </h3>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysisData.investmentOutlook}
              </p>
            </div>
          </div>
        )}

        {/* 디버깅용: 원본 데이터 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">🔍 디버그 정보</summary>
            <pre className="text-xs bg-gray-100 p-4 mt-2 rounded overflow-auto">
              {JSON.stringify(analysisData, null, 2)}
            </pre>
          </details>
        )}

        {/* 새로 분석하기 버튼 */}
        <div className="text-center pt-4">
          <button
            onClick={analyzeFinancialData}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🔄 새로 분석하기
          </button>
        </div>
      </div>
    </div>
  );
}