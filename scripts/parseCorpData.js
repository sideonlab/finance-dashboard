const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

async function parseCorpXML() {
  try {
    // XML 파일 읽기
    const xmlData = fs.readFileSync(path.join(__dirname, '../corp.xml'), 'utf8');
    
    // XML을 JSON으로 파싱
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    
    // 회사 데이터 추출
    const companies = result.result.list.map(company => ({
      corp_code: company.corp_code[0],
      corp_name: company.corp_name[0],
      corp_eng_name: company.corp_eng_name[0] || '',
      stock_code: company.stock_code[0] || '',
      modify_date: company.modify_date[0]
    }));
    
    // JSON 파일로 저장
    const outputPath = path.join(__dirname, '../public/data/companies.json');
    
    // data 디렉토리가 없으면 생성
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(companies, null, 2), 'utf8');
    
    console.log(`✅ 성공적으로 ${companies.length}개의 회사 데이터를 파싱했습니다.`);
    console.log(`📁 파일 위치: ${outputPath}`);
    
    // 샘플 데이터 출력
    console.log('\n📋 샘플 데이터:');
    console.log(JSON.stringify(companies.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('❌ XML 파싱 중 오류 발생:', error);
  }
}

parseCorpXML();
