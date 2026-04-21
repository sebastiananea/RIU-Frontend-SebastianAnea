import { Routes } from '@angular/router';
import { HeroListComponent } from './heroes/hero-list/hero-list.component';
import { HeroFormComponent } from './heroes/hero-form/hero-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { path: 'heroes', component: HeroListComponent },
  { path: 'heroes/new', component: HeroFormComponent },
  { path: 'heroes/edit/:id', component: HeroFormComponent },
  { path: '**', redirectTo: 'heroes' },
];
