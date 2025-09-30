// OpenDART API 연동 함수들

const OPENDART_API_KEY = '1e0c74ab85c2a003495483edc131f2d52210fafe';
const OPENDART_BASE_URL = 'https://opendart.fss.or.kr/api';

export interface FinancialData {
  rcept_no: string;
  bsns_year: string;
  stock_code: string;
  reprt_code: string;
  account_nm: string;
  fs_div: string;
  fs_nm: string;
  sj_div: string;
  sj_nm: string;
  thstrm_nm: string;
  thstrm_dt: string;
  thstrm_amount: string;
  thstrm_add_amount?: string;
  frmtrm_nm?: string;
  frmtrm_dt?: string;
  frmtrm_amount?: string;
  frmtrm_add_amount?: string;
  bfefrmtrm_nm?: string;
  bfefrmtrm_dt?: string;
  bfefrmtrm_amount?: string;
  ord: string;
  currency: string;
}

export interface OpenDartResponse {
  status: string;
  message: string;
  list?: FinancialData[];
}

/**
 * 단일회사 주요계정 데이터를 가져옵니다.
 * @param corpCode 고유번호 (8자리)
 * @param bsnsYear 사업연도 (4자리)
 * @param reprtCode 보고서 코드 (11011: 사업보고서, 11012: 반기보고서, 11013: 1분기보고서, 11014: 3분기보고서)
 */
export async function getFinancialData(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string = '11011' // 기본값: 사업보고서
): Promise<OpenDartResponse> {
  try {
    const url = new URL(`${OPENDART_BASE_URL}/fnlttSinglAcnt.json`);
    url.searchParams.append('crtfc_key', OPENDART_API_KEY);
    url.searchParams.append('corp_code', corpCode);
    url.searchParams.append('bsns_year', bsnsYear);
    url.searchParams.append('reprt_code', reprtCode);

    const response = await fetch(url.toString());
    const data: OpenDartResponse = await response.json();

    return data;
  } catch (error) {
    console.error('OpenDART API 호출 실패:', error);
    return {
      status: '000',
      message: 'API 호출 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 재무제표 데이터를 카테고리별로 분류합니다.
 */
export function categorizeFinancialData(data: FinancialData[]) {
  const categories = {
    assets: data.filter(item => item.sj_div === 'BS' && item.account_nm.includes('자산')),
    liabilities: data.filter(item => item.sj_div === 'BS' && item.account_nm.includes('부채')),
    equity: data.filter(item => item.sj_div === 'BS' && item.account_nm.includes('자본')),
    revenue: data.filter(item => item.sj_div === 'IS' && (item.account_nm.includes('매출') || item.account_nm.includes('수익'))),
    expenses: data.filter(item => item.sj_div === 'IS' && (item.account_nm.includes('비용') || item.account_nm.includes('손실'))),
    profit: data.filter(item => item.sj_div === 'IS' && item.account_nm.includes('이익')),
  };

  return categories;
}

/**
 * 금액 문자열을 숫자로 변환합니다.
 */
export function parseAmount(amount: string): number {
  if (!amount || amount === '-') return 0;
  return parseInt(amount.replace(/,/g, ''), 10) || 0;
}

/**
 * 숫자를 한국어 단위로 포맷팅합니다.
 */
export function formatKoreanAmount(amount: number): string {
  if (amount === 0) return '0원';
  
  const units = ['', '만', '억', '조'];
  let result = '';
  let unitIndex = 0;
  
  while (amount > 0 && unitIndex < units.length) {
    const remainder = amount % 10000;
    if (remainder > 0) {
      result = `${remainder.toLocaleString()}${units[unitIndex]} ${result}`;
    }
    amount = Math.floor(amount / 10000);
    unitIndex++;
  }
  
  return result.trim() + '원';
}

/**
 * 보고서 코드를 한국어 이름으로 변환합니다.
 */
export function getReportName(reprtCode: string): string {
  const reportNames: { [key: string]: string } = {
    '11011': '사업보고서',
    '11012': '반기보고서',
    '11013': '1분기보고서',
    '11014': '3분기보고서',
  };
  
  return reportNames[reprtCode] || '알 수 없는 보고서';
}
