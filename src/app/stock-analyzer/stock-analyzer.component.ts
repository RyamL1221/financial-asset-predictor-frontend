import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { FormsModule }                         from '@angular/forms';
import { BaseChartDirective }                  from 'ng2-charts';
import { Chart, registerables, ChartDataset, ChartConfiguration } from 'chart.js';
import { ApiService, StockTickerResponse, MacdEntry, RsiEntry, BetaEntry, BollingerBandsEntry, EpsData }    from '../services/api.service';

// register all Chart.js components
Chart.register(...registerables);

type RecommendationType = 'BUY' | 'SELL' | 'HOLD' | 'UNDERPERFORM' | 'OUTPERFORM';

interface RecommendationScale {
  type: RecommendationType;
  name: string;
  alias: string;
  description: string;
  expectedReturn: string;
  riskLevel: string;
  timeHorizon: string;
  color: string;
  backgroundColor: string;
}

interface MacdSignal {
  date: string;
  type: RecommendationType;
  description: string;
  confidence: number; // 0-100
  reasoning: string[];
  technicalFactors: string[];
}

@Component({
  selector: 'app-stock-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './stock-analyzer.component.html',
  styleUrls: ['./stock-analyzer.component.css']
})
export class StockAnalyzerComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  inputTicker:   string = '';
  currentTicker: string = '';
  error:         string = '';
  loading:       boolean = false;
  
  companyName:        string = '';
  country:            string = '';
  shareOutstanding:   number | null = null;
  weburl:             string = '';
  roic:               number | null = null;
  ey:                 number | null = null;
  epsData:            EpsData | null = null;
  macdSignals:        MacdSignal[] = [];
  currentRecommendation: MacdSignal | null = null;

  // 5-Point Recommendation Scale Definition
  recommendationScale: RecommendationScale[] = [
    {
      type: 'BUY',
      name: 'Buy',
      alias: 'Strong Buy / On the Recommended List',
      description: 'A recommendation to purchase a specific security. Also known as strong buy and "on the recommended list."',
      expectedReturn: '15%+ above market',
      riskLevel: 'Low to Medium',
      timeHorizon: '3-12 months',
      color: '#22543d',
      backgroundColor: '#c6f6d5'
    },
    {
      type: 'OUTPERFORM',
      name: 'Outperform',
      alias: 'Moderate Buy / Accumulate / Overweight',
      description: 'A stock is expected to do slightly better than the market return. Also known as "moderate buy," "accumulate," and "overweight."',
      expectedReturn: '5-15% above market',
      riskLevel: 'Medium',
      timeHorizon: '3-6 months',
      color: '#38a169',
      backgroundColor: '#9ae6b4'
    },
    {
      type: 'HOLD',
      name: 'Hold',
      alias: 'Neutral / Market-perform',
      description: 'A company with a hold recommendation is expected to perform at the same pace as comparable companies or in line with the market.',
      expectedReturn: 'Market performance',
      riskLevel: 'Medium',
      timeHorizon: '1-6 months',
      color: '#4a5568',
      backgroundColor: '#f7fafc'
    },
    {
      type: 'UNDERPERFORM',
      name: 'Underperform',
      alias: 'Moderate Sell / Weak Hold / Underweight',
      description: 'A stock is expected to do slightly worse than the overall stock market return. Also known as "moderate sell," "weak hold," and "underweight."',
      expectedReturn: '5-15% below market',
      riskLevel: 'Medium',
      timeHorizon: '1-6 months',
      color: '#ed8936',
      backgroundColor: '#fffaf0'
    },
    {
      type: 'SELL',
      name: 'Sell',
      alias: 'Strong Sell',
      description: 'A recommendation to sell a security or to liquidate an asset. Also known as strong sell.',
      expectedReturn: '15%+ below market',
      riskLevel: 'Medium to High',
      timeHorizon: '1-3 months',
      color: '#e53e3e',
      backgroundColor: '#fed7d7'
    }
  ];

  // Technical Indicator Recommendations
  rsiRecommendation: RecommendationType | null = null;
  bollingerRecommendation: RecommendationType | null = null;
  macdRecommendation: RecommendationType | null = null;
  rsiAnalysis: string = '';
  bollingerAnalysis: string = '';
  macdAnalysis: string = '';

  chartType: 'line' = 'line';

  public macdChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public macdChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'MACD Value' } }
    }
  };

  public rsiChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public rsiChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'RSI Value' }, min: 0, max: 100 }
    }
  };

  public betaChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public betaChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Beta Value' } }
    }
  };

  public bollingerBandsChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public bollingerBandsChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Price' } }
    }
  };

  constructor(private api: ApiService) {}

  ngAfterViewInit(): void {
    // Chart directive initialized
  }

  load(): void {
    this.error = '';
    this.currentTicker = '';
    this.companyName = '';
    this.country = '';
    this.shareOutstanding = null;
    this.weburl = '';
    this.roic = null;
    this.ey = null;
    this.epsData = null;
    this.macdSignals = [];
    this.currentRecommendation = null;
    this.rsiRecommendation = null;
    this.bollingerRecommendation = null;
    this.macdRecommendation = null;
    this.rsiAnalysis = '';
    this.bollingerAnalysis = '';
    this.macdAnalysis = '';
    this.macdChartData = { labels: [], datasets: [] };
    this.rsiChartData = { labels: [], datasets: [] };
    this.betaChartData = { labels: [], datasets: [] };
    this.bollingerBandsChartData = { labels: [], datasets: [] };
    this.loading = true;

    const ticker = this.inputTicker.trim().toUpperCase();
    if (!ticker) {
      this.error = 'Please enter a ticker symbol.';
      this.loading = false;
      return;
    }

    this.api.getStockTicker(ticker).subscribe({
      next: (res: StockTickerResponse) => {
        this.companyName      = res.name || '';
        this.country          = res.country || '';
        this.shareOutstanding = res.shareOutstanding ?? null;
        this.weburl           = res.weburl || '';
        this.roic             = res.roic ?? null;
        this.ey               = res.ey ?? null;
        this.epsData          = res.eps || null;
        this.currentTicker = ticker;
        this.buildCharts(res);
        this.loading = false;
        this.inputTicker = ''; // Clear the form after successful request
      },
      error: (err) => {
        if (err.status === 404) {
          this.error = `Ticker "${ticker}" not found.`;
        } else {
          this.error = err.error?.error || `Error ${err.status}: ${err.message}`;
        }
        this.loading = false;
      }
    });
  }

  private buildCharts(data: StockTickerResponse): void {
    // Reverse entries to chronological order (past → future)
    const macdEntries = [...data.macd].reverse();
    const rsiEntries  = [...data.rsi].reverse();
    const betaEntries = [...data.beta].reverse();
    const bollingerEntries = [...data.bollinger_bands].reverse();

    const macdLabels = macdEntries.map((e: MacdEntry) =>
      new Date(e.timestamp).toLocaleDateString()
    );

    const rsiLabels = rsiEntries.map((e: RsiEntry) =>
      new Date(e.timestamp).toLocaleDateString()
    );

    const betaLabels = betaEntries.map((e: BetaEntry) =>
      new Date(e.datetime).toLocaleDateString()
    );

    const bollingerLabels = bollingerEntries.map((e: BollingerBandsEntry) =>
      new Date(e.datetime).toLocaleDateString()
    );

    // Analyze MACD signals and generate current recommendation
    this.analyzeMacdSignals(macdEntries, macdLabels);
    this.generateCurrentRecommendation(macdEntries, rsiEntries);
    this.analyzeTechnicalIndicators(macdEntries, rsiEntries, bollingerEntries);

    // MACD Chart
    this.macdChartData = {
      labels: macdLabels,
      datasets: [
        {
          data: macdEntries.map(e => e.value),
          label: 'MACD',
          fill: false,
          borderWidth: 2,
          borderColor: '#3182ce'
        } as ChartDataset<'line'>,
        {
          data: macdEntries.map(e => e.signal),
          label: 'Signal',
          fill: false,
          borderWidth: 2,
          borderColor: '#e53e3e'
        } as ChartDataset<'line'>,
        {
          data: macdEntries.map(e => e.histogram),
          label: 'Histogram',
          fill: false,
          borderWidth: 2,
          borderColor: '#38a169'
        } as ChartDataset<'line'>
      ]
    };

    // RSI Chart
    this.rsiChartData = {
      labels: rsiLabels,
      datasets: [
        {
          data: rsiEntries.map(e => e.value),
          label: 'RSI',
          fill: false,
          borderWidth: 2,
          borderColor: '#3182ce'
        } as ChartDataset<'line'>,
        {
          data: Array(rsiLabels.length).fill(70),
          label: 'Overbought (70)',
          fill: false,
          borderWidth: 1,
          borderColor: '#e53e3e',
          borderDash: [5, 5]
        } as ChartDataset<'line'>,
        {
          data: Array(rsiLabels.length).fill(30),
          label: 'Oversold (30)',
          fill: false,
          borderWidth: 1,
          borderColor: '#38a169',
          borderDash: [5, 5]
        } as ChartDataset<'line'>
      ]
    };

    // Beta Chart
    this.betaChartData = {
      labels: betaLabels,
      datasets: [
        {
          data: betaEntries.map(e => parseFloat(e.beta)),
          label: 'Beta',
          fill: false,
          borderWidth: 2,
          borderColor: '#3182ce'
        } as ChartDataset<'line'>,
        {
          data: Array(betaLabels.length).fill(1),
          label: 'Market Beta (1.0)',
          fill: false,
          borderWidth: 1,
          borderColor: '#e53e3e',
          borderDash: [5, 5]
        } as ChartDataset<'line'>
      ]
    };

    // Bollinger Bands Chart
    this.bollingerBandsChartData = {
      labels: bollingerLabels,
      datasets: [
        {
          data: bollingerEntries.map(e => parseFloat(e.upper_band)),
          label: 'Upper Band',
          fill: false,
          borderWidth: 2,
          borderColor: '#e53e3e'
        } as ChartDataset<'line'>,
        {
          data: bollingerEntries.map(e => parseFloat(e.middle_band)),
          label: 'Middle Band (SMA)',
          fill: false,
          borderWidth: 2,
          borderColor: '#3182ce'
        } as ChartDataset<'line'>,
        {
          data: bollingerEntries.map(e => parseFloat(e.lower_band)),
          label: 'Lower Band',
          fill: false,
          borderWidth: 2,
          borderColor: '#38a169'
        } as ChartDataset<'line'>
      ]
    };

    this.chart?.update();
  }

  private analyzeMacdSignals(macdEntries: MacdEntry[], labels: string[]): void {
    this.macdSignals = [];
    
    for (let i = 1; i < macdEntries.length; i++) {
      const current = macdEntries[i];
      const previous = macdEntries[i - 1];
      
      // Check for MACD line crossing above signal line (BUY signals)
      if (previous.value <= previous.signal && current.value > current.signal) {
        const signalType = this.determineBuySignalStrength(current, previous);
        const confidence = this.calculateConfidence(current, 'BUY');
        const reasoning = this.generateReasoning(current, 'BUY');
        const technicalFactors = this.getTechnicalFactors(current, 'BUY');
        
        this.macdSignals.push({
          date: labels[i],
          type: signalType,
          description: this.getSignalDescription(signalType),
          confidence,
          reasoning,
          technicalFactors
        });
      }
      
      // Check for MACD line crossing below signal line (SELL signals)
      if (previous.value >= previous.signal && current.value < current.signal) {
        const signalType = this.determineSellSignalStrength(current, previous);
        const confidence = this.calculateConfidence(current, 'SELL');
        const reasoning = this.generateReasoning(current, 'SELL');
        const technicalFactors = this.getTechnicalFactors(current, 'SELL');
        
        this.macdSignals.push({
          date: labels[i],
          type: signalType,
          description: this.getSignalDescription(signalType),
          confidence,
          reasoning,
          technicalFactors
        });
      }
    }
    
    // Keep only the most recent signals (last 5)
    this.macdSignals = this.macdSignals.slice(-5);
  }

  private generateCurrentRecommendation(macdEntries: MacdEntry[], rsiEntries: RsiEntry[]): void {
    if (macdEntries.length === 0) return;
    
    const latestMacd = macdEntries[macdEntries.length - 1];
    const latestRsi = rsiEntries.length > 0 ? rsiEntries[rsiEntries.length - 1] : null;
    
    let recommendation: RecommendationType = 'HOLD';
    let confidence = 50;
    const reasoning: string[] = [];
    const technicalFactors: string[] = [];
    
    // MACD Analysis
    const macdValue = latestMacd.value;
    const signalValue = latestMacd.signal;
    const histogram = latestMacd.histogram;
    
    if (macdValue > signalValue) {
      // MACD is above signal line (bullish)
      if (histogram > 0.3) {
        recommendation = 'BUY';
        confidence = 85;
        reasoning.push('MACD line significantly above signal line');
        reasoning.push('Strong positive histogram momentum');
        technicalFactors.push('Strong MACD bullish crossover');
      } else if (histogram > 0.1) {
        recommendation = 'OUTPERFORM';
        confidence = 70;
        reasoning.push('MACD line above signal line');
        reasoning.push('Positive histogram momentum');
        technicalFactors.push('MACD bullish crossover');
      } else {
        recommendation = 'OUTPERFORM';
        confidence = 60;
        reasoning.push('MACD line above signal line');
        reasoning.push('Declining histogram momentum');
        technicalFactors.push('Weak MACD bullish signal');
      }
    } else if (macdValue < signalValue) {
      // MACD is below signal line (bearish)
      if (histogram < -0.3) {
        recommendation = 'SELL';
        confidence = 85;
        reasoning.push('MACD line significantly below signal line');
        reasoning.push('Strong negative histogram momentum');
        technicalFactors.push('Strong MACD bearish crossover');
      } else if (histogram < -0.1) {
        recommendation = 'UNDERPERFORM';
        confidence = 70;
        reasoning.push('MACD line below signal line');
        reasoning.push('Negative histogram momentum');
        technicalFactors.push('MACD bearish crossover');
      } else {
        recommendation = 'UNDERPERFORM';
        confidence = 60;
        reasoning.push('MACD line below signal line');
        reasoning.push('Improving histogram momentum');
        technicalFactors.push('Weak MACD bearish signal');
      }
    } else {
      // MACD equals signal line
      recommendation = 'HOLD';
      confidence = 50;
      reasoning.push('MACD line at signal line');
      reasoning.push('Neutral momentum');
      technicalFactors.push('MACD neutral position');
    }
    
    // RSI Confirmation
    if (latestRsi) {
      const rsiValue = latestRsi.value;
      if (rsiValue < 30 && (recommendation === 'OUTPERFORM')) {
        recommendation = 'BUY';
        confidence += 10;
        reasoning.push('RSI indicates oversold conditions');
        technicalFactors.push('RSI oversold confirmation');
      } else if (rsiValue > 70 && (recommendation === 'UNDERPERFORM')) {
        recommendation = 'SELL';
        confidence += 10;
        reasoning.push('RSI indicates overbought conditions');
        technicalFactors.push('RSI overbought confirmation');
      } else if (rsiValue < 40 && recommendation === 'OUTPERFORM') {
        recommendation = 'OUTPERFORM';
        confidence += 5;
        reasoning.push('RSI showing oversold tendencies');
        technicalFactors.push('RSI oversold tendency');
      } else if (rsiValue > 60 && recommendation === 'OUTPERFORM') {
        recommendation = 'OUTPERFORM';
        confidence += 5;
        reasoning.push('RSI showing overbought tendencies');
        technicalFactors.push('RSI overbought tendency');
      }
    }
    
    confidence = Math.min(confidence, 95); // Cap at 95%
    
    this.currentRecommendation = {
      date: new Date().toLocaleDateString(),
      type: recommendation,
      description: this.getSignalDescription(recommendation),
      confidence,
      reasoning,
      technicalFactors
    };
  }

  private determineBuySignalStrength(current: MacdEntry, previous: MacdEntry): RecommendationType {
    const histogram = current.histogram;
    const histogramChange = current.histogram - previous.histogram;
    
    if (histogram > 0.3 && histogramChange > 0.1) {
      return 'BUY';
    } else if (histogram > 0.1) {
      return 'OUTPERFORM';
    } else {
      return 'OUTPERFORM';
    }
  }

  private determineSellSignalStrength(current: MacdEntry, previous: MacdEntry): RecommendationType {
    const histogram = current.histogram;
    const histogramChange = current.histogram - previous.histogram;
    
    if (histogram < -0.3 && histogramChange < -0.1) {
      return 'SELL';
    } else if (histogram < -0.1) {
      return 'UNDERPERFORM';
    } else {
      return 'UNDERPERFORM';
    }
  }

  private calculateConfidence(entry: MacdEntry, signalType: 'BUY' | 'SELL'): number {
    const absHistogram = Math.abs(entry.histogram);
    const baseConfidence = Math.min(absHistogram * 100, 80);
    
    if (signalType === 'BUY' && entry.histogram > 0.2) {
      return Math.min(baseConfidence + 15, 95);
    } else if (signalType === 'SELL' && entry.histogram < -0.2) {
      return Math.min(baseConfidence + 15, 95);
    }
    
    return Math.max(baseConfidence, 50);
  }

  private generateReasoning(entry: MacdEntry, signalType: 'BUY' | 'SELL'): string[] {
    const reasoning: string[] = [];
    
    if (signalType === 'BUY') {
      reasoning.push('MACD line crossed above signal line');
      if (entry.histogram > 0.2) {
        reasoning.push('Strong positive histogram momentum');
      } else if (entry.histogram > 0) {
        reasoning.push('Positive histogram momentum');
      } else {
        reasoning.push('Declining histogram momentum');
      }
    } else {
      reasoning.push('MACD line crossed below signal line');
      if (entry.histogram < -0.2) {
        reasoning.push('Strong negative histogram momentum');
      } else if (entry.histogram < 0) {
        reasoning.push('Negative histogram momentum');
      } else {
        reasoning.push('Improving histogram momentum');
      }
    }
    
    return reasoning;
  }

  private getTechnicalFactors(entry: MacdEntry, signalType: 'BUY' | 'SELL'): string[] {
    const factors: string[] = [];
    
    if (signalType === 'BUY') {
      if (entry.histogram > 0.3) {
        factors.push('Strong MACD momentum');
        factors.push('Bullish histogram pattern');
      } else if (entry.histogram > 0.1) {
        factors.push('Positive MACD momentum');
        factors.push('Bullish signal line crossover');
      } else {
        factors.push('Weak MACD momentum');
        factors.push('Cautious bullish signal');
      }
    } else {
      if (entry.histogram < -0.3) {
        factors.push('Strong bearish momentum');
        factors.push('Bearish histogram pattern');
      } else if (entry.histogram < -0.1) {
        factors.push('Negative MACD momentum');
        factors.push('Bearish signal line crossover');
      } else {
        factors.push('Weak bearish momentum');
        factors.push('Cautious bearish signal');
      }
    }
    
    return factors;
  }

  private getSignalDescription(type: RecommendationType): string {
    const scale = this.recommendationScale.find(s => s.type === type);
    return scale ? scale.description : 'Neutral position';
  }

  getCurrentEps(): number | null {
    if (!this.epsData?.current) return null;
    return this.epsData.current['0y']; // Current year EPS
  }

  getEpsGrowth(): number | null {
    if (!this.epsData?.current) return null;
    const current = this.epsData.current['0y'];
    const nextYear = this.epsData.current['+1y'];
    if (current === 0) return null;
    return ((nextYear - current) / current) * 100;
  }

  formatPercentage(value: number | null): string {
    if (value === null) return '—';
    return `${value.toFixed(2)}%`;
  }

  formatNumber(value: number | null): string {
    if (value === null) return '—';
    return value.toFixed(4);
  }

  getRecommendationScale(type: RecommendationType): RecommendationScale | undefined {
    return this.recommendationScale.find(s => s.type === type);
  }

  getRecommendationColor(type: RecommendationType): string {
    const scale = this.getRecommendationScale(type);
    return scale ? scale.color : '#4a5568';
  }

  getRecommendationBackground(type: RecommendationType): string {
    const scale = this.getRecommendationScale(type);
    return scale ? scale.backgroundColor : '#f7fafc';
  }

  private analyzeTechnicalIndicators(macdEntries: MacdEntry[], rsiEntries: RsiEntry[], bollingerEntries: BollingerBandsEntry[]): void {
    // MACD Analysis
    if (macdEntries.length > 0) {
      const latestMacd = macdEntries[macdEntries.length - 1];
      const macdValue = latestMacd.value;
      const signalValue = latestMacd.signal;
      const histogram = latestMacd.histogram;
      
      if (macdValue > signalValue) {
        // MACD is above signal line (bullish)
        if (histogram > 0.3) {
          this.macdRecommendation = 'BUY';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is significantly above signal line at ${signalValue.toFixed(4)} with strong positive histogram momentum (${histogram.toFixed(4)}). This indicates strong bullish momentum.`;
        } else if (histogram > 0.1) {
          this.macdRecommendation = 'OUTPERFORM';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is above signal line at ${signalValue.toFixed(4)} with positive histogram momentum (${histogram.toFixed(4)}). This indicates bullish momentum.`;
        } else {
          this.macdRecommendation = 'OUTPERFORM';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is above signal line at ${signalValue.toFixed(4)} but with declining histogram momentum (${histogram.toFixed(4)}). This indicates weak bullish momentum.`;
        }
      } else if (macdValue < signalValue) {
        // MACD is below signal line (bearish)
        if (histogram < -0.3) {
          this.macdRecommendation = 'SELL';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is significantly below signal line at ${signalValue.toFixed(4)} with strong negative histogram momentum (${histogram.toFixed(4)}). This indicates strong bearish momentum.`;
        } else if (histogram < -0.1) {
          this.macdRecommendation = 'UNDERPERFORM';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is below signal line at ${signalValue.toFixed(4)} with negative histogram momentum (${histogram.toFixed(4)}). This indicates bearish momentum.`;
        } else {
          this.macdRecommendation = 'UNDERPERFORM';
          this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is below signal line at ${signalValue.toFixed(4)} but with improving histogram momentum (${histogram.toFixed(4)}). This indicates weak bearish momentum.`;
        }
      } else {
        // MACD equals signal line
        this.macdRecommendation = 'HOLD';
        this.macdAnalysis = `MACD line at ${macdValue.toFixed(4)} is at signal line at ${signalValue.toFixed(4)} with neutral histogram (${histogram.toFixed(4)}). This indicates neutral momentum.`;
      }
    }
    
    // RSI Analysis
    if (rsiEntries.length > 0) {
      const latestRsi = rsiEntries[rsiEntries.length - 1];
      const rsiValue = latestRsi.value;
      
      if (rsiValue < 30) {
        this.rsiRecommendation = 'BUY';
        this.rsiAnalysis = `RSI at ${rsiValue.toFixed(2)} indicates oversold conditions. This suggests the stock may be undervalued and could be a good buying opportunity.`;
      } else if (rsiValue < 40) {
        this.rsiRecommendation = 'OUTPERFORM';
        this.rsiAnalysis = `RSI at ${rsiValue.toFixed(2)} shows oversold tendencies. The stock may be approaching a buying opportunity.`;
      } else if (rsiValue > 70) {
        this.rsiRecommendation = 'SELL';
        this.rsiAnalysis = `RSI at ${rsiValue.toFixed(2)} indicates overbought conditions. This suggests the stock may be overvalued and could be due for a correction.`;
      } else if (rsiValue > 60) {
        this.rsiRecommendation = 'UNDERPERFORM';
        this.rsiAnalysis = `RSI at ${rsiValue.toFixed(2)} shows overbought tendencies. The stock may be approaching resistance levels.`;
      } else {
        this.rsiRecommendation = 'HOLD';
        this.rsiAnalysis = `RSI at ${rsiValue.toFixed(2)} is in neutral territory (40-60). No strong buy or sell signals from RSI at this time.`;
      }
    }
    
    // Bollinger Bands Analysis
    if (bollingerEntries.length > 0) {
      const latestBollinger = bollingerEntries[bollingerEntries.length - 1];
      const upperBand = parseFloat(latestBollinger.upper_band);
      const middleBand = parseFloat(latestBollinger.middle_band);
      const lowerBand = parseFloat(latestBollinger.lower_band);
      
      // We need price data to determine position relative to bands
      // For now, we'll analyze the band width and volatility
      const bandWidth = upperBand - lowerBand;
      const averageBandWidth = (upperBand + lowerBand) / 2;
      const volatilityRatio = bandWidth / averageBandWidth;
      
      if (volatilityRatio > 0.1) {
        this.bollingerRecommendation = 'HOLD';
        this.bollingerAnalysis = `Bollinger Bands show high volatility (${(volatilityRatio * 100).toFixed(1)}% band width). This suggests increased market uncertainty. Consider waiting for clearer signals.`;
      } else if (volatilityRatio < 0.05) {
        this.bollingerRecommendation = 'OUTPERFORM';
        this.bollingerAnalysis = `Bollinger Bands show low volatility (${(volatilityRatio * 100).toFixed(1)}% band width). This suggests a potential breakout may be imminent.`;
      } else {
        this.bollingerRecommendation = 'HOLD';
        this.bollingerAnalysis = `Bollinger Bands show normal volatility (${(volatilityRatio * 100).toFixed(1)}% band width). No significant breakout signals at this time.`;
      }
    }
  }
}