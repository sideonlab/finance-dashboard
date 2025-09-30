'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Company, SearchResponse } from '@/types/company';

interface CompanySearchProps {
  onCompanySelect?: (company: Company) => void;
}

export default function CompanySearch({ onCompanySelect }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 디바운스 검색
  const searchFunction = useCallback(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const data: SearchResponse = await response.json();

        if (data.success) {
          setResults(data.data);
          setShowResults(true);
        } else {
          setError(data.error || '검색 중 오류가 발생했습니다.');
          setResults([]);
          setShowResults(false);
        }
      } catch {
        setError('검색 중 오류가 발생했습니다.');
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
  }, []);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      searchFunction(searchQuery);
    }, 300);
  }, [searchFunction]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setQuery(company.corp_name);
    setShowResults(false);
    onCompanySelect?.(company);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (selectedCompany && value !== selectedCompany.corp_name) {
      setSelectedCompany(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* 검색 입력 */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="회사명, 영문명, 또는 종목코드를 입력하세요..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* 검색 결과 */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((company) => (
                  <button
                    key={company.corp_code}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{company.corp_name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {company.corp_eng_name && (
                        <span className="mr-4">{company.corp_eng_name}</span>
                      )}
                      {company.stock_code && (
                        <span className="text-blue-600 font-mono">{company.stock_code}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      고유번호: {company.corp_code}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* 선택된 회사 정보 */}
        {selectedCompany && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">선택된 회사</h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">회사명:</span> {selectedCompany.corp_name}</div>
              {selectedCompany.corp_eng_name && (
                <div><span className="font-medium">영문명:</span> {selectedCompany.corp_eng_name}</div>
              )}
              {selectedCompany.stock_code && (
                <div><span className="font-medium">종목코드:</span> {selectedCompany.stock_code}</div>
              )}
              <div><span className="font-medium">고유번호:</span> {selectedCompany.corp_code}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

