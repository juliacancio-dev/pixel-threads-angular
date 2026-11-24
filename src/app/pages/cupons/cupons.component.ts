import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cupom } from '../../models/pedido.model';
import { CupomService } from '../../services/cupom.service';
import { ToastService } from '../../services/toast.service';

/** Cadastro de cupons de desconto (tabela "cupons" da API). Sem restrição de acesso: é um projeto acadêmico. */
@Component({
  selector: 'app-cupons',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cupons.component.html',
  styleUrl: './cupons.component.css'
})
export class CuponsComponent implements OnInit {
  private construtorFormulario = inject(FormBuilder);
  private servicoCupom = inject(CupomService);
  private servicoToast = inject(ToastService);

  cupons = signal<Cupom[]>([]);
  carregando = signal(true);
  erroAoCarregar = signal(false);
  salvando = false;

  formulario = this.construtorFormulario.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]{3,20}$/)]],
    percentual: [10 as number | null, [Validators.required, Validators.min(1), Validators.max(100)]]
  });

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando.set(true);
    try {
      this.cupons.set(await this.servicoCupom.listar());
      this.erroAoCarregar.set(false);
    } catch (erro) {
      console.error('Não foi possível buscar os cupons. A API está rodando? (npm run api)', erro);
      this.erroAoCarregar.set(true);
    } finally {
      this.carregando.set(false);
    }
  }

  campoInvalido(campo: 'codigo' | 'percentual'): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && controle.touched;
  }

  async criar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.servicoToast.mostrar('Confira os campos destacados em vermelho.');
      return;
    }

    const { codigo, percentual } = this.formulario.getRawValue();
    this.salvando = true;
    try {
      const novo = await this.servicoCupom.criar(codigo!, Number(percentual));
      this.cupons.update(lista => [...lista, novo].sort((a, b) => a.codigo.localeCompare(b.codigo)));
      this.formulario.reset({ codigo: '', percentual: 10 });
      this.servicoToast.mostrar(`Cupom ${novo.codigo} criado!`);
    } catch (erro) {
      this.servicoToast.mostrar(this.mensagemDeErro(erro, 'Já existe um cupom com este código.'));
    } finally {
      this.salvando = false;
    }
  }

  async alternarAtivo(cupom: Cupom): Promise<void> {
    try {
      const atualizado = await this.servicoCupom.alterar(cupom.codigo, { ativo: !cupom.ativo });
      this.substituir(atualizado);
      this.servicoToast.mostrar(`Cupom ${atualizado.codigo} ${atualizado.ativo ? 'ativado' : 'desativado'}.`);
    } catch (erro) {
      this.servicoToast.mostrar(this.mensagemDeErro(erro));
    }
  }

  async alterarPercentual(cupom: Cupom, valor: string): Promise<void> {
    const percentual = Number(valor);
    if (valor.trim() === '' || percentual === cupom.percentual) return;
    try {
      const atualizado = await this.servicoCupom.alterar(cupom.codigo, { percentual });
      this.substituir(atualizado);
      this.servicoToast.mostrar(`Cupom ${atualizado.codigo} agora dá ${atualizado.percentual}% de desconto.`);
    } catch (erro) {
      this.servicoToast.mostrar(this.mensagemDeErro(erro));
      this.cupons.update(lista => [...lista]); // volta o campo para o valor salvo
    }
  }

  async excluir(cupom: Cupom): Promise<void> {
    if (!confirm(`Excluir o cupom ${cupom.codigo}? Os pedidos já feitos com ele não mudam.`)) return;
    try {
      await this.servicoCupom.remover(cupom.codigo);
      this.cupons.update(lista => lista.filter(c => c.codigo !== cupom.codigo));
      this.servicoToast.mostrar(`Cupom ${cupom.codigo} excluído.`);
    } catch (erro) {
      this.servicoToast.mostrar(this.mensagemDeErro(erro));
    }
  }

  private substituir(atualizado: Cupom): void {
    this.cupons.update(lista => lista.map(c => (c.codigo === atualizado.codigo ? atualizado : c)));
  }

  private mensagemDeErro(erro: unknown, mensagem409 = ''): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 409) return mensagem409;
      if (erro.status === 400) return 'Dados inválidos: o código tem de 3 a 20 letras, números, "-" ou "_", e o desconto vai de 1 a 100%.';
      if (erro.status === 404) return 'Cupom não encontrado.';
    }
    console.error('Erro ao falar com a API de cupons.', erro);
    return 'Não foi possível falar com o servidor. A API está rodando?';
  }
}
