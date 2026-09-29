import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado', () => {
    const montagem = TestBed.createComponent(HeaderComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });

  it('deve alternar o menu ao chamar alternarMenu()', () => {
    const montagem = TestBed.createComponent(HeaderComponent);
    const componente = montagem.componentInstance;

    expect(componente.menuAberto).toBeFalse();
    componente.alternarMenu();
    expect(componente.menuAberto).toBeTrue();
    componente.alternarMenu();
    expect(componente.menuAberto).toBeFalse();
  });
});
