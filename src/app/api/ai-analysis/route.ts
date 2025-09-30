import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialData, FinancialAnalysisRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI 분석 API 요청 받음 ===');
    
    const body = await request.json();
    console.log('요청 데이터:', JSON.stringify(body, null, 2));
    
    const {
      companyName,
      year,
      reportType,
      keyMetrics
    } = body as FinancialAnalysisRequest;

    // 필수 데이터 검증
    if (!companyName || !year || !keyMetrics) {
      console.log('필수 데이터 누락');
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('데이터 검증 통과, AI 분석 시작');

    // AI 분석 실행
    const analysis = await analyzeFinancialData({
      companyName,
      year,
      reportType: reportType || '사업보고서',
      keyMetrics
    });

    console.log('AI 분석 성공, 응답 전송');
    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('=== AI 분석 API 오류 ===');
    console.error('오류 상세:', error);
    
    // 에러 타입에 따른 구체적 메시지
    let errorMessage = 'AI 분석 중 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      console.log('에러 메시지:', error.message);
      errorMessage = error.message;
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI 서비스 인증에 실패했습니다.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'AI 서비스 사용량이 초과되었습니다.';
      } else if (error.message.includes('network')) {
        errorMessage = 'AI 서비스 연결에 실패했습니다.';
      }
    }

    console.log('최종 에러 메시지:', errorMessage);
    console.log('========================');

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
