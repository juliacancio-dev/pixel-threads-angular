import { Injectable } from '@angular/core';
import { Produto } from '../models/produto.model';

export const TAMANHOS_ADULTO = ['P', 'M', 'G', 'GG'];
export const TAMANHOS_INFANTIL = ['2', '4', '6', '8', '10', '12'];

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private produtos: Produto[] = [
    {
      id: 1,
      nome: 'Camiseta Control Freak',
      categoria: 'Games',
      imagem: 'assets/produtos/control-freak/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 79.90,
      novo: true,
      descricao: 'Todos os controles que marcaram a história dos videogames reunidos numa estampa só. Para quem não larga o joystick por nada.'
    },
    {
      id: 2,
      nome: 'Camiseta Rick and Morty Peace Among Worlds',
      categoria: 'Filmes',
      imagem: 'assets/produtos/rick-and-morty/foto-1.webp',
      fotos: ['assets/produtos/rick-and-morty/foto-1.webp', 'assets/produtos/rick-and-morty/foto-2.webp', 'assets/produtos/rick-and-morty/foto-3.webp'],
      tamanhos: TAMANHOS_ADULTO,
      preco: 89.90,
      novo: true,
      descricao: 'O Rick mais sincero do multiverso mandando sua mensagem de paz entre os mundos. Estampa com cores neon sobre malha preta.'
    },
    {
      id: 3,
      nome: 'Camiseta Demon Slayer Olhares',
      categoria: 'Animes',
      imagem: 'assets/produtos/demon-slayer/foto-1.webp',
      fotos: ['assets/produtos/demon-slayer/foto-1.webp', 'assets/produtos/demon-slayer/foto-2.webp', 'assets/produtos/demon-slayer/foto-3.webp'],
      tamanhos: TAMANHOS_ADULTO,
      preco: 84.90,
      descricao: 'Os olhares de Tanjiro, Nezuko, Zenitsu e Inosuke em faixas coloridas. Para fãs de Kimetsu no Yaiba.'
    },
    {
      id: 4,
      nome: 'Camiseta X-Men \'97',
      categoria: 'Heróis',
      imagem: 'assets/produtos/x-men-97/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 94.90,
      precoAntigo: 119.90,
      novo: true,
      descricao: 'Os mutantes da série animada X-Men \'97 em quadrinhos coloridos sobre malha off-white. Um clássico dos anos 90 de volta.'
    },
    {
      id: 5,
      nome: 'Camiseta You Are Offline',
      categoria: 'Games',
      imagem: 'assets/produtos/you-are-offline/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 69.90,
      descricao: 'O dinossauro mais famoso da internet, aquele que aparece quando a conexão cai. Estampa minimalista em pixel art.'
    },
    {
      id: 6,
      nome: 'Camiseta Dragon Ball Z Shenlong',
      categoria: 'Animes',
      imagem: 'assets/produtos/dragon-ball-shenlong/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 89.90,
      descricao: 'Shenlong e as sete esferas do dragão numa estampa detalhada. Faça seu pedido e vista a lenda.'
    },
    {
      id: 7,
      nome: 'Camiseta Led Zeppelin Mothership',
      categoria: 'Música',
      imagem: 'assets/produtos/led-zeppelin/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 94.90,
      descricao: 'A arte clássica do álbum Mothership do Led Zeppelin. Rock pesado para quem tem bom gosto musical.'
    },
    {
      id: 8,
      nome: 'Camiseta Seu Madruga "Deus Ajuda"',
      categoria: 'Filmes',
      imagem: 'assets/produtos/seu-madruga/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 69.90,
      precoAntigo: 84.90,
      descricao: '"Deus ajuda quem cedo madruga" com o personagem mais querido da vila. Humor clássico da TV em estampa branca.'
    },
    {
      id: 9,
      nome: 'Camiseta Fantasma "Do You Believe in Ghosts?"',
      categoria: 'Games',
      imagem: 'assets/produtos/fantasma/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 84.90,
      novo: true,
      descricao: 'Um fantasminha travesso em tons de roxo estampado nas costas. Visual moderno e divertido sobre malha branca.'
    },
    {
      id: 10,
      nome: 'Camiseta Princesa Peach',
      categoria: 'Games',
      imagem: 'assets/produtos/princesa-peach/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 79.90,
      descricao: 'A princesa mais famosa do Reino dos Cogumelos em estampa estilo brasão universitário sobre malha rosa.'
    },
    {
      id: 11,
      nome: 'Camiseta Tartarugas Ninja',
      categoria: 'Filmes',
      imagem: 'assets/produtos/tartarugas-ninja/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 79.90,
      descricao: 'Leonardo, Raphael, Donatello e Michelangelo em quadros coloridos. Cowabunga!'
    },
    {
      id: 12,
      nome: 'Camiseta Os Mestres',
      categoria: 'Filmes',
      imagem: 'assets/produtos/os-mestres/foto-1.webp',
      fotos: ['assets/produtos/os-mestres/foto-1.webp', 'assets/produtos/os-mestres/foto-2.webp', 'assets/produtos/os-mestres/foto-3.webp'],
      tamanhos: TAMANHOS_ADULTO,
      preco: 74.90,
      descricao: 'Mestre Kame, Yoda e outros grandes mestres atravessando a faixa de pedestres no estilo Abbey Road.'
    },
    {
      id: 13,
      nome: 'Camiseta X-Men Xavier\'s School',
      categoria: 'Heróis',
      imagem: 'assets/produtos/x-men-xavier/foto-1.webp',
      tamanhos: TAMANHOS_ADULTO,
      preco: 79.90,
      descricao: 'O emblema da escola do Professor Xavier para jovens superdotados. Discreta e cheia de referência.'
    },
    {
      id: 14,
      nome: 'Camiseta Infantil Homem-Aranha LED',
      categoria: 'Infantil',
      imagem: 'assets/produtos/homem-aranha-led/foto-1.webp',
      tamanhos: TAMANHOS_INFANTIL,
      preco: 99.90,
      novo: true,
      descricao: 'Estampa do Homem-Aranha com olhos de LED que acendem. 100% algodão e LED à prova d\'água.'
    },
    {
      id: 15,
      nome: 'Camiseta Infantil Hulk',
      categoria: 'Infantil',
      imagem: 'assets/produtos/hulk-infantil/foto-1.webp',
      tamanhos: TAMANHOS_INFANTIL,
      preco: 59.90,
      descricao: 'O gigante esmeralda em ação numa estampa cheia de energia para os pequenos heróis.'
    },
    {
      id: 16,
      nome: 'Camiseta Infantil Relâmpago McQueen',
      categoria: 'Infantil',
      imagem: 'assets/produtos/relampago-mcqueen/foto-1.webp',
      fotos: ['assets/produtos/relampago-mcqueen/foto-1.webp', 'assets/produtos/relampago-mcqueen/foto-2.webp'],
      tamanhos: TAMANHOS_INFANTIL,
      preco: 59.90,
      descricao: 'Katchau! O Relâmpago McQueen de Carros em estampa vermelha para os pequenos pilotos.'
    },
    {
      id: 17,
      nome: 'Camiseta Infantil Galinha Pintadinha',
      categoria: 'Infantil',
      imagem: 'assets/produtos/galinha-pintadinha/foto-1.webp',
      tamanhos: TAMANHOS_INFANTIL,
      preco: 54.90,
      precoAntigo: 64.90,
      descricao: 'A Galinha Pintadinha estampada de corpo inteiro em malha azul. Fofura garantida para a criançada.'
    }
  ];

  getProdutos(): Produto[] {
    return this.produtos;
  }

  /** Tamanho sugerido para compras rápidas (botão "+" dos cards). */
  getTamanhoPadrao(produto: Produto): string {
    return produto.tamanhos[Math.floor((produto.tamanhos.length - 1) / 2)];
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
