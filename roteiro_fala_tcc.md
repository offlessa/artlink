# Roteiro de Fala — Apresentação TCC Artlink (15 minutos)

> Texto para ensaiar e falar (não ler no dia). Baseado em `apresentacao_tcc.md` (blocos/tempos) e `apresentacao_slides_tcc2.md` (24 slides). Marcações `[Slide N]` indicam quando trocar de slide. Ritmo de fala moderado (~140 palavras/min).

---

## 1. Abertura / Capa — [Slide 1] — 0:00–0:30

> Bom dia/boa tarde a todos. Meu nome é Guilherme Martins e hoje vou apresentar meu Trabalho de Conclusão de Curso: o **Artlink**, uma rede social para artistas e artesãos. Este trabalho foi orientado pelo professor Fabrício Bueno Borges dos Santos, no curso de Análise e Desenvolvimento de Sistemas do IFSC Câmpus Tubarão.

---

## 2. Problema e motivação — [Slide 2 e 3] — 0:30–2:00

> Para começar, gostaria de contextualizar o problema que motivou este trabalho. Hoje, artistas e artesãos que querem divulgar seu trabalho online basicamente têm duas opções, e nenhuma das duas atende bem às suas necessidades.
>
> A primeira opção são redes sociais generalistas, como o Instagram. Elas são ótimas para divulgação, mas não foram pensadas para esse público: não existe um jeito nativo de organizar um portfólio, de criar catálogos de obras, ou de colaborar formalmente com outro artista em um projeto.
>
> A segunda opção são plataformas de nicho, como Etsy e ArtFinder. Elas resolvem bem o lado comercial — vender o produto — mas praticamente não têm componente social. Não há feed, não há seguidores, não há interação entre os próprios criadores.
>
> Ou seja, existe uma lacuna: falta uma plataforma que **conecte antes de comercializar** — que una a experiência social de uma rede com as ferramentas específicas do universo criativo, como portfólio e colaboração entre artistas.

---

## 3. Objetivos — [Slide 4 e 5] — 2:00–3:00

> Diante disso, o objetivo geral deste trabalho foi **desenvolver e implantar em produção uma rede social para artistas e artesãos**, com funcionalidades que promovam divulgação, interação e colaboração no setor criativo.
>
> Esse objetivo geral se desdobrou em quatro objetivos específicos:
> Primeiro, implementar funcionalidades típicas de rede social — publicações, curtidas, comentários, seguidores e feed personalizado.
> Segundo, permitir a organização de portfólio, com catálogos e colaboração entre artistas.
> Terceiro, construir uma API REST segura, com autenticação JWT e verificação de e-mail.
> E quarto, colocar tudo isso em produção, em uma infraestrutura de nuvem, com uma interface responsiva e acessível.

---

## 4. Comparativo com o mercado — [Slide 6 e 7] — 3:00–4:00

> Para validar essa lacuna, analisei três referências: Instagram, Etsy e ArtFinder.
>
> O Instagram é a rede social generalista mais usada por artistas hoje. Ele já tem feed, seguidores, curtidas e comentários, e até uma coautoria simples em posts — mas não foi pensado para esse público: não existe portfólio nativo, a colaboração não passa de marcar um coautor no post (não dá pra colaborar num catálogo inteiro, por exemplo), e a audiência é genérica, misturada com qualquer tipo de conteúdo.
>
> A Etsy é um dos maiores marketplaces do mundo para produtos artesanais, mas seu foco é quase inteiramente comercial — não há seguidores, feed ou interação real entre criadores.
>
> Já a ArtFinder é uma plataforma curada, focada em arte exclusiva, com uma experiência de compra mais refinada, mas ainda assim sem componente social: sem seguidores, sem feed, sem curtidas.
>
> [Mostrar tabela comparativa] Aqui vocês veem lado a lado: o Instagram tem a mecânica social e uma coautoria simples, mas nenhuma ferramenta de portfólio nem um fluxo formal de colaboração; Etsy e ArtFinder têm ferramentas para o artesão, mas nenhum componente social real. O Artlink é o único que une as duas pontas: feed social completo e as ferramentas específicas do universo criativo — catálogos e colaboração formal entre artistas, com convite, aceite e recusa. Por outro lado, gestão de estoque e vendas, que é o forte da Etsy e da ArtFinder, não faz parte do escopo do Artlink. E isso é proposital: **o Artlink não compete em e-commerce nem em alcance genérico, ele compete em conexão entre criadores.**

---

## 5. Metodologia — [Slide 9] — 4:00–4:45

> Do ponto de vista metodológico, o projeto foi conduzido com base no **Design Science Research**, em quatro etapas iterativas.
>
> Primeiro, o levantamento de requisitos, mapeando as necessidades reais de artistas e artesãos. Depois, a prototipação das interfaces no Figma, com foco em usabilidade. Em seguida, a implementação propriamente dita, usando React no frontend e Node.js com Express no backend, todo o ecossistema em JavaScript e TypeScript — na próxima seção detalho melhor essa arquitetura. E por fim, a validação, com testes de integração, usabilidade e a implantação real em produção — não ficou só no papel.

---

## 6. Arquitetura e tecnologias — [Slide 10] — 4:45–6:00

> [Mostrar diagrama de arquitetura] A arquitetura do sistema segue o modelo cliente-servidor, com uma SPA no frontend consumindo uma API REST no backend.
>
> No frontend, usei React 18 com TypeScript, Vite como bundler e React Router para navegação. No backend, Node.js com Express 5, também em TypeScript, e Prisma como ORM para o banco de dados. O banco é PostgreSQL, hospedado no Supabase, com 17 entidades relacionais.
>
> O deploy é no Render.com, que escolhi porque permite subir o projeto direto do GitHub, com plano gratuito e sem precisar configurar servidor do zero. Só que descobri, na prática, que o sistema de arquivos do Render é efêmero — a cada novo deploy, as imagens que eu salvava localmente simplesmente sumiam. Foi por isso que migrei pro Cloudinary: ele guarda as imagens de forma persistente e ainda funciona como CDN. Com e-mail tive um problema parecido: configurando SMTP direto, tipo Gmail, os e-mails de verificação caíam em spam. O Resend resolveu isso, porque é uma API pensada especificamente pra entrega confiável de e-mail transacional.

---

## 7. Modelagem de dados — [Slide 11] — 6:00–6:45

> [Mostrar diagrama simplificado] O banco de dados foi modelado com Prisma e tem 17 entidades. As principais são Usuário, Post, Catálogo, Curtida, Comentário, Seguidor, Mensagem, Notificação, além de entidades de apoio como colaboração em post, post salvo e visualização.
>
> Não vou entrar campo a campo, mas destaco alguns relacionamentos-chave: cada post pertence a um usuário — relação um-para-muitos —, mas também pode ter colaboradores, numa tabela à parte que modela isso como muitos-para-muitos. Usuário e seguidor também é muitos-para-muitos, modelando o grafo social. Toda essa modelagem sustenta os **91 endpoints REST**, organizados em 17 grupos funcionais.

---

## 8. Funcionalidades implementadas — [Slide 13, 14 e 15] — 6:45–8:00

> Em termos de funcionalidades, o sistema cobre praticamente todo o ciclo de uso de uma rede social criativa.
>
> Na autenticação: cadastro com verificação de e-mail, login por e-mail ou nome de usuário, recuperação de senha e tudo protegido por JWT.
> Nas publicações: múltiplas imagens, tags e convites de colaboração entre artistas na mesma obra.
> No lado social: curtidas, comentários, sistema de seguidores e feed personalizado.
> Os catálogos funcionam como portfólios colaborativos. Há mensagens diretas com texto e imagem, com edição, exclusão e arquivamento. Notificações automáticas para essas interações. Busca por texto, hashtag e sugestão de artistas. Perfil personalizável com foto, capa, bio e tema claro/escuro. E um sistema de visualizações únicas, com deduplicação tanto para usuário logado quanto por localStorage, para métricas de engajamento mais confiáveis.

---

## 9. DEMONSTRAÇÃO AO VIVO — [Slides 16, 17, 18] — 8:00–11:00

> Agora, a parte que considero mais importante: vou mostrar o sistema funcionando de verdade, em produção.
>
> [Abrir `https://artlink-iwq1.onrender.com/`] Este é o Artlink no ar, publicamente acessível.
> [Feed] Aqui está o feed principal, com publicações dos artistas que sigo.
> [Perfil] Este é o perfil de um artista, com bio, foto de capa e seus catálogos.
> [Publicar] Vou publicar uma obra rapidamente — imagem, tags — e mostrar o upload acontecendo via Cloudinary.
> [Curtir/comentar] Agora curto e comento essa publicação em tempo real.
> [Notificações] E aqui já aparece a notificação gerada por essa ação.
> [Mensagens] Por fim, envio uma mensagem direta rapidamente.
> *(Se sobrar tempo: mostrar tema claro/escuro e busca por hashtag.)*

> **Nota para o dia:** ter vídeo de backup gravado (2 min) caso a internet ou o Render falhem, e "acordar" o servidor minutos antes (plano free hiberniza após inatividade).

---

## 10. Resultados obtidos — [Slide 21] — 11:00–13:00

> Com isso, posso afirmar que todos os objetivos específicos definidos no início do trabalho foram alcançados.
>
> A plataforma está funcional em produção, acessível publicamente, com uma API REST de 91 endpoints organizados em 17 grupos funcionais, sustentada por um banco relacional de 17 entidades. A autenticação com JWT e verificação de e-mail foi validada, sem registros de acesso indevido durante os testes.
>
> O uso do Cloudinary eliminou a necessidade de gerenciar armazenamento local de imagens, tornando a solução mais escalável. Um diferencial técnico que destaco é o sistema de notificações combinado com a deduplicação de visualizações, que garante métricas de engajamento mais precisas — algo que nem Etsy nem ArtFinder oferecem dessa forma.
>
> A interface também foi testada em diferentes tamanhos de tela, e o Artlink se consolidou como a única, entre as três plataformas comparadas, que une rede social completa e ferramentas voltadas para artesãos.

---

## 11. Considerações finais — [Slide 22] — 13:00–13:45

> Em síntese, o objetivo geral foi alcançado: o Artlink foi desenvolvido, testado e implantado em produção, não apenas como protótipo acadêmico.
>
> A escolha do Design Science Research se mostrou adequada, porque permitiu ciclos iterativos de validação — voltar, ajustar requisitos, testar de novo — em vez de um processo estritamente linear. E a arquitetura cliente-servidor, com SPA e API REST, entregou uma experiência de uso comparável à de redes sociais consolidadas no mercado.

---

## 12. Trabalhos futuros — [Slide 22] — 13:45–14:30

> Como trabalhos futuros, identifico algumas direções interessantes. Um aplicativo nativo para iOS e Android, já que hoje a plataforma é web. A integração de um módulo de e-commerce, permitindo venda direta pela própria plataforma. Um sistema de eventos e exposições virtuais. Recomendação de obras e artistas usando inteligência artificial, com base no comportamento do usuário. E um sistema de denúncia e moderação de conteúdo, combinando revisão manual com análise automática de imagens via IA, como Amazon Rekognition ou WebPurify.

---

## 13. Encerramento — [Slide 24] — 14:30–15:00

> Para concluir, acredito que o Artlink contribui para a valorização do artesanato e da arte no ambiente digital brasileiro, oferecendo aos criadores um espaço pensado especificamente para eles — para se conectar antes de comercializar.
>
> Muito obrigado pela atenção. Fico à disposição para as perguntas da banca.

---

## Checklist antes da apresentação
- [ ] Conta de demonstração pronta, já com posts, seguidores e mensagens (não criar tudo do zero ao vivo)
- [ ] Vídeo de backup da demo gravado (2 min) — internet/servidor podem falhar
- [ ] Dar um "ping" no Render minutos antes (plano free hiberniza)
- [ ] Ensaiar com cronômetro pelo menos 2x, ajustando ritmo por seção
- [ ] Preparar respostas para: "por que não Firebase/outro banco?", "como funciona a autenticação?", "por que não tem e-commerce?"
