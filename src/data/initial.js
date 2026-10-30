// Dados iniciais do sistema — lidos de restaurante.config.js
import { CONFIG_RESTAURANTE, PRODUTOS_PADRAO } from '../config/restaurante.config'

export const mesasIniciais = Array.from({ length: CONFIG_RESTAURANTE.totalMesas }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  status: 'livre', // 'livre' | 'ocupada'
}))

export const produtosIniciais = PRODUTOS_PADRAO

export const configInicial = {
  precoAvontade: CONFIG_RESTAURANTE.precoAvontade,
  nomeRestaurante: CONFIG_RESTAURANTE.nome,
}
