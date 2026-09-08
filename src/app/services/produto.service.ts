import { Injectable } from '@angular/core';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private produtos: Produto[] = [
    {
      id: 1,
      nome: 'Camiseta Invaders 8-Bit',
      categoria: 'Games',
      emoji: '👾',
      gradiente: 'radial-gradient(circle at 30% 30%,#3a2470,#1c1140)',
      preco: 79.90,
      precoAntigo: 99.90,
      novo: true,
      descricao: 'Estampa exclusiva inspirada nos clássicos jogos de nave, silk-screen de alta durabilidade sobre algodão penteado 30.1. Aquela camiseta que todo geek de carteirinha reconhece de longe.'
    },
    {
      id: 2,
      nome: 'Camiseta Error 404',
      categoria: 'Programação',
      emoji: '💻',
      gradiente: 'radial-gradient(circle at 70% 30%,#2c4a6b,#151d33)',
      preco: 69.90,
      descricao: 'Para quem já perdeu a conta de quantas vezes debugou até altas horas. Estampa minimalista com humor de programador.'
    },
    {
      id: 3,
      nome: 'Camiseta Byte Cat',
      categoria: 'Games',
      emoji: '🐱',
      gradiente: 'radial-gradient(circle at 40% 60%,#4a2a5c,#1c1140)',
      preco: 74.90,
      novo: true,
      descricao: 'Um gatinho pixelado que conquistou a internet, agora estampado em algodão macio e resistente.'
    },
    {
      id: 4,
      nome: 'Camiseta Matrix Code',
      categoria: 'Filmes',
      emoji: '🟩',
      gradiente: 'radial-gradient(circle at 50% 40%,#1f5c3f,#0f2419)',
      preco: 84.90,
      descricao: 'Inspirada na chuva de código verde mais famosa do cinema. Para quem já escolheu o comprimido vermelho.'
    },
    {
      id: 5,
      nome: 'Camiseta Level Up',
      categoria: 'Games',
      emoji: '⬆️',
      gradiente: 'radial-gradient(circle at 60% 40%,#6b4a1f,#241a0d)',
      preco: 69.90,
      descricao: 'Comemore cada conquista do dia a dia com essa estampa retrô inspirada nos jogos clássicos.'
    },
    {
      id: 6,
      nome: 'Camiseta Circuito Robô',
      categoria: 'Ciência',
      emoji: '🤖',
      gradiente: 'radial-gradient(circle at 35% 65%,#2a4a4a,#101f1f)',
      preco: 79.90,
      novo: true,
      descricao: 'Circuitos estilizados e um robozinho carismático para quem ama tecnologia e ciência.'
    },
    {
      id: 7,
      nome: 'Camiseta Alien Pixel',
      categoria: 'Ficção',
      emoji: '👽',
      gradiente: 'radial-gradient(circle at 45% 35%,#3d2a5c,#181026)',
      preco: 74.90,
      descricao: 'Um alienígena pixelado para os fãs de ficção científica e teorias sobre vida extraterrestre.'
    },
    {
      id: 8,
      nome: 'Camiseta Retro Console',
      categoria: 'Games',
      emoji: '🎮',
      gradiente: 'radial-gradient(circle at 55% 55%,#5c2a3d,#26101a)',
      preco: 89.90,
      descricao: 'Uma homenagem aos consoles retrô que marcaram época. Nostalgia em forma de estampa.'
    }
  ];

  getProdutos(): Produto[] {
    return this.produtos;
  }

  getProdutoPorId(id: number): Produto | undefined {
    return this.produtos.find(p => p.id === id);
  }

  getRelacionados(idAtual: number, quantidade = 4): Produto[] {
    return this.produtos.filter(p => p.id !== idAtual).slice(0, quantidade);
  }

  buscar(termo: string, categoria?: string): Produto[] {
    let resultado = this.produtos;
    if (categoria) {
      resultado = resultado.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    if (termo) {
      const termoBusca = termo.toLowerCase();
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(termoBusca));
    }
    return resultado;
  }
}
