import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Company {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

let companiesData: Company[] | null = null;

// 회사 데이터를 메모리에 로드
function loadCompaniesData(): Company[] {
  if (companiesData === null) {
    try {
      const dataPath = path.join(process.cwd(), 'public/data/companies.json');
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      companiesData = JSON.parse(fileContent);
    } catch (error) {
      console.error('회사 데이터 로드 실패:', error);
      companiesData = [];
    }
  }
  return companiesData;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 });
  }

  try {
    const companies = loadCompaniesData();
    
    // 검색어로 회사명 필터링 (대소문자 구분 없이)
    const searchTerm = query.toLowerCase().trim();
    const filteredCompanies = companies.filter(company => 
      company.corp_name.toLowerCase().includes(searchTerm) ||
      company.corp_eng_name.toLowerCase().includes(searchTerm) ||
      company.stock_code.includes(searchTerm)
    );

    // 결과 제한
    const limitedResults = filteredCompanies.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedResults,
      total: filteredCompanies.length,
      query: query
    });

  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
