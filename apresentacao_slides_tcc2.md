# ARTLINK — Slides de Apresentação (TCC 2)
### Conteúdo atualizado para recolar no template do Canva (TCC 1)

> **Identidade visual a manter:** paleta verde-oliva escuro / preto / branco / detalhe amarelo mostarda; setas `→ → →` no canto superior esquerdo de cada slide; numeração de página no rodapé direito; títulos em caixa alta, bold, fonte sem serifa (estilo Poppins/Montserrat).
> Cada `## Slide N` abaixo corresponde a 1 slide no Canva. Onde o layout mudar em relação ao original, isso está indicado em *Layout:*.

---

## Slide 1 — Capa

**Layout:** igual ao original (fundo escuro à esquerda, foto de artesanato à direita, faixa verde com dados do aluno).

- **Título:** TRABALHO DE CONCLUSÃO DE CURSO
- **Subtítulo:** Rede social para artistas e artesãos: **Artlink**
- Aluno: *Guilherme M. B. L. Martins*
- Orientador: *Fabrício Bueno Borges dos Santos*
- Curso Superior em Análise e Desenvolvimento de Sistemas
- *(trocar apenas o rodapé da capa original de "TCC 1" para "TCC 2 — Artigo Final")*

---

## Slide 2 — Introdução / O problema

**Layout:** duas colunas, igual ao original (verde à esquerda = texto de contexto; escuro à direita = definição em destaque).

**Coluna esquerda — INTRODUÇÃO**
O crescimento das redes sociais digitais transformou a forma como artistas e artesãos divulgam seu trabalho. Plataformas generalistas, como o Instagram, não foram pensadas para as necessidades específicas do universo artesanal: gestão de portfólio, colaboração entre criadores e organização de catálogos.

**Coluna direita — A LACUNA**
"Plataformas de nicho como Etsy e ArtFinder resolvem o comércio, mas não têm componente social. Redes sociais generalistas têm o social, mas não têm portfólio nem colaboração. Falta uma plataforma que **conecte antes de comercializar**."

---

## Slide 3 — Motivações

**Layout:** igual ao original (lista de bullets à esquerda em fundo verde).

- Ausência de uma rede social **específica** para o universo criativo/artesanal
- Necessidade de **organização de portfólio** (catálogos, coleções) integrada à divulgação
- **Colaboração entre artistas** em obras e catálogos, algo não oferecido por concorrentes
- Preservação e valorização da produção artística e artesanal no ambiente digital brasileiro

---

## Slide 4 — Pergunta de pesquisa e objetivo geral

**Layout:** igual ao original (bloco de destaque à direita, fundo escuro).

**Pergunta de pesquisa:**
"Como uma plataforma digital pode potencializar a visibilidade, o networking e a colaboração entre artistas e artesãos, unindo funcionalidades de rede social a ferramentas próprias do contexto criativo?"

**Objetivo geral:**
Desenvolver e implantar em produção uma plataforma de rede social para artistas e artesãos, com funcionalidades que promovam divulgação, interação e colaboração no setor criativo.

---

## Slide 5 — Objetivos específicos

**Layout:** igual ao original (3-4 cards com ícone, lado a lado).

1. **Rede social:** publicação de obras com imagens, curtidas, comentários, seguidores e feed personalizado.
2. **Portfólio e colaboração:** catálogos de obras e convites de colaboração entre artistas.
3. **API segura:** autenticação via JWT com verificação de e-mail.
4. **Produção em nuvem:** plataforma implantada com infraestrutura inteiramente em nuvem, com interface responsiva e acessível.

---

## Slide 6 — Trabalhos correlatos (Instagram, Etsy e ArtFinder)

**Layout:** três colunas de texto (era duas — adicionar Instagram como referência generalista).

**Instagram**
- Rede social generalista mais usada por artistas hoje para divulgar trabalho.
- **Pontos fortes:** feed, seguidores, curtidas e comentários já consolidados; grande alcance; tem coautoria básica em posts (Collabs).
- **Pontos fracos:** sem portfólio nativo, sem fluxo formal de convite/aceite de colaboração (só coautoria simples), audiência genérica e dispersa entre todo tipo de conteúdo.

**Etsy**
- Um dos maiores marketplaces globais para produtos artesanais e vintage, lançado em 2005.
- **Pontos fortes:** grande audiência global, lojas personalizáveis.
- **Pontos fracos:** foco comercial, quase nenhuma interação social entre criadores; taxas por listagem/transação.

**ArtFinder**
- Plataforma curada, focada em arte e artesanato exclusivo, lançada em 2013.
- **Pontos fortes:** curadoria, experiência de compra personalizada.
- **Pontos fracos:** processo de seleção rigoroso; sem seguidores, feed ou interação social.

---

## Slide 7 — Comparativo: Instagram x Etsy x ArtFinder x Artlink

**Layout:** igual ao original (tabela em fundo escuro, "X" marcando o que cada plataforma tem) — adicionar coluna Instagram.

| Funcionalidade | Instagram | Etsy | ArtFinder | Artlink |
|---|---|---|---|---|
| Feed social e publicações | Sim | Não | Não | **Sim** |
| Sistema de seguidores | Sim | Não | Não | **Sim** |
| Mensagens diretas | Sim | Parcial | Não | **Sim** |
| Colaboração entre artistas | Parcial | Não | Não | **Sim** |
| Catálogos/coleções de obras | Não | Parcial | Sim | **Sim** |
| Curtidas e comentários | Sim | Não | Parcial | **Sim** |
| Notificações | Sim | Sim | Parcial | **Sim** |
| Busca por hashtags | Sim | Parcial | Não | **Sim** |
| Gestão de estoque/vendas | Não | Sim | Sim | Não |

*Fala:* "o Instagram tem a mecânica social e até uma coautoria simples, mas não foi desenhado pro fluxo de trabalho do artista — falta portfólio e um fluxo formal de colaboração. O Artlink não compete em e-commerce nem em alcance genérico, compete em conexão entre criadores."

---

## Slide 8 — Artlink: visão geral

**Layout:** igual ao original (texto à esquerda, screenshots reais da plataforma à direita — trocar as fotos de artesanato por prints do app).

**Visão geral:**
O Artlink é uma plataforma de rede social construída para artistas e artesãos, combinando publicação de obras, curtidas, comentários e seguidores com ferramentas próprias do contexto criativo: catálogos, colaboração entre artistas e busca por hashtags.

*(Usar como imagem: `Imagens/tela_feed_artlink_compressed.jpg`)*

---

## Slide 9 — Metodologia (Design Science Research)

**Layout:** novo slide, no estilo dos cards do slide "Objetivos" (4 etapas em sequência com setas).

1. **Levantamento de requisitos** — necessidades de artesãos e artistas mapeadas e priorizadas.
2. **Prototipagem** — interfaces desenhadas no Figma, com foco em UX e acessibilidade.
3. **Implementação** — React no frontend, Node.js/Express no backend, ecossistema JavaScript/TypeScript em VS Code.
4. **Validação** — testes de integração e usabilidade + implantação real em produção (Render.com).

---

## Slide 10 — Arquitetura do sistema

**Layout:** novo slide (substituindo "Requisitos Funcionais" antigo) — diagrama de arquitetura ao centro/direita, texto de apoio à esquerda.

- Arquitetura **cliente-servidor**: frontend SPA + API REST.
- **Frontend:** React 18 + TypeScript + Vite + React Router
- **Backend:** Node.js + Express 5 + TypeScript + Prisma 6
- **Banco de dados:** PostgreSQL (Supabase) — 17 entidades
- **Imagens:** Cloudinary (CDN)
- **E-mail transacional:** Resend API
- **Deploy:** Render.com — build único (frontend estático servido pelo Express)

*(Reaproveitar o diagrama de arquitetura gerado no tcc_artlink.tex, Figura 1)*

---

## Slide 11 — Modelagem de dados

**Layout:** diagrama à direita, texto explicativo à esquerda. Usar o "Diagrama simplificado do modelo relacional do banco de dados" (`tcc_artlink.tex`, `fig:diagrama_banco`) — não o diagrama de classes completo (denso demais para o slide).

- Banco relacional modelado com **Prisma ORM**, **17 entidades**.
- Principais entidades: `Usuario`, `Post`, `Catalogo`, `Curtida`, `Comentario`, `Seguidor`, `Mensagem`, `Notificacao`, `PostColaboracao`, `PostSalvo`, `Visualizacao`.
- Relacionamentos-chave (batendo com o diagrama):
  1. Usuário — Post e Usuário — Catálogo: um-para-muitos
  2. Post — Curtida e Post — Comentário: um-para-muitos
  3. Usuário — Seguidor — Usuário: muitos-para-muitos (grafo social)
  4. Colaboração entre artistas (`PostColaboracao`): muitos-para-muitos, numa tabela à parte — não representada neste diagrama simplificado

---

## Slide 12 — Casos de uso

**Layout:** igual ao original (diagrama UML de casos de uso).

- **Atores:** Visitante e Usuário Autenticado (autenticado herda ações do visitante).
- **Visitante:** visualizar perfis, buscar artistas, navegar por hashtags.
- **Usuário autenticado:** publicar obra, criar catálogo, curtir e comentar, seguir artista, enviar mensagem, gerenciar perfil.

---

## Slide 13 — Funcionalidades: autenticação e publicações

**Layout:** igual ao slide "Requisitos Funcionais" (lista numerada com setas amarelas, RF001 → RF005).

- **[RF001] Cadastro:** com verificação de e-mail (link com validade de 24h via Resend).
- **[RF002] Login:** por e-mail ou nome de usuário, com JWT.
- **[RF003] Recuperação de senha:** código temporário enviado por e-mail.
- **[RF004] Publicar obra:** múltiplas imagens (Cloudinary), título, descrição, tags.
- **[RF005] Colaboração:** convites de colaboração entre artistas em uma mesma obra.

---

## Slide 14 — Funcionalidades: interação e organização

**Layout:** igual ao slide "Requisitos Funcionais" (RF006 → RF010).

- **[RF006] Curtidas e comentários** em publicações.
- **[RF007] Seguidores:** follow/unfollow e feed personalizado.
- **[RF008] Catálogos:** criação de coleções/portfólios com colaboração.
- **[RF009] Mensagens diretas:** texto e imagem, edição, exclusão, arquivamento.
- **[RF010] Notificações:** automáticas para curtida, comentário, seguidor, colaboração e mensagem.

---

## Slide 15 — Funcionalidades: busca, perfil e requisitos não funcionais

**Layout:** igual ao slide "Requisitos Não Funcionais".

- **Busca e descoberta:** texto, hashtags e sugestões de artistas.
- **Perfil personalizado:** foto, capa, bio, cidade, tema claro/escuro.
- **Controle de visualizações:** visualizações únicas com deduplicação (usuário logado + localStorage).
- **Usabilidade:** interface intuitiva para todos os níveis de familiaridade tecnológica.
- **Segurança:** senha com hash (bcrypt), tokens JWT, conexão SSL com o banco.
- **Desempenho:** CDN para imagens, build otimizado com Vite.

---

## Slide 16 — Telas reais da plataforma: Feed

**Layout:** igual ao slide de "Prototipagem — tela de menu inicial", mas com **screenshot real** da aplicação em produção (não mais wireframe).

*(Imagem: `Imagens/tela_feed_artlink_compressed.jpg`)*
- Feed principal com publicações de artistas seguidos, busca por artistas/hashtags, botão de perfil.

---

## Slide 17 — Telas reais da plataforma: Perfil e Catálogo

**Layout:** igual ao slide "Prototipagem — galeria com usuário logado", com screenshot real do perfil do artista e de um catálogo/coleção de obras.

---

## Slide 18 — Telas reais da plataforma: Mensagens e Notificações

**Layout:** igual ao slide "Prototipagem — visualização de postagem", com screenshot real da caixa de mensagens diretas e do painel de notificações.

---

## Slide 19 — Infraestrutura e deploy

**Layout:** novo slide substituindo "Cronograma" (projeto já concluído — não faz mais sentido mostrar Gantt de planejamento).

- **Render.com:** hospedagem do servidor Node.js; build único (frontend estático servido pelo Express).
- **Supabase:** PostgreSQL gerenciado, conexão SSL.
- **Cloudinary:** armazenamento e CDN de imagens.
- **Resend:** envio transacional de e-mails (verificação de conta, redefinição de senha).
- Build automatizado: `npm run build` compila frontend, gera cliente Prisma, transpila backend e empacota tudo em um único artefato de produção.

---

## Slide 20 — Tecnologias utilizadas

**Layout:** igual ao original ("Tecnologias Utilizadas"), lista atualizada.

- **Frontend:** React 18.2, TypeScript 5.9, Vite 5.1, React Router 7.9, Axios, SASS
- **Backend:** Node.js + Express 5, TypeScript, Prisma ORM 6.15, bcrypt, jsonwebtoken
- **Banco de dados:** PostgreSQL (Supabase)
- **Armazenamento:** Cloudinary
- **E-mail:** Resend API
- **Hospedagem:** Render.com

---

## Slide 21 — Resultados obtidos

**Layout:** igual ao original ("Resultados Esperados"), mas em tempo passado — já alcançados.

- Plataforma **funcional em produção**, acessível publicamente
- API REST com **91 endpoints**, organizados em **17 grupos funcionais**
- Banco de dados relacional com **17 entidades**
- Autenticação JWT + verificação de e-mail validada, sem acessos indevidos
- Armazenamento em nuvem (Cloudinary) eliminando gestão de disco no servidor
- Sistema de notificações + deduplicação de visualizações → métricas de engajamento precisas
- Interface responsiva testada em diferentes tamanhos de tela
- Única entre as três plataformas comparadas que une rede social + ferramentas para artesãos

---

## Slide 22 — Considerações finais e trabalhos futuros

**Layout:** igual ao original ("Conclusão").

O Artlink foi desenvolvido, testado e implantado em produção, com todos os objetivos específicos alcançados. O uso do Design Science Research permitiu ciclos iterativos de validação que aprimoraram continuamente a solução.

**Trabalhos futuros:**
- Aplicativo nativo (iOS/Android)
- Integração de e-commerce (venda direta pela plataforma)
- Sistema de eventos e exposições virtuais
- Recomendação por IA de obras/artistas
- Moderação de conteúdo (revisão manual + IA, ex.: Amazon Rekognition/WebPurify)

---

## Slide 23 — Referências

**Layout:** igual ao original.

- ARTFINDER. *Artfinder: the global marketplace for original art.* London: Artfinder, 2024.
- CASTELLS, Manuel. *A sociedade em rede.* 17. ed. São Paulo: Paz & Terra, 2016.
- ETSY. *Etsy: compre produtos artesanais, vintage e exclusivos.* Nova York: Etsy, Inc., 2024.
- RECUERO, Raquel. *Redes sociais na internet.* Porto Alegre: Sulina, 2009.
- HEVNER, A. R. et al. Design Science in Information Systems Research. *MIS Quarterly*, 2004.
- React, TypeScript e Prisma — documentações oficiais, 2024.

---

## Slide 24 — Encerramento

**Layout:** igual ao slide "Obrigado" original.

- **OBRIGADO**
- Trabalho de Conclusão de Curso (TCC 2)
- ARTLINK — Rede social para artistas e artesãos
