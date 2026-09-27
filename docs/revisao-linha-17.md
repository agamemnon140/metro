# Revisão da Linha 17–Ouro

Revisão em 27/09/2026, motivada pelo relato de traçado/estações/conexões errados.

## Diagnóstico

O mapa anterior apresentava o trecho São Paulo–Morumbi → Campo Belo como
operacional, ocultava Congonhas e Washington Luís como estudo e não ligava
Morumbi à Linha 9. Também conectava Congonhas diretamente a Washington Luís,
pois o modelo aceitava somente uma sequência de estações.

Os erros de fase e cadastro já estavam em `scripts/build-network.mjs` antes
das alterações visuais. A validação visual anterior não verificava a topologia
contra fontes externas, por isso não os detectou.

Reprodução executada antes da correção:

```text
npm run test:ui -- tests/gold-line.spec.ts --project=desktop
FAIL: Estação Aeroporto de Congonhas ausente do mapa com as camadas padrão.
```

## Evidências e limites

- [Metrô — Linha 17](https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-17-ouro/): lista das oito estações atuais.
- [Prefeitura — entrega de Washington Luís, 30/06/2026](https://prefeitura.sp.gov.br/w/primeira-fase-da-linha-17-ouro-%C3%A9-conclu%C3%ADda-com-inaugura%C3%A7%C3%A3o-da-esta%C3%A7%C3%A3o-washington-lu%C3%ADs-na-zona-sul): oito estações, três destinos e bifurcação em Brooklin Paulista.
- [Metrô — Morumbi](https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-17-ouro/estacao-morumbi/): integração com a Linha 9.
- [Mapa oficial da rede, julho/2026](https://www.metro.sp.gov.br/wp-content/uploads/2026/07/mapa-da-rede.pdf).

As coordenadas pontuais foram conferidas nas páginas das estações da Wikipédia,
convertendo graus/minutos/segundos em graus decimais:
[Morumbi](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Morumbi),
[Chucri Zaidan](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Chucri_Zaidan),
[Vila Cordeiro](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Vila_Cordeiro),
[Vereador José Diniz](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Vereador_Jos%C3%A9_Diniz),
[Brooklin Paulista](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Brooklin_Paulista),
[Aeroporto de Congonhas](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Aeroporto_de_Congonhas),
[Washington Luís](https://en.wikipedia.org/wiki/Washington_Lu%C3%ADs_(S%C3%A3o_Paulo_Metro)),
[Granja Julieta](https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Granja_Julieta).
As coordenadas de Granja Julieta estavam próximas de Morumbi no conjunto anterior;
elas foram corrigidas para evitar a sobreposição geográfica das duas estações.

A posição de Campo Belo foi preservada. O desenho liga pontos de estações e
continua ilustrativo; não é uma reprodução dos trilhos. Os prolongamentos
históricos para São Paulo–Morumbi e Jabaquara mantêm posições aproximadas,
explicitamente classificadas como estudo. Esta revisão não certifica o traçado
ou cronograma dessas extensões nem audita todas as outras linhas.

## Correção

- Trecho comum Morumbi → Chucri Zaidan → Vila Cordeiro → Campo Belo → Vereador
  José Diniz → Brooklin Paulista, com ramais independentes para Congonhas e
  Washington Luís.
- Morumbi é um único nó compartilhado pelas linhas 9 e 17, entre Berrini e
  Granja Julieta. São Paulo–Morumbi é a estação distinta da Linha 4.
- `routes` representa trechos independentes. `linePhases` distingue uma ligação
  futura da operação atual de uma estação compartilhada.
- O painel separa os ramais e as extensões e informa oito estações em operação.
- `scripts/lib/reviewed-gold-line.mjs` é a revisão aplicada pelo gerador ao
  resultado final. Ela também pode atualizar o arquivo já gerado sem buscar
  novamente os dados OSM. Sua aplicação é idempotente.
- Os testes de dados verificam a bifurcação e a integração; os testes de interface
  verificam a presença das estações, os três traços atuais e os dois futuros,
  a navegação da integração e a alternância diagrama/geográfico.

## Prevenção

Além dos testes visuais, alterações nos dados precisam conferir terminais,
vizinhança das estações e integrações contra fontes datadas. Fase da estação
não basta para representar a fase de cada linha que a serve.

## Validação final

- `npm run build`: passou.
- `npm run test:ui`: 21 testes passaram (desktop, celular de 320 px e WebKit/iPhone emulado).
- `npm run test:data`: 4 testes passaram, incluindo aplicação à fonte curada antiga.
- `node --check scripts/build-network.mjs`: passou.
- O pipeline completo de importação OSM não foi reexecutado: o arquivo de entrada
  `scratch/osm.json` não está neste checkout. A revisão final foi aplicada ao
  conjunto existente e testada isoladamente, inclusive quanto à idempotência.
