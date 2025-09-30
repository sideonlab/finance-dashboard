import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
}

// Gemini AI 인스턴스 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 재무 분석용 모델 설정 (최신 2.5 Flash 모델 사용)
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", // 최신 2.5 Flash 모델 사용
  generationConfig: {
    temperature: 0.3, // 더 일관된 결과를 위해 낮춤
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 4096, // 더 긴 응답을 위해 증가
  },
});

export interface FinancialAnalysisRequest {
  companyName: string;
  year: string;
  reportType: string;
  keyMetrics: {
    totalRevenue?: number;
    operatingProfit?: number;
    netIncome?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
  };
}

export interface FinancialAnalysisResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskFactors: string[];
  investmentOutlook: string;
}

/**
 * 재무 데이터를 분석하여 사용자 친화적인 인사이트를 제공합니다.
 */
export async function analyzeFinancialData(data: FinancialAnalysisRequest): Promise<FinancialAnalysisResponse> {
  try {
    console.log('=== AI 분석 시작 ===');
    console.log('회사명:', data.companyName);
    console.log('API 키 존재:', !!GEMINI_API_KEY);
    
    const prompt = createFinancialAnalysisPrompt(data);
    console.log('프롬프트 길이:', prompt.length);
    
    const result = await model.generateContent(prompt);
    console.log('Gemini API 호출 성공');
    
    const response = await result.response;
    const text = response.text();
    console.log('응답 텍스트 길이:', text.length);
    console.log('원본 AI 응답:', text);
    
    // 임시: 파싱 없이 원본 텍스트 확인
    console.log('=== 원본 AI 응답 (전체) ===');
    console.log(text);
    console.log('========================');
    
    // AI 응답을 구조화된 데이터로 파싱
    const parsedResponse = parseAnalysisResponse(text);
    console.log('파싱된 결과:', JSON.stringify(parsedResponse, null, 2));
    console.log('=== AI 분석 완료 ===');
    
    // 원본 텍스트 처리 개선
    if (!parsedResponse.summary || parsedResponse.summary.length < 10) {
      if (text.length > 20) {
        // 원본 텍스트를 그대로 summary에 표시
        parsedResponse.summary = `[AI 원본 응답]\n\n${text}`;
        
        // 원본 텍스트에서 의미있는 내용 추출 시도
        const lines = text.split('\n').filter(line => line.trim().length > 10);
        if (lines.length > 0) {
          parsedResponse.strengths = lines.slice(0, 3).length > 0 ? lines.slice(0, 3) : parsedResponse.strengths;
          parsedResponse.weaknesses = lines.slice(3, 5).length > 0 ? lines.slice(3, 5) : parsedResponse.weaknesses;
          parsedResponse.recommendations = lines.slice(5, 8).length > 0 ? lines.slice(5, 8) : parsedResponse.recommendations;
          parsedResponse.riskFactors = lines.slice(8, 10).length > 0 ? lines.slice(8, 10) : parsedResponse.riskFactors;
          parsedResponse.investmentOutlook = lines.length > 10 ? lines.slice(10).join(' ') : parsedResponse.investmentOutlook;
        }
      } else {
        parsedResponse.summary = "AI 응답이 비어있거나 너무 짧습니다. 다시 시도해보세요.";
      }
    }
    
    return parsedResponse;
    
  } catch (error) {
    console.error('=== Gemini API 오류 상세 ===');
    console.error('에러 타입:', error?.constructor?.name);
    console.error('에러 메시지:', error?.message);
    console.error('전체 에러:', error);
    console.error('========================');
    
    // 구체적인 에러 메시지 제공
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API 키가 유효하지 않습니다.');
    } else if (error?.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API 사용량이 초과되었습니다.');
    } else if (error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
      throw new Error('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error(`AI 분석 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
    }
  }
}

/**
 * 재무 분석을 위한 프롬프트 생성
 */
function createFinancialAnalysisPrompt(data: FinancialAnalysisRequest): string {
  const { companyName, year, reportType, keyMetrics } = data;
  
  return `당신은 전문 재무 분석가입니다. ${companyName}의 ${year}년 ${reportType} 데이터를 분석해주세요.

재무 데이터:
- 매출액: ${keyMetrics.totalRevenue ? formatKoreanWon(keyMetrics.totalRevenue) : '정보없음'}
- 영업이익: ${keyMetrics.operatingProfit ? formatKoreanWon(keyMetrics.operatingProfit) : '정보없음'}  
- 당기순이익: ${keyMetrics.netIncome ? formatKoreanWon(keyMetrics.netIncome) : '정보없음'}
- 자산총계: ${keyMetrics.totalAssets ? formatKoreanWon(keyMetrics.totalAssets) : '정보없음'}
- 부채총계: ${keyMetrics.totalLiabilities ? formatKoreanWon(keyMetrics.totalLiabilities) : '정보없음'}
- 자본총계: ${keyMetrics.totalEquity ? formatKoreanWon(keyMetrics.totalEquity) : '정보없음'}

다음 형식으로 정확히 분석해주세요:

## 종합 분석
${companyName}의 전반적인 재무 상태를 3-4문장으로 요약하세요.

## 강점
1. [첫 번째 강점을 한 문장으로]
2. [두 번째 강점을 한 문장으로]  
3. [세 번째 강점을 한 문장으로]

## 약점
1. [첫 번째 약점을 한 문장으로]
2. [두 번째 약점을 한 문장으로]

## 투자 조언  
1. [첫 번째 조언을 한 문장으로]
2. [두 번째 조언을 한 문장으로]
3. [세 번째 조언을 한 문장으로]

## 위험 요소
1. [첫 번째 위험을 한 문장으로]
2. [두 번째 위험을 한 문장으로]

## 투자 전망
[긍정적/중립적/부정적] 전망과 그 이유를 2-3문장으로 설명하세요.

모든 내용을 한국어로, 구체적인 숫자를 포함하여 작성해주세요.`;
}

/**
 * AI 응답을 구조화된 데이터로 파싱 (마크다운 형식)
 */
function parseAnalysisResponse(text: string): FinancialAnalysisResponse {
  console.log('파싱 시작, 텍스트 길이:', text.length);
  
  let summary = '';
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const riskFactors: string[] = [];
  let investmentOutlook = '';
  
  // 마크다운 섹션별로 파싱
  const summaryMatch = text.match(/## 종합 분석\s*\n([\s\S]*?)(?=\n## |$)/);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }
  
  const strengthsMatch = text.match(/## 강점\s*\n([\s\S]*?)(?=\n## |$)/);
  if (strengthsMatch) {
    const strengthLines = strengthsMatch[1].split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    strengths.push(...strengthLines);
  }
  
  const weaknessesMatch = text.match(/## 약점\s*\n([\s\S]*?)(?=\n## |$)/);
  if (weaknessesMatch) {
    const weaknessLines = weaknessesMatch[1].split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    weaknesses.push(...weaknessLines);
  }
  
  const recommendationsMatch = text.match(/## 투자 조언\s*\n([\s\S]*?)(?=\n## |$)/);
  if (recommendationsMatch) {
    const recommendationLines = recommendationsMatch[1].split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    recommendations.push(...recommendationLines);
  }
  
  const riskFactorsMatch = text.match(/## 위험 요소\s*\n([\s\S]*?)(?=\n## |$)/);
  if (riskFactorsMatch) {
    const riskLines = riskFactorsMatch[1].split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    riskFactors.push(...riskLines);
  }
  
  const outlookMatch = text.match(/## 투자 전망\s*\n([\s\S]*?)(?=\n## |$)/);
  if (outlookMatch) {
    investmentOutlook = outlookMatch[1].trim();
  }
  
  console.log('마크다운 파싱 결과:', {
    summary: summary.substring(0, 100) + '...',
    strengths: strengths.length,
    weaknesses: weaknesses.length,
    recommendations: recommendations.length,
    riskFactors: riskFactors.length,
    investmentOutlook: investmentOutlook.substring(0, 100) + '...'
  });

  // 파싱 실패 시 폴백 로직
  if (!summary && strengths.length === 0 && weaknesses.length === 0) {
    console.log('마크다운 파싱 실패, 폴백 파싱 시도');
    return fallbackParseResponse(text);
  }

  return {
    summary: summary || '분석 결과를 처리하는 중입니다.',
    strengths: strengths.length > 0 ? strengths : ['재무 강점을 분석하는 중입니다.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['주의사항을 분석하는 중입니다.'],
    recommendations: recommendations.length > 0 ? recommendations : ['투자 가이드를 준비하는 중입니다.'],
    riskFactors: riskFactors.length > 0 ? riskFactors : ['위험 요소를 평가하는 중입니다.'],
    investmentOutlook: investmentOutlook || '투자 전망을 분석하는 중입니다.',
  };
}

/**
 * 정형화된 파싱 실패 시 사용하는 폴백 파싱
 */
function fallbackParseResponse(text: string): FinancialAnalysisResponse {
  console.log('폴백 파싱 실행');
  
  // 텍스트를 문단으로 분할
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  // 문단에서 유용한 내용 추출 시도
  const meaningfulParagraphs = paragraphs.filter(p => 
    p.length > 20 && 
    !p.includes('**') && 
    !p.includes('[') &&
    !p.includes('SUMMARY') &&
    !p.includes('STRENGTHS')
  );
  
  return {
    summary: meaningfulParagraphs.length > 0 ? meaningfulParagraphs[0] : 
             text.length > 100 ? text.substring(0, 500).replace(/\*\*/g, '') : text,
    strengths: meaningfulParagraphs.slice(1, 4).length > 0 ? 
               meaningfulParagraphs.slice(1, 4) : 
               ['AI 분석이 완료되었으나 형식 변환 중입니다. 전체 내용을 종합 분석에서 확인하세요.'],
    weaknesses: meaningfulParagraphs.slice(4, 6).length > 0 ? 
                meaningfulParagraphs.slice(4, 6) : 
                ['상세 분석을 위해 새로고침 후 다시 시도해보세요.'],
    recommendations: meaningfulParagraphs.slice(6, 9).length > 0 ? 
                     meaningfulParagraphs.slice(6, 9) : 
                     ['투자 결정 전 추가적인 재무 분석을 권장합니다.'],
    riskFactors: meaningfulParagraphs.slice(9, 11).length > 0 ? 
                 meaningfulParagraphs.slice(9, 11) : 
                 ['일반적인 시장 리스크와 업종별 위험 요소를 고려하세요.'],
    investmentOutlook: meaningfulParagraphs.length > 11 ? meaningfulParagraphs[11] : 
                      '전체 AI 분석 결과: ' + (text.length > 300 ? text.substring(0, 300).replace(/\*\*/g, '') + '...' : text.replace(/\*\*/g, '')),
  };
}



/**
 * 숫자를 한국어 단위로 포맷팅
 */
function formatKoreanWon(amount: number): string {
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
