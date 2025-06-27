import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { FormsModule }                         from '@angular/forms';
import { BaseChartDirective }                  from 'ng2-charts';
import { Chart, registerables, ChartDataset, ChartConfiguration } from 'chart.js';
import { ApiService, StockTickerResponse, MacdEntry, RsiEntry, BetaEntry, BollingerBandsEntry, EpsData }    from '../services/api.service';
import { RecommendationScale, CurrentRecommendation, TechnicalAnalysis, STATIC_RECOMMENDATION_SCALE } from '../types/recommendation-scale.types';

// register all Chart.js components
Chart.register(...registerables);

type RecommendationType = 'BUY' | 'SELL' | 'HOLD' | 'UNDERPERFORM' | 'OUTPERFORM';

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
  currentRecommendation: CurrentRecommendation | null = null;
  recommendationScale: RecommendationScale[] = [];
  technicalAnalysis: TechnicalAnalysis | null = null;
  epsAnalysis: { current: number; growth_percentage: number } | null = null;

  // Static recommendation scale for display before API call
  staticRecommendationScale: RecommendationScale[] = STATIC_RECOMMENDATION_SCALE;

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
    this.currentRecommendation = null;
    this.recommendationScale = [];
    this.technicalAnalysis = null;
    this.epsAnalysis = null;
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
        this.companyName = res.profile.name || '';
        this.country = res.profile.country || '';
        this.shareOutstanding = res.profile.shareOutstanding ?? null;
        this.weburl = res.profile.weburl || '';
        this.roic = res.roic ?? null;
        this.ey = res.ey ?? null;
        this.epsData = res.eps || null;
        this.currentTicker = ticker;
        
        // Set analysis data from backend
        this.currentRecommendation = res.analysis.current_recommendation;
        this.recommendationScale = res.analysis.recommendation_scale;
        this.technicalAnalysis = res.analysis.technical_analysis;
        this.epsAnalysis = res.analysis.eps_analysis;
        
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

  getCurrentEps(): number | null {
    return this.epsAnalysis?.current ?? null;
  }

  getEpsGrowth(): number | null {
    return this.epsAnalysis?.growth_percentage ?? null;
  }

  formatPercentage(value: number | null): string {
    if (value === null || value === undefined) return '—';
    // If the value is already a percentage (like EPS growth), return as is
    if (Math.abs(value) > 1) {
      return `${value.toFixed(2)}%`;
    }
    // If the value is a decimal (like ROIC, EY), convert to percentage
    return `${(value * 100).toFixed(2)}%`;
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString();
  }

  getRecommendationScale(type: string): RecommendationScale | undefined {
    return this.recommendationScale.find(scale => scale.type === type);
  }

  getRecommendationColor(type: string): string {
    const scale = this.getRecommendationScale(type);
    return scale?.color || '#4a5568';
  }

  getRecommendationBackground(type: string): string {
    const scale = this.getRecommendationScale(type);
    return scale?.background_color || '#f7fafc';
  }

  getMacdRecommendation(): string | null {
    return this.technicalAnalysis?.macd_recommendation ?? null;
  }

  getRsiRecommendation(): string | null {
    return this.technicalAnalysis?.rsi_recommendation ?? null;
  }

  getBollingerRecommendation(): string | null {
    return this.technicalAnalysis?.bollinger_recommendation ?? null;
  }

  getMacdAnalysis(): string {
    return this.technicalAnalysis?.macd_analysis ?? '';
  }

  getRsiAnalysis(): string {
    return this.technicalAnalysis?.rsi_analysis ?? '';
  }

  getBollingerAnalysis(): string {
    return this.technicalAnalysis?.bollinger_analysis ?? '';
  }
}