import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CuponsComponent } from './cupons.component';
import { URL_API } from '../../services/produto.service';

describe('CuponsComponent', () => {
  let http: HttpTestingController;

  async function abrir(cupons: unknown[] = [{ codigo: 'PIXEL10', percentual: 10, ativo: true }]) {
    const montagem = TestBed.createComponent(CuponsComponent);
    montagem.detectChanges(); // ngOnInit
    http.expectOne(`${URL_API}/cupons`).flush(cupons);
    await montagem.whenStable();
    montagem.detectChanges();
    return montagem;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuponsComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  it('deve listar os cupons da API', async () => {
    const montagem = await abrir([
      { codigo: 'PIXEL10', percentual: 10, ativo: true },
      { codigo: 'VELHO', percentual: 5, ativo: false }
    ]);

    expect(montagem.componentInstance.cupons().length).toBe(2);
    const texto = montagem.nativeElement.textContent;
    expect(texto).toContain('PIXEL10');
    expect(texto).toContain('Desativado');
  });

  it('deve mostrar aviso quando a API estiver fora do ar', async () => {
    spyOn(console, 'error');
    const montagem = TestBed.createComponent(CuponsComponent);
    montagem.detectChanges();
    http.expectOne(`${URL_API}/cupons`).flush({}, { status: 0, statusText: 'Unknown Error' });
    await montagem.whenStable();
    montagem.detectChanges();

    expect(montagem.componentInstance.erroAoCarregar()).toBeTrue();
    expect(montagem.nativeElement.textContent).toContain('A API está rodando?');
  });

  it('não deve criar com código ou desconto inválidos', async () => {
    const componente = (await abrir()).componentInstance;
    componente.formulario.setValue({ codigo: 'a b', percentual: 150 });

    await componente.criar();

    http.expectNone(`${URL_API}/cupons`);
    expect(componente.cupons().length).toBe(1);
  });

  it('deve criar o cupom na API, colocar na lista em ordem e limpar o formulário', async () => {
    const componente = (await abrir()).componentInstance;
    componente.formulario.setValue({ codigo: 'blackfriday', percentual: 25 });

    const criando = componente.criar();
    const requisicao = http.expectOne(`${URL_API}/cupons`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({ codigo: 'blackfriday', percentual: 25 });
    requisicao.flush({ codigo: 'BLACKFRIDAY', percentual: 25, ativo: true });
    await criando;

    expect(componente.cupons().map(c => c.codigo)).toEqual(['BLACKFRIDAY', 'PIXEL10']);
    expect(componente.formulario.value.codigo).toBe('');
    expect(componente.salvando).toBeFalse();
  });

  it('deve avisar e não duplicar quando o código já existe (409)', async () => {
    const componente = (await abrir()).componentInstance;
    componente.formulario.setValue({ codigo: 'PIXEL10', percentual: 20 });

    const criando = componente.criar();
    http.expectOne(`${URL_API}/cupons`).flush({ erro: 'Já existe' }, { status: 409, statusText: 'Conflict' });
    await criando;

    expect(componente.cupons().length).toBe(1);
    expect(componente.salvando).toBeFalse();
  });

  it('deve ativar e desativar um cupom', async () => {
    const componente = (await abrir()).componentInstance;

    const alternando = componente.alternarAtivo(componente.cupons()[0]);
    const requisicao = http.expectOne(`${URL_API}/cupons/PIXEL10`);
    expect(requisicao.request.method).toBe('PUT');
    expect(requisicao.request.body).toEqual({ ativo: false });
    requisicao.flush({ codigo: 'PIXEL10', percentual: 10, ativo: false });
    await alternando;

    expect(componente.cupons()[0].ativo).toBeFalse();
  });

  it('deve alterar o percentual só quando o valor mudou', async () => {
    const componente = (await abrir()).componentInstance;
    const cupom = componente.cupons()[0];

    await componente.alterarPercentual(cupom, '10');
    http.expectNone(`${URL_API}/cupons/PIXEL10`);

    const alterando = componente.alterarPercentual(cupom, '15');
    const requisicao = http.expectOne(`${URL_API}/cupons/PIXEL10`);
    expect(requisicao.request.body).toEqual({ percentual: 15 });
    requisicao.flush({ codigo: 'PIXEL10', percentual: 15, ativo: true });
    await alterando;

    expect(componente.cupons()[0].percentual).toBe(15);
  });

  it('deve excluir só depois de confirmar', async () => {
    const componente = (await abrir()).componentInstance;
    const cupom = componente.cupons()[0];
    const confirmar = spyOn(window, 'confirm');

    confirmar.and.returnValue(false);
    await componente.excluir(cupom);
    http.expectNone(`${URL_API}/cupons/PIXEL10`);
    expect(componente.cupons().length).toBe(1);

    confirmar.and.returnValue(true);
    const excluindo = componente.excluir(cupom);
    const requisicao = http.expectOne(`${URL_API}/cupons/PIXEL10`);
    expect(requisicao.request.method).toBe('DELETE');
    requisicao.flush('Cupom removido com sucesso!');
    await excluindo;

    expect(componente.cupons().length).toBe(0);
  });
});
