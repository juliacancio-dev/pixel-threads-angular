import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let servico: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servico = TestBed.inject(ToastService);
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve exibir a mensagem ao chamar mostrar()', () => {
    servico.mostrar('Item adicionado à cesta ✓');
    expect(servico.visivel()).toBeTrue();
    expect(servico.mensagem()).toBe('Item adicionado à cesta ✓');
  });

  it('deve esconder a mensagem automaticamente após o tempo definido', fakeAsync(() => {
    servico.mostrar('Cupom aplicado com sucesso!');
    expect(servico.visivel()).toBeTrue();

    tick(2600);
    expect(servico.visivel()).toBeFalse();
  }));

  it('deve reiniciar o temporizador ao mostrar uma nova mensagem antes do anterior expirar', fakeAsync(() => {
    servico.mostrar('Primeira mensagem');
    tick(1000);
    servico.mostrar('Segunda mensagem');
    tick(1600);
    expect(servico.visivel()).toBeTrue();
    expect(servico.mensagem()).toBe('Segunda mensagem');

    tick(1000);
    expect(servico.visivel()).toBeFalse();
  }));
});
