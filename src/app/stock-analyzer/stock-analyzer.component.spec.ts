import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAnalyzerComponent } from './stock-analyzer.component';

describe('StockAnalyzerComponent', () => {
  let component: StockAnalyzerComponent;
  let fixture: ComponentFixture<StockAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAnalyzerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
