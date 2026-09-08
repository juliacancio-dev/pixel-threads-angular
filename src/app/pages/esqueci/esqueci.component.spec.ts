import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EsqueciComponent } from './esqueci.component';

describe('EsqueciComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve ser criado', () => {
    const fixture = TestBed.createComponent(EsqueciComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve validar o campo de e-mail', () => {
    const fixture = TestBed.createComponent(EsqueciComponent);
    const component = fixture.componentInstance;

    expect(component.form.valid).toBeFalse();
    component.form.setValue({ email: 'usuario@pixelthreads.com' });
    expect(component.form.valid).toBeTrue();
  });

  it('deve resetar o formulário ao enviar com sucesso', () => {
    const fixture = TestBed.createComponent(EsqueciComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'usuario@pixelthreads.com' });
    component.enviar();
    expect(component.form.value.email).toBe('');
  });
});
