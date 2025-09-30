export interface Company {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

export interface SearchResponse {
  success: boolean;
  data: Company[];
  total: number;
  query: string;
  error?: string;
}
