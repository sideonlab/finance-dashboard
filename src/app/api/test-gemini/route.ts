import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET() {
  try {
    console.log('=== Gemini API 테스트 시작 ===');
    console.log('API 키 존재:', !!GEMINI_API_KEY);
    console.log('API 키 길이:', GEMINI_API_KEY.length);

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY가 설정되지 않았습니다.'
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // 사용 가능한 모델 목록 확인
    try {
      console.log('모델 목록 조회 중...');
      const models = await genAI.listModels();
      console.log('사용 가능한 모델들:');
      models.forEach(model => {
        console.log(`- ${model.name}: ${model.displayName}`);
      });
    } catch (listError) {
      console.log('모델 목록 조회 실패:', listError);
    }

    // 간단한 텍스트 생성 테스트 - 기본 모델들 시도
    const testModels = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    for (const modelName of testModels) {
      try {
        console.log(`${modelName} 모델 테스트 중...`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName
        });

        const result = await model.generateContent("Hello, this is a test.");
        const response = await result.response;
        const text = response.text();
        
        console.log(`${modelName} 성공:`, text.substring(0, 50) + '...');
        
        return NextResponse.json({
          success: true,
          workingModel: modelName,
          testResponse: text,
          message: `${modelName} 모델이 정상적으로 작동합니다.`
        });
        
      } catch (modelError) {
        console.log(`${modelName} 실패:`, modelError.message);
        continue;
      }
    }

    return NextResponse.json({
      success: false,
      error: '모든 모델에서 오류가 발생했습니다.',
      testedModels: testModels
    });

  } catch (error) {
    console.error('=== Gemini API 테스트 오류 ===');
    console.error('에러:', error);
    console.error('========================');

    return NextResponse.json({
      success: false,
      error: `API 테스트 실패: ${error.message}`,
      details: error
    });
  }
}
