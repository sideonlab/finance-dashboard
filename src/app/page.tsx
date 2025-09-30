'use client';

import { useState } from 'react';
import CompanySearch from '@/components/CompanySearch';
import FinancialDashboard from '@/components/FinancialDashboard';
import { Company } from '@/types/company';

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    console.log('선택된 회사:', company);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 재무 데이터 분석 서비스
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            누구나 쉽게 이해할 수 있는 재무 데이터 시각화
          </p>
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            🔍 회사 검색
          </h2>
          <CompanySearch onCompanySelect={handleCompanySelect} />
        </div>

        {/* 재무 대시보드 */}
        {selectedCompany && (
          <FinancialDashboard company={selectedCompany} />
        )}

        {/* 기능 소개 */}
        {!selectedCompany && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">1단계: 검색</h3>
              <p className="text-gray-600 text-sm">
                회사명, 영문명, 종목코드로 원하는 회사를 빠르게 찾아보세요
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">2단계: 시각화</h3>
              <p className="text-gray-600 text-sm">
                재무 데이터를 아름다운 차트로 시각화합니다
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">3단계: AI 분석</h3>
              <p className="text-gray-600 text-sm">
                AI가 재무 정보를 쉽게 해석해드립니다
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}