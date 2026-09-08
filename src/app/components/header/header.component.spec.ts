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
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve alternar o menu ao chamar toggleMenu()', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;

    expect(component.menuAberto).toBeFalse();
    component.toggleMenu();
    expect(component.menuAberto).toBeTrue();
    component.toggleMenu();
    expect(component.menuAberto).toBeFalse();
  });
});
