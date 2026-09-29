import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve criar a aplicação', () => {
    const montagem = TestBed.createComponent(AppComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });

  it(`deve ter o título 'pixel-threads-angular'`, () => {
    const montagem = TestBed.createComponent(AppComponent);
    expect(montagem.componentInstance.titulo).toBe('pixel-threads-angular');
  });
});
