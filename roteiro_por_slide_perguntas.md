# Roteiro por Slide + Perguntas e Respostas — TCC 2 Artlink

> Complementa o `roteiro_fala_tcc.md` (que tem o roteiro por blocos de tempo). Aqui é a visão slide a slide — útil pra não se perder navegando no deck. Os slides marcados **[APOIO]** não entram nos 15 minutos cronometrados; use só se sobrar tempo ou se a banca perguntar algo relacionado.

---

## Parte 1 — Fala por slide (1 a 24)

**Slide 1 — Capa**
> Bom dia/boa tarde. Meu nome é Guilherme Martins e vou apresentar meu TCC: o Artlink, uma rede social para artistas e artesãos, orientado pelo professor Fabrício Bueno Borges dos Santos.

**Slide 2 — O problema**
> Hoje, artistas e artesãos têm duas opções pra divulgar trabalho online, e nenhuma atende bem. Redes generalistas como o Instagram não têm portfólio nem colaboração formal. Plataformas de nicho como Etsy e ArtFinder resolvem o comércio, mas quase não têm componente social. Falta uma plataforma que conecte antes de comercializar.

**Slide 3 — Por que o Artlink existe**
> Isso me motivou por quatro razões: a ausência de uma rede social específica pro universo criativo, a necessidade de organizar portfólio integrado à divulgação, a colaboração entre artistas — que nenhum concorrente oferece de verdade — e a valorização do artesanato brasileiro no ambiente digital.

**Slide 4 — Pergunta e objetivo geral**
> A pergunta de pesquisa foi: como uma plataforma digital pode potencializar visibilidade, networking e colaboração entre artistas e artesãos? O objetivo geral: desenvolver e implantar em produção uma rede social pro setor criativo.

**Slide 5 — Objetivos específicos**
> Isso virou quatro objetivos específicos: funcionalidades de rede social completas; organização de portfólio com catálogos e colaboração; API REST segura com JWT e verificação de e-mail; e produção real em nuvem, com interface responsiva.

**Slide 6 — Instagram, Etsy e ArtFinder**
> Analisei três referências. Instagram tem a mecânica social e até uma coautoria simples em posts, mas nenhum portfólio nem fluxo formal de colaboração. Etsy resolve comércio, mas quase não tem interação social. ArtFinder é curada, mas sem seguidores nem feed.

**Slide 7 — Tabela comparativa**
> [Mostrar tabela] O Artlink é o único que junta feed social completo com as ferramentas do universo criativo — catálogos e colaboração formal, com convite, aceite e recusa. Gestão de estoque e vendas, que é o forte de Etsy e ArtFinder, não faz parte do escopo — proposital: o Artlink compete em conexão entre criadores, não em e-commerce.

**Slide 8 — Artlink: visão geral [APOIO]**
> *(Se usar: )* Aqui está a tela de cadastro real da plataforma — combina publicação de obras, curtidas, comentários e seguidores com catálogos, colaboração e busca por hashtags.

**Slide 9 — Metodologia (DSR)**
> Usei Design Science Research, em quatro etapas: levantamento de requisitos, prototipagem no Figma, implementação com React no frontend e Node/Express no backend, e validação com testes e implantação real em produção.

**Slide 10 — Arquitetura do sistema**
> [Mostrar diagrama] Frontend React conversa com meu backend Node via API REST. O backend guarda dados no PostgreSQL via Prisma, e delega duas tarefas: imagens pro Cloudinary, e-mail pro Resend. Tudo hospedado junto no Render — e cada uma dessas escolhas resolveu uma dificuldade real que apareceu no meio do desenvolvimento *(contar a história: Render por deploy simples → descobri que o storage é efêmero → migrei pra Cloudinary → e-mail caindo em spam → Resend)*.

**Slide 11 — Modelagem de dados**
> [Mostrar diagrama] Banco com Prisma, 17 entidades. Usuário publica posts e catálogos — um-para-muitos; post recebe curtidas e comentários — um-para-muitos; usuário segue outros usuários e colabora em posts de outros artistas — os dois muitos-para-muitos, em tabelas de junção à parte.

**Slide 12 — Casos de uso [APOIO]**
> *(Se usar:)* Dois atores: Visitante, que navega e busca; e Usuário Autenticado, que herda tudo isso e ainda publica, curte, comenta, segue, manda mensagem e gerencia perfil.

**Slide 13 — Autenticação e publicações**
> Cadastro com verificação de e-mail, login por e-mail ou username com JWT, recuperação de senha por código temporário. Publicação com múltiplas imagens, tags, e convites de colaboração entre artistas na mesma obra.

**Slide 14 — Interação e organização**
> Curtidas e comentários, sistema de seguidores com feed personalizado, catálogos como portfólios colaborativos, mensagens diretas com edição/exclusão/arquivamento, e notificações automáticas pra cada uma dessas interações.

**Slide 15 — Busca, perfil e RNFs**
> Busca por texto, hashtag e sugestão de artistas. Perfil com foto, capa, bio, tema claro/escuro. Segurança com bcrypt e JWT, conexão SSL com o banco, e visualizações únicas com deduplicação — usuário logado ou localStorage.

**Slide 16 — Feed (demo ao vivo)**
> Este é o Artlink no ar, publicamente acessível. Aqui está o feed principal, com publicações dos artistas que sigo.

**Slide 17 — Perfil e catálogo (demo ao vivo)**
> Este é o perfil de um artista — bio, foto de capa, catálogos. Vou publicar uma obra rápida aqui — imagem, tags — mostrando o upload acontecendo de verdade via Cloudinary.

**Slide 18 — Mensagens e notificações (demo ao vivo)**
> Curto e comento essa publicação em tempo real — e já aparece a notificação gerada. Por fim, uma mensagem direta rápida.

**Slide 19 — Infraestrutura e deploy [APOIO]**
> *(Se usar:)* Render hospeda o servidor com build único; Supabase é o Postgres gerenciado com SSL; Cloudinary guarda e serve as imagens; Resend cuida do e-mail transacional.

**Slide 20 — Tecnologias utilizadas [APOIO]**
> *(Se usar:)* React, TypeScript, Vite e React Router no frontend; Node, Express, Prisma, bcrypt e JWT no backend; PostgreSQL no Supabase; Cloudinary; Resend; Render.

**Slide 21 — Resultados obtidos**
> Todos os objetivos específicos foram alcançados. Plataforma funcional em produção, API REST com 91 endpoints em 17 grupos funcionais, banco com 17 entidades, autenticação validada sem acesso indevido. O diferencial técnico: notificações combinadas com deduplicação de visualizações, pra métricas de engajamento precisas.

**Slide 22 — Considerações finais e trabalhos futuros**
> O Artlink foi desenvolvido, testado e implantado em produção — não ficou só no papel. O DSR permitiu ciclos iterativos de validação. Como trabalhos futuros: app nativo, e-commerce, eventos virtuais, recomendação por IA, e moderação de conteúdo.

**Slide 23 — Referências [APOIO]**
> *(Normalmente não se fala nada aqui — só deixar a banca ver, ou usar se pedirem a fonte de algo específico.)*

**Slide 24 — Encerramento**
> O Artlink contribui pra valorização do artesanato e da arte no ambiente digital brasileiro — um espaço pra se conectar antes de comercializar. Muito obrigado. Fico à disposição pra perguntas.

---

## Parte 2 — Perguntas prováveis da banca e respostas

**1. "O que muda de ter um Instagram e usar o Artlink, se o Instagram já tem posts, seguidores e comentários?"**
> O Instagram tem a mecânica social, mas não o fluxo de trabalho do artista. Falta portfólio nativo — no Artlink, catálogo é estrutura própria. Falta colaboração formal — o Instagram tem uma coautoria simples (Collabs), mas sem convite/aceite/recusa nem colaboração em nível de catálogo. E a audiência do Instagram é genérica, dispersa entre todo tipo de conteúdo — o Artlink não reinventa a roda social, adiciona a camada profissional que faltava.

**2. "91 endpoints não é muito?"**
> Não — é proporcional. Com 17 entidades, um CRUD básico já dá 5 endpoints por entidade (85), sobrando pouco mais de meia dúzia pra ações específicas (seguir, marcar notificação como lida, verificar e-mail, recuperar senha, buscar por hashtag). Não é um número arbitrário: é a contagem real das rotas no código (`src/routes.ts`), verificada linha a linha.

**3. "Por que hospedar no Render, por que Cloudinary, por que Resend?"**
> Cada escolha resolveu uma dificuldade real. Render porque permite subir direto do GitHub, com plano gratuito, sem configurar servidor do zero. Só que descobri na prática que o sistema de arquivos do Render é efêmero — a cada deploy, imagem salva localmente sumia. Migrei pro Cloudinary, que persiste e ainda funciona como CDN. Com e-mail, configurando SMTP direto tipo Gmail os e-mails de verificação caíam em spam — o Resend resolveu isso.

**4. "Por que não usar Firebase ou outro banco?"**
> Optei por PostgreSQL relacional porque o domínio tem relacionamentos bem definidos — usuário, post, catálogo, colaboração — que se beneficiam de chaves estrangeiras, integridade referencial e transações, algo que um banco NoSQL como o Firestore do Firebase não garante da mesma forma. O Supabase deu um Postgres gerenciado com SSL sem precisar administrar infraestrutura de banco.

**5. "Como funciona a autenticação?"**
> JWT (JSON Web Token) gerado no login, com senha armazenada como hash via bcrypt — nunca em texto puro. Cadastro exige verificação de e-mail por link com validade de 24h. Recuperação de senha usa código temporário enviado por e-mail. A conexão com o banco é SSL.

**6. "Por que não tem e-commerce?"**
> Foi uma escolha deliberada de escopo. O objetivo do Artlink é resolver a lacuna social/colaborativa que Etsy e ArtFinder não cobrem — não competir em e-commerce, onde essas plataformas já são maduras. Integração de venda direta está listada como trabalho futuro, mas o foco do TCC foi provar a tese de que existe espaço pra conexão antes de comercializar.

**7. "Como garantem a segurança e privacidade dos dados dos usuários (LGPD)?"**
> A arquitetura cobre os pilares básicos de segurança: senha com hash bcrypt, tokens JWT com expiração, conexão SSL com o banco, verificação de e-mail antes de liberar certas ações. Não implementei um módulo dedicado de conformidade total com a LGPD — como exportação e exclusão automatizada de dados — isso é um ponto de melhoria que reconheço e fica como trabalho futuro.

**8. "Por que Design Science Research e não Scrum ou outra metodologia ágil?"**
> DSR e Scrum não são excludentes — Scrum é gestão de processo (sprints, papéis), DSR é o framework que dá embasamento acadêmico pra criação e validação de um artefato tecnológico como resposta a um problema prático, que é exatamente o caso aqui. Na prática, os ciclos do DSR foram conduzidos de forma iterativa, parecida com sprints curtos.

**9. "A plataforma escala? O que aconteceria com mais usuários?"**
> A arquitetura já se apoia em serviços gerenciados pensados pra escalar independente do meu servidor: Supabase (Postgres) e Cloudinary (CDN). O ponto de atenção é o plano gratuito do Render, que hiberniza por inatividade — em produção real, um plano pago resolve isso. Como frontend e backend são desacoplados por uma API REST, também dá pra escalar ou separar os dois se precisar.

**10. "Por que não fizeram um aplicativo mobile nativo?"**
> O foco do TCC foi entregar uma experiência web completa e responsiva primeiro, validando o conceito antes de multiplicar plataformas. Como o backend já é uma API REST desacoplada, um app nativo — React Native, por exemplo — consumiria a mesma API sem reescrever backend nenhum. É o primeiro item dos trabalhos futuros.

**11. "Como foi validado/testado o sistema? Teve usuários reais testando?"**
> Foram feitos testes de integração cobrindo os fluxos principais — cadastro, login, publicação, colaboração — e testes de usabilidade com foco em garantir uma interface intuitiva pra diferentes níveis de familiaridade tecnológica. *(Personalize aqui se você testou com pessoas reais além de você mesmo — diga quantas, quem, o que ajustaram.)*

**12. "Qual foi a maior dificuldade técnica do projeto?"**
> *(Escolha a que for mais verdadeira pra você — duas opções prontas:)*
> - A migração forçada de armazenamento local pro Cloudinary, por causa do filesystem efêmero do Render — descobri isso já com o projeto rodando.
> - O sistema de deduplicação de visualizações, pra contar visualização única tanto de usuário logado quanto anônimo (localStorage) sem inflar métricas artificialmente.

---

## Checklist rápido antes de entrar
- [ ] Saber de cor os números: **91 endpoints**, **17 grupos funcionais**, **17 entidades**
- [ ] Ter a resposta do Instagram na ponta da língua (pergunta quase certa)
- [ ] Revisar a pergunta 11 e personalizar com sua experiência real de teste
- [ ] Escolher qual resposta usar na pergunta 12 (dificuldade técnica)
