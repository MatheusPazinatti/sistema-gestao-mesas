// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DO RESTAURANTE
// Para usar este sistema em um novo cliente, altere APENAS este arquivo.
// Não mexa nos outros arquivos para personalização básica.
// ═══════════════════════════════════════════════════════════════════════════

export const CONFIG_RESTAURANTE = {
  // Nome exibido no app (tela de mesas, cabeçalho, relatórios)
  nome: 'Restaurante Exemplo',

  // Número total de mesas do restaurante
  totalMesas: 12,

  // Preço fixo do almoço à vontade por pessoa (R$)
  precoAvontade: 39.90,
}

// ─── Cardápio padrão ────────────────────────────────────────────────────────
// Adicione ou remova itens aqui. O restaurante também pode gerenciar isso
// diretamente pela tela de Configurações dentro do app.
// categoria: 'bebida' | 'extra'
export const PRODUTOS_PADRAO = [
  { id: 1, nome: 'Água sem gás',      preco:  5.00, categoria: 'bebida' },
  { id: 2, nome: 'Água com gás',      preco:  6.00, categoria: 'bebida' },
  { id: 3, nome: 'Suco de laranja',   preco:  9.00, categoria: 'bebida' },
  { id: 4, nome: 'Suco do dia',       preco:  9.00, categoria: 'bebida' },
  { id: 5, nome: 'Refrigerante lata', preco:  7.00, categoria: 'bebida' },
  { id: 6, nome: 'Cerveja long neck', preco: 11.00, categoria: 'bebida' },
  { id: 7, nome: 'Café',              preco:  4.00, categoria: 'bebida' },
  { id: 8, nome: 'Sobremesa do dia',  preco: 10.00, categoria: 'extra'  },
]
