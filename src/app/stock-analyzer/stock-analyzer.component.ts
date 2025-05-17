import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { FormsModule }                         from '@angular/forms';
import { BaseChartDirective }                  from 'ng2-charts';
import { Chart, registerables, ChartDataset, ChartConfiguration } from 'chart.js';
import { ApiService, StockTickerResponse, MacdEntry, RsiEntry }    from '../services/api.service';

// register all Chart.js components
Chart.register(...registerables);

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

  constructor(private api: ApiService) {}

  ngAfterViewInit(): void {
    // Chart directive initialized
  }

  load(): void {
    this.error = '';
    this.currentTicker = '';
    this.macdChartData = { labels: [], datasets: [] };
    this.rsiChartData = { labels: [], datasets: [] };
    this.loading = true;

    const ticker = this.inputTicker.trim().toUpperCase();
    if (!ticker) {
      this.error = 'Please enter a ticker symbol.';
      this.loading = false;
      return;
    }

    this.api.getStockTicker(ticker).subscribe({
      next: (res: StockTickerResponse) => {
        this.currentTicker = ticker;
        this.buildChart(res);
        this.loading = false;
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

  private buildChart(data: StockTickerResponse): void {
    // Reverse entries to chronological order (past → future)
    const macdEntries = [...data.macd].reverse();
    const rsiEntries  = [...data.rsi].reverse();

    const labels = macdEntries.map((e: MacdEntry) =>
      new Date(e.timestamp).toLocaleDateString()
    );

    this.macdChartData = {
      labels,
      datasets: [
        {
          data: macdEntries.map(e => e.value),
          label: 'MACD',
          fill: false,
          borderWidth: 2
        } as ChartDataset<'line'>
      ]
    };

    this.rsiChartData = {
      labels,
      datasets: [
        {
          data: rsiEntries.map(e => e.value),
          label: 'RSI',
          fill: false,
          borderWidth: 2
        } as ChartDataset<'line'>
      ]
    };

    this.chart?.update();
  }
}