# Sistema de Gestão de Mesas

PWA para restaurantes de comida por quilo e à vontade. Roda no navegador do celular ou tablet, sem precisar de app store.

---

## Funcionalidades

- **Garçom** — abre mesas, adiciona pessoas (à vontade ou por quilo), registra bebidas com +/−, lança o valor da balança direto na hora da pesagem
- **Caixa** — visualiza todas as mesas abertas, fecha conta com total automático
- **Relatório** — faturamento do dia, mesas atendidas, pessoas, bebidas
- **Configurações** — edita nome do restaurante, preço do à vontade e cardápio sem mexer no código

---

## Tecnologias

- React 18 + Vite 5
- Tailwind CSS 3
- React Router 6
- Context API + useReducer (estado global)
- localStorage com versionamento e validação
- ErrorBoundary (sem tela branca em caso de crash)
- PWA (manifest.json, instalável no celular)

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador ou no celular (mesma rede Wi-Fi).

Para gerar a build de produção:

```bash
npm run build
npm run preview
```

---

## Como adaptar para um novo restaurante

Abra o arquivo `src/config/restaurante.config.js` e altere apenas os valores:

```js
export const CONFIG_RESTAURANTE = {
  nome: 'Restaurante Exemplo',       // nome exibido no app
  totalMesas: 12,             // quantidade de mesas
  precoAvontade: 39.90,       // preço fixo por pessoa (R$)
}

export const PRODUTOS_PADRAO = [
  { id: 1, nome: 'Água sem gás',      preco:  5.00, categoria: 'bebida' },
  // adicione ou remova itens aqui
]
```

Nenhum outro arquivo precisa ser alterado para personalização básica.

---

## Estrutura do projeto

```
src/
├── config/
│   └── restaurante.config.js   ← único arquivo a alterar por cliente
├── context/
│   └── AppContext.jsx           ← estado global, reducer, persistência
├── data/
│   └── initial.js              ← dados iniciais gerados a partir do config
├── components/
│   ├── Header.jsx              ← barra de navegação inferior
│   └── ErrorBoundary.jsx       ← proteção contra crash de render
├── pages/
│   ├── Mesas.jsx               ← grid de mesas
│   ├── Mesa.jsx                ← view do garçom (mesa individual)
│   ├── Caixa.jsx               ← fechamento de contas
│   ├── Relatorio.jsx           ← relatório do dia
│   └── Config.jsx              ← configurações do restaurante
├── App.jsx
├── main.jsx
└── index.css
```

---

## Fluxo de uso

1. Garçom abre a mesa quando o cliente senta
2. Adiciona cada pessoa: **À vontade** (preço fixo) ou **Por quilo**
3. Pessoa por quilo vai até a balança → garçom digita o valor pesado na tela
4. Adiciona bebidas e extras com os botões +/−
5. Caixa acessa a mesa, confere o resumo e fecha a conta

---

## Observações

- O estado é salvo automaticamente no `localStorage` do dispositivo
- Em caso de atualização do sistema, o estado incompatível é descartado de forma segura (versionamento via `VERSAO_ESTADO`)
- A tela de Configurações tem um botão de reset de emergência que limpa tudo e reinicia o app
