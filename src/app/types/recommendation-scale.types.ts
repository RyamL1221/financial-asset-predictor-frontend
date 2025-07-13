export interface RecommendationScale {
  type: string;
  name: string;
  alias: string;
  description: string;
  expected_return: string;
  risk_level: string;
  time_horizon: string;
  color: string;
  background_color: string;
}

export interface CurrentRecommendation {
  confidence: number;
  date: string;
  description: string;
  reasoning: string[];
  technical_factors: string[];
  type: string;
}

export interface OverallRecommendation {
  confidence: number;
  description: string;
  reasoning: string[];
  recommendation_type: string;
  technical_factors: string[];
}

export interface EpsAnalysis {
  current: number;
  growth_percentage: number;
}

export interface TechnicalAnalysis {
  bollinger_analysis: string;
  bollinger_recommendation: string;
  macd_analysis: string;
  macd_recommendation: string;
  rsi_analysis: string;
  rsi_recommendation: string;
}

export interface AnalysisData {
  eps_analysis: EpsAnalysis;
  macd_signals: CurrentRecommendation[];
  overall_recommendation: OverallRecommendation;
  recommendation_scale: RecommendationScale[];
  technical_analysis: TechnicalAnalysis;
}

// Static recommendation scale for display before API call
export const STATIC_RECOMMENDATION_SCALE: RecommendationScale[] = [
  {
    type: 'BUY',
    name: 'Buy',
    alias: 'Strong Buy / On the Recommended List',
    description: 'A recommendation to purchase a specific security. Also known as strong buy and "on the recommended list."',
    expected_return: '15%+ above market',
    risk_level: 'Low to Medium',
    time_horizon: '3-12 months',
    color: '#48BB78',
    background_color: '#C6F6D5'
  },
  {
    type: 'OUTPERFORM',
    name: 'Outperform',
    alias: 'Moderate Buy / Accumulate / Overweight',
    description: 'A stock is expected to do slightly better than the market return. Also known as "moderate buy," "accumulate," and "overweight."',
    expected_return: '5-15% above market',
    risk_level: 'Medium',
    time_horizon: '3-6 months',
    color: '#4299E1',
    background_color: '#BEE3F8'
  },
  {
    type: 'HOLD',
    name: 'Hold',
    alias: 'Neutral / Market-perform',
    description: 'A company with a hold recommendation is expected to perform at the same pace as comparable companies or in line with the market.',
    expected_return: 'Market performance',
    risk_level: 'Medium',
    time_horizon: '1-6 months',
    color: '#ECC94B',
    background_color: '#FEF3C7'
  },
  {
    type: 'UNDERPERFORM',
    name: 'Underperform',
    alias: 'Moderate Sell / Weak Hold / Underweight',
    description: 'A stock is expected to do slightly worse than the overall stock market return. Also known as "moderate sell," "weak hold," and "underweight."',
    expected_return: '5-15% below market',
    risk_level: 'Medium',
    time_horizon: '1-6 months',
    color: '#ED8936',
    background_color: '#FEEBC8'
  },
  {
    type: 'SELL',
    name: 'Sell',
    alias: 'Strong Sell',
    description: 'A recommendation to sell a security or to liquidate an asset. Also known as strong sell.',
    expected_return: '15%+ below market',
    risk_level: 'Medium to High',
    time_horizon: '1-3 months',
    color: '#F56565',
    background_color: '#FED7D7'
  }
]; 