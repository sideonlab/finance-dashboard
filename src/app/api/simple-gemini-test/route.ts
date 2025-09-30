import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    console.log('=== 단순 Gemini API 테스트 ===');
    console.log('API 키:', API_KEY);
    
    // 직접 fetch로 API 호출 (최신 모델 사용)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello, this is a test."
          }]
        }]
      })
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('응답 내용:', responseText);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `API 호출 실패: ${response.status} ${response.statusText}`,
        details: responseText
      });
    }
    
    const data = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'API 호출 성공',
      response: data
    });
    
  } catch (error) {
    console.error('오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json({
      success: false,
      error: `오류 발생: ${errorMessage}`,
      details: error
    });
  }
}
