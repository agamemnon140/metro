# Plano de melhorias visuais do Metro

Direção: aproximar a interface da sinalização metroviária, com tipografia legível,
controles discretos e cores oficiais das linhas como protagonistas.

## Etapa 1 — clareza do mapa e controles (concluída localmente)

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

## Etapa 2 — leitura dos painéis

- [ ] Exibir as estações como um percurso vertical na cor da linha.
- [ ] Identificar baldeações pelos números das linhas conectadas.
- [ ] Colocar o percurso antes das notícias.
- [ ] Simplificar o painel móvel com versão compacta expansível e puxador funcional.
- [ ] Substituir os pontos de status do menu Linhas por etiquetas textuais.
- [ ] Avaliar ordenação das linhas por número, com operadora como dado secundário.

## Etapa 3 — acabamento

- [ ] Unificar sombras, bordas, cantos e espaçamentos de menus e painéis.
- [ ] Revisar contraste, foco de teclado e tamanho dos textos nos dois temas.
- [ ] Validar telas estreitas e desktop, nos modos diagrama e geográfico.

## Critérios de aceite da primeira etapa

- O usuário identifica o modo ativo sem decifrar abreviações.
- Todas as opções de exibição continuam disponíveis no celular e no desktop.
- O mapa não representa uma linha inteira em obras quando só uma extensão é futura.
- Ocultar uma camada não conecta estações através de trechos ocultos.
- A seleção de uma linha mantém nomes sem sobreposição; a estação selecionada
  tem prioridade quando os nomes estão habilitados.
- A build de produção passa; limitações de validação ficam registradas aqui.

## Escopo desta execução

Implementar e validar a etapa 1 localmente. Etapas 2 e 3 ficam registradas para
continuidade. Nenhuma publicação ou alteração dos dados de infraestrutura faz
parte desta etapa.

## Validação realizada

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

Próxima entrega: etapa 2, começando pelo percurso vertical no painel da linha.
