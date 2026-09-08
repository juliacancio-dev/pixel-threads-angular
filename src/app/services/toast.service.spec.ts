import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve exibir a mensagem ao chamar mostrar()', () => {
    service.mostrar('Item adicionado à cesta ✓');
    expect(service.visivel()).toBeTrue();
    expect(service.mensagem()).toBe('Item adicionado à cesta ✓');
  });

  it('deve esconder a mensagem automaticamente após o tempo definido', fakeAsync(() => {
    service.mostrar('Cupom aplicado com sucesso!');
    expect(service.visivel()).toBeTrue();

    tick(2600);
    expect(service.visivel()).toBeFalse();
  }));

  it('deve reiniciar o temporizador ao mostrar uma nova mensagem antes do anterior expirar', fakeAsync(() => {
    service.mostrar('Primeira mensagem');
    tick(1000);
    service.mostrar('Segunda mensagem');
    tick(1600);
    expect(service.visivel()).toBeTrue();
    expect(service.mensagem()).toBe('Segunda mensagem');

    tick(1000);
    expect(service.visivel()).toBeFalse();
  }));
});
