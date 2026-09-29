import { TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    }).compileComponents();
  });

  it('deve ser criado', () => {
    const montagem = TestBed.createComponent(ToastComponent);
    expect(montagem.componentInstance).toBeTruthy();
  });
});
