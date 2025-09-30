// 임시 목업 AI 분석 데이터
import { FinancialAnalysisRequest, FinancialAnalysisResponse } from './gemini';

export function getMockAnalysis(data: FinancialAnalysisRequest): FinancialAnalysisResponse {
  const { companyName, keyMetrics } = data;
  
  // 매출액 기준으로 회사 규모 판단
  const revenue = keyMetrics.totalRevenue || 0;
  const isLargeCompany = revenue > 1000000000000; // 1조원 이상
  const isMediumCompany = revenue > 100000000000; // 1000억원 이상
  
  return {
    summary: `${companyName}은(는) ${isLargeCompany ? '대기업' : isMediumCompany ? '중견기업' : '중소기업'} 규모의 회사로, ${data.year}년 재무 성과를 종합적으로 분석한 결과 안정적인 재무 구조를 보여주고 있습니다. 매출액은 ${formatKoreanWon(revenue)}을 기록했으며, 전반적으로 ${keyMetrics.netIncome && keyMetrics.netIncome > 0 ? '수익성이 양호한' : '개선이 필요한'} 상태입니다. 투자자 관점에서 볼 때 ${isLargeCompany ? '안정적인 투자처' : '성장 가능성이 있는 기업'}로 평가됩니다.`,
    
    strengths: [
      `매출액 ${formatKoreanWon(revenue)} 달성으로 시장에서의 경쟁력 확보`,
      keyMetrics.totalAssets ? `총자산 ${formatKoreanWon(keyMetrics.totalAssets)}으로 탄탄한 자산 기반 보유` : '안정적인 자산 구조 유지',
      keyMetrics.operatingProfit && keyMetrics.operatingProfit > 0 ? '영업이익 흑자 달성으로 본업 경쟁력 입증' : '지속적인 사업 운영 능력',
      keyMetrics.totalEquity && keyMetrics.totalEquity > 0 ? '양호한 자본 구조로 재무 안정성 확보' : '기본적인 재무 건전성 유지',
      `${companyName}만의 고유한 사업 모델과 시장 지위 확보`
    ].filter(Boolean),
    
    weaknesses: [
      keyMetrics.netIncome && keyMetrics.netIncome < 0 ? '당기순손실 발생으로 수익성 개선 필요' : '수익성 지표 모니터링 필요',
      keyMetrics.totalLiabilities && keyMetrics.totalEquity && 
      (keyMetrics.totalLiabilities / keyMetrics.totalEquity) > 1 ? '부채비율이 높아 재무 레버리지 관리 필요' : '부채 관리 지속 모니터링',
      '시장 변화에 따른 리스크 관리 체계 강화 필요',
      '경쟁사 대비 차별화 전략 지속 발전 필요'
    ].filter(Boolean),
    
    recommendations: [
      keyMetrics.operatingProfit && keyMetrics.operatingProfit > 0 ? '영업이익률 개선을 통한 수익성 극대화 추진' : '영업 효율성 개선을 통한 수익성 확보',
      '신규 사업 영역 발굴을 통한 성장 동력 확보',
      '디지털 전환 투자를 통한 경쟁력 강화',
      keyMetrics.totalLiabilities && keyMetrics.totalAssets && 
      (keyMetrics.totalLiabilities / keyMetrics.totalAssets) > 0.6 ? '부채 구조 최적화를 통한 재무 건전성 개선' : '현재의 건전한 재무 구조 유지',
      'ESG 경영 강화를 통한 지속가능한 성장 기반 구축'
    ].filter(Boolean),
    
    riskFactors: [
      '경제 침체 및 시장 변동성에 따른 매출 감소 리스크',
      '원자재 가격 상승 및 인플레이션 압력',
      keyMetrics.totalLiabilities && keyMetrics.totalLiabilities > 500000000000 ? '대규모 부채로 인한 금리 상승 리스크' : '금리 변동에 따른 재무비용 증가 가능성',
      '업계 경쟁 심화 및 신규 진입자 위협',
      '규제 변화 및 정책 리스크'
    ].filter(Boolean),
    
    investmentOutlook: `${companyName}의 투자 전망은 ${
      keyMetrics.netIncome && keyMetrics.netIncome > 0 && 
      keyMetrics.operatingProfit && keyMetrics.operatingProfit > 0 
        ? '긍정적' : '중립적'
    }입니다. ${
      isLargeCompany 
        ? '대기업으로서의 안정성과 시장 지배력을 바탕으로 꾸준한 수익 창출이 기대됩니다.' 
        : '중장기적으로 성장 가능성이 있으나, 시장 상황과 경영진의 전략 실행력을 지켜볼 필요가 있습니다.'
    } 투자 시에는 업계 동향과 회사의 전략적 방향성을 면밀히 검토한 후 결정하시기 바랍니다.`
  };
}

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
