import { NextRequest, NextResponse } from 'next/server';
import { getFinancialData, categorizeFinancialData, parseAmount } from '@/lib/opendart';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const corpCode = searchParams.get('corp_code');
  const bsnsYear = searchParams.get('bsns_year') || '2024';
  const reprtCode = searchParams.get('reprt_code') || '11011'; // 기본값: 사업보고서

  if (!corpCode) {
    return NextResponse.json(
      { error: '회사 고유번호(corp_code)가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const data = await getFinancialData(corpCode, bsnsYear, reprtCode);

    if (data.status !== '000') {
      return NextResponse.json(
        { error: data.message || '재무 데이터를 가져오는데 실패했습니다.' },
        { status: 400 }
      );
    }

    if (!data.list || data.list.length === 0) {
      return NextResponse.json(
        { error: '해당 조건의 재무 데이터가 없습니다.' },
        { status: 404 }
      );
    }

    // 데이터 분류
    const categorized = categorizeFinancialData(data.list);

    // 디버깅: 손익계산서 계정명 확인
    const isItems = data.list.filter(item => item.sj_div === 'IS');
    console.log('=== 손익계산서 계정명 목록 ===');
    isItems.forEach(item => {
      console.log(`계정명: "${item.account_nm}", 금액: ${item.thstrm_amount}`);
    });
    console.log('========================');

     // 주요 재무 지표 추출 (다양한 계정명 패턴 지원)
     const keyMetrics = {
       // 자산
       totalAssets: data.list.find(item => 
         item.sj_div === 'BS' && (
           item.account_nm === '자산총계' || 
           item.account_nm.includes('자산총계') ||
           item.account_nm === '총자산'
         )
       ),
       // 부채
       totalLiabilities: data.list.find(item => 
         item.sj_div === 'BS' && (
           item.account_nm === '부채총계' || 
           item.account_nm.includes('부채총계') ||
           item.account_nm === '총부채'
         )
       ),
       // 자본
       totalEquity: data.list.find(item => 
         item.sj_div === 'BS' && (
           item.account_nm === '자본총계' || 
           item.account_nm.includes('자본총계') ||
           item.account_nm === '총자본' ||
           item.account_nm.includes('자본금')
         )
       ),
       // 매출액
       totalRevenue: data.list.find(item => 
         item.sj_div === 'IS' && (
           item.account_nm === '매출액' || 
           item.account_nm === '수익(매출액)' ||
           item.account_nm.includes('매출') ||
           item.account_nm.includes('수익')
         )
       ),
       // 영업이익
       operatingProfit: data.list.find(item => 
         item.sj_div === 'IS' && (
           item.account_nm === '영업이익' ||
           item.account_nm.includes('영업이익') ||
           item.account_nm === '영업손익'
         )
       ),
       // 당기순이익
       netIncome: data.list.find(item => 
         item.sj_div === 'IS' && (
           item.account_nm === '당기순이익' ||
           item.account_nm.includes('당기순이익') ||
           item.account_nm === '순이익' ||
           item.account_nm.includes('순손익') ||
           item.account_nm === '당기순손익' ||
           item.account_nm.includes('당기순')
         )
       ),
     };

    // 차트 데이터 생성
    const chartData = {
      // 재무상태표 (자산, 부채, 자본)
      balanceSheet: {
        labels: ['자산총계', '부채총계', '자본총계'],
        datasets: [{
          label: '재무상태표 (단위: 원)',
          data: [
            keyMetrics.totalAssets ? parseAmount(keyMetrics.totalAssets.thstrm_amount) : 0,
            keyMetrics.totalLiabilities ? parseAmount(keyMetrics.totalLiabilities.thstrm_amount) : 0,
            keyMetrics.totalEquity ? parseAmount(keyMetrics.totalEquity.thstrm_amount) : 0,
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        }],
      },
      // 손익계산서 (매출액, 영업이익, 당기순이익)
      incomeStatement: {
        labels: ['매출액', '영업이익', '당기순이익'],
        datasets: [{
          label: '손익계산서 (단위: 원)',
          data: [
            keyMetrics.totalRevenue ? parseAmount(keyMetrics.totalRevenue.thstrm_amount) : 0,
            keyMetrics.operatingProfit ? parseAmount(keyMetrics.operatingProfit.thstrm_amount) : 0,
            keyMetrics.netIncome ? parseAmount(keyMetrics.netIncome.thstrm_amount) : 0,
          ],
          backgroundColor: [
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
          ],
          borderColor: [
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 205, 86, 1)',
          ],
          borderWidth: 1,
        }],
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        corpCode,
        bsnsYear,
        reprtCode,
        keyMetrics,
        chartData,
        categorized,
        rawData: data.list,
      },
    });

  } catch (error) {
    console.error('재무 데이터 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
