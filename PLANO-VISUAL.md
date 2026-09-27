# Plano de melhorias visuais do Metro

Direção: aproximar a interface da sinalização metroviária, com tipografia legível,
controles discretos e cores oficiais das linhas como protagonistas.

## Etapa 1 — clareza do mapa e controles (commit 0438a85 enviado ao GitHub)

- [x] Diferenciar trechos em operação (contínuos), obras (tracejados) e projetos
  (pontilhados), respeitando as fases das estações, o status da linha e as camadas.
- [x] Adicionar uma legenda compacta dos estilos de traçado.
- [x] Manter a prevenção de sobreposição dos nomes ao selecionar uma linha.
- [x] Usar halo nos nomes e reservar a caixa de fundo para a estação selecionada.
- [x] Trocar Geo/Esq por um seletor explícito Diagrama/Geográfico.
- [x] Reunir nomes, camadas e tema em Exibição, com rótulos em português.
- [x] Ampliar áreas de toque dos controles e melhorar a leitura no celular.
- [x] Verificar compilação, comportamento das fases e interface responsiva.
- [x] Ajustar o enquadramento geográfico às estações visíveis e manter os nomes
  com 12 px na tela, considerando tanto o zoom quanto o ajuste do SVG ao viewport.

## Etapa 2 — leitura dos painéis (concluída)

- [x] Exibir as estações como um percurso vertical na cor da linha.
- [x] Identificar baldeações pelos números das linhas conectadas.
- [x] Colocar o percurso antes das notícias.
- [x] Simplificar o painel móvel com versão compacta expansível e puxador funcional.
- [x] Substituir os pontos de status do menu Linhas por etiquetas textuais.
- [x] Ordenar as linhas urbanas por número, com operadora como dado secundário;
  serviços intercidades aparecem depois.
- [x] Identificar conexões com linhas futuras como previstas, conforme o status
  disponível no conjunto de dados.

## Etapa 3 — acabamento (concluída)

- [x] Unificar sombras, bordas, cantos e espaçamentos de menus e painéis.
- [x] Revisar contraste, foco de teclado e tamanho dos textos nos dois temas.
- [x] Validar telas estreitas e desktop, nos modos diagrama e geográfico.
- [x] Separar o convite de instalação e a legenda para evitar sobreposição.

## Critérios de aceite da primeira etapa

- O usuário identifica o modo ativo sem decifrar abreviações.
- Todas as opções de exibição continuam disponíveis no celular e no desktop.
- O mapa não representa uma linha inteira em obras quando só uma extensão é futura.
- Ocultar uma camada não conecta estações através de trechos ocultos.
- A seleção de uma linha mantém nomes sem sobreposição; a estação selecionada
  tem prioridade quando os nomes estão habilitados.
- A build de produção passa; limitações de validação ficam registradas aqui.

## Escopo e publicação

A primeira execução implementou a etapa 1 localmente. Na continuação autorizada
pelo usuário, o commit 0438a85 foi enviado para master, e as etapas 2 e 3 foram
implementadas. O workflow existente publica master no GitHub Pages.
Os dados de infraestrutura foram preservados.

## Validação da primeira etapa

- `npm run build`: passou (TypeScript, Vite e geração do PWA).
- `npm run test:ui`: 9 testes passaram em Chromium desktop (1440 × 900),
  Chromium mobile (320 × 640) e WebKit com emulação de iPhone 13.
- Verificados: áreas de toque de 44 px, ausência de rolagem horizontal, menu
  dentro da tela, troca de tema e modo, fechamento por Escape com retorno do
  foco, estilos de extensões/projetos, camadas e ausência de sobreposição dos
  nomes ao selecionar a Linha 1. A opção Ocultar também vale para a linha focada.
- Capturas de tela geradas em `test-results/` (pasta ignorada pelo Git).
- Inspeção visual das capturas de desktop e celular, nos temas claro e escuro.
- Os testes usam navegadores locais e emulação; não houve teste em aparelho
  físico nem publicação no GitHub Pages.
- O estilo dos trechos deriva dos dados existentes. Não houve revisão factual
  das fases, datas ou traçados da infraestrutura.

## Validação das etapas 2 e 3

- Build de produção aprovada, incluindo TypeScript e PWA.
- Suíte completa: 15 testes passaram nos três perfis de navegador/tela.
- Os 6 testes de painéis foram repetidos após o ajuste final das conexões previstas.
- Verificados: ordenação numérica, status textual, percurso antes das notícias,
  conexões, navegação linha → estação → outra linha, links de mapa, painel compacto,
  expansão/recolhimento por gesto de ponteiro e ativação por teclado, Escape e
  ausência de rolagem horizontal.
- Capturas inspecionadas de desktop, celular de 320 px e iPhone emulado,
  incluindo os painéis claro/escuro. A suíte usa movimento reduzido para evitar
  capturas durante animações. Gestos foram simulados com eventos de ponteiro;
  não houve teste em aparelho físico.
- O painel é não modal e mantém o mapa interativo. No celular, a estação mostra
  suas linhas e a ação principal de mapa antes de expandir os detalhes.
- Notícias agora abrem nos sites de origem por links; o iframe foi retirado
  para manter o painel leve e visualmente consistente.

O plano visual está implementado. A validação não inclui revisão factual dos
dados de transporte nem auditoria completa de acessibilidade.

## Revisão posterior — Linha 17–Ouro

O relato do usuário revelou erros de dados que a validação visual não cobria.
Foram corrigidas as fases, a bifurcação em Brooklin Paulista e a integração com
a Linha 9 em Morumbi. O painel agora separa os ramais e as extensões futuras.
Fontes, limites e testes estão em [docs/revisao-linha-17.md](docs/revisao-linha-17.md).
