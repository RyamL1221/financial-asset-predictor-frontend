import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StockAnalyzerComponent } from './stock-analyzer/stock-analyzer.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'},
  { path: 'home', component: HomeComponent},
  { path: 'stock-analyzer', component: StockAnalyzerComponent},
  { path: 'register', component: RegisterComponent}
];
