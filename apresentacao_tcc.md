# Apresentação TCC — Artlink
### Roteiro para 15 minutos (+ tempo de perguntas)

> Baseado no artigo `tcc_artlink.tex`. Cada bloco abaixo = 1 slide. Tempos são estimativas — ajuste no ensaio (ideal: ensaiar com cronômetro pelo menos 2x).

---

## 1. Capa (0:00 – 0:30) — 30s
- Título: **ARTLINK — Rede social para artistas e artesãos**
- Nome, curso (CST ADS), orientador, IFSC Câmpus Tubarão
- *Fala:* uma frase de abertura, sem ler o slide.

---

## 2. Problema e motivação (0:30 – 2:00) — 1min30
- Redes sociais generalistas (Instagram) não atendem às necessidades específicas de artesãos: gestão de portfólio, colaboração, catálogos.
- Plataformas de nicho (**Etsy**, **ArtFinder**) resolvem comércio, mas **não têm componente social**.
- Lacuna: falta uma plataforma que **conecte antes de comercializar**.

---

## 3. Objetivos (2:00 – 3:00) — 1min
**Objetivo geral:** desenvolver e implantar em produção uma rede social para artistas e artesãos.

**Específicos** (bullets rápidos):
- Funcionalidades de rede social (posts, curtidas, comentários, seguidores, feed)
- Organização de portfólio (catálogos, colaboração entre artistas)
- API REST segura (JWT + verificação de e-mail)
- Deploy em produção, infraestrutura em nuvem
- Interface responsiva e acessível

---

## 4. Comparativo com o mercado (3:00 – 4:00) — 1min
Mostrar a tabela comparativa (Etsy x ArtFinder x Artlink):
- Etsy e ArtFinder → fortes em comércio, fracos em social
- Artlink → único com feed, seguidores, colaboração e DM completos
- *Fala:* "o Artlink não compete em e-commerce, compete em conexão entre criadores"

---

## 5. Metodologia (4:00 – 4:45) — 45s
- **Design Science Research (DSR)** — 4 etapas iterativas:
  1. Levantamento de requisitos
  2. Prototipagem (Figma)
  3. Implementação (React no frontend, Node.js/Express no backend, JS/TS em VS Code)
  4. Validação (testes + deploy real)

---

## 6. Arquitetura e tecnologias (4:45 – 6:00) — 1min15
Mostrar o diagrama de arquitetura do TCC (Figura 1).
- **Frontend:** React 18 + TypeScript + Vite + React Router
- **Backend:** Node.js + Express 5 + TypeScript + Prisma 6
- **Banco:** PostgreSQL (Supabase) — 17 entidades
- **Imagens:** Cloudinary (CDN)
- **E-mail:** Resend API
- **Deploy:** Render.com — build único (frontend estático servido pelo Express)

---

## 7. Modelagem de dados (6:00 – 6:45) — 45s
- 17 entidades relacionais: Usuario, Post, Catalogo, Curtida, Comentario, Seguidor, Mensagem, Notificacao, PostColaboracao, PostSalvo, Visualizacao...
- **91 endpoints REST** em 17 grupos funcionais
- *Fala rápida, não ler campo por campo* — só mostrar o diagrama simplificado.

---

## 8. Funcionalidades implementadas (6:45 – 8:00) — 1min15
Bullets, agrupados por módulo:
- **Autenticação:** cadastro c/ verificação de e-mail, login por e-mail ou username, recuperação de senha, JWT
- **Publicações:** múltiplas imagens, tags, convites de colaboração
- **Social:** curtidas, comentários, seguidores, feed personalizado
- **Catálogos:** portfólios/coleções colaborativas
- **Mensagens diretas:** texto e imagem, edição, exclusão, arquivamento
- **Notificações** automáticas
- **Busca:** texto, hashtags, sugestões de artistas
- **Perfil:** foto, capa, bio, tema claro/escuro
- **Visualizações únicas** com deduplicação (usuário logado + localStorage)

---

## 9. DEMONSTRAÇÃO AO VIVO — software pronto (8:00 – 11:00) — 3min
**A parte mais importante para a banca: mostrar que funciona de verdade em produção.**

Roteiro sugerido de navegação (ensaiar a sequência antes, ter login já pronto):
1. Abrir `https://artlink-iwq1.onrender.com/` — mostrar que está no ar
2. Feed principal — publicações de artistas seguidos
3. Perfil de um artista — bio, foto de capa, catálogos
4. Publicar uma obra rápida (imagem + tags) — mostrar upload no Cloudinary
5. Curtir / comentar em tempo real
6. Abrir notificações geradas pela ação anterior
7. Mensagens diretas — enviar uma mensagem rápida
8. (Opcional, se sobrar tempo) tema claro/escuro, busca por hashtag

> **Dica:** grave um vídeo de backup de 2min da demo, caso a internet falhe na apresentação. Isso é essencial — não dependa só do ao vivo.

---

## 10. Resultados obtidos (11:00 – 13:00) — 2min
- Todos os objetivos específicos foram alcançados
- Plataforma **funcional em produção**, acessível publicamente
- API REST: **91 endpoints**, 17 grupos funcionais
- Banco relacional: **17 entidades**
- Autenticação JWT + verificação de e-mail — validada, sem acessos indevidos
- Cloudinary eliminou gestão de armazenamento local → mais escalável
- Diferencial técnico: sistema de notificações + deduplicação de visualizações → métricas de engajamento precisas
- Interface responsiva testada em diferentes tamanhos de tela
- Único entre as 3 plataformas comparadas que une rede social + ferramentas para artesãos

---

## 11. Considerações finais (13:00 – 13:45) — 45s
- Objetivo geral alcançado: plataforma desenvolvida, testada e implantada
- DSR se mostrou adequado — permitiu ciclos iterativos de validação
- Arquitetura cliente-servidor (SPA + API REST) entregou experiência comparável a redes sociais consolidadas

---

## 12. Trabalhos futuros (13:45 – 14:30) — 45s
- Aplicativo nativo (iOS/Android)
- Integração de e-commerce (venda direta pela plataforma)
- Sistema de eventos e exposições virtuais
- Recomendação por IA (obras/artistas com base em comportamento do usuário)
- Sistema de denúncia e moderação de conteúdo (revisão manual + análise automática de imagens via IA, ex.: Amazon Rekognition/WebPurify)

---

## 13. Encerramento (14:30 – 15:00) — 30s
- "O Artlink contribui para a valorização do artesanato e da arte no ambiente digital brasileiro."
- Agradecimentos + abrir para perguntas da banca

---

## Checklist antes da apresentação
- [ ] Testar login e ter conta de demonstração pronta (com posts, seguidores, mensagens já existentes para não depender de criar tudo do zero)
- [ ] Gravar vídeo de backup da demo (caso internet/servidor Render "dorma" — plano free hiberniza após inatividade, considerar dar um "ping" no site minutos antes)
- [ ] Preparar 2-3 respostas para perguntas prováveis: "por que não usar Firebase/outro banco?", "como funciona a autenticação?", "por que não tem e-commerce?"
- [ ] Cronometrar o ensaio completo pelo menos 2x
