import Footer from "../components/Footer";
import "../styles/components/Sobre.scss";

export default function Sobre() {
  return (
    <div className="sobre">

      {/* HERO */}
      <section className="sobre__hero">
        <h1 className="sobre__titulo">Sobre a ArtLink</h1>
        <p className="sobre__subtitulo">
          O elo entre artistas e o mundo que admira sua arte.
        </p>
      </section>

      {/* O QUE É */}
      <section className="sobre__bloco sobre__bloco--claro">
        <div className="sobre__conteudo">
          <h2>O que é a ArtLink?</h2>
          <p>
            A ArtLink é uma plataforma criada para artistas e artesãos que querem mostrar seu
            trabalho, conectar-se com outros criadores e construir uma comunidade em torno da
            arte manual brasileira. Aqui, cada publicação é uma obra — e cada perfil, um ateliê.
          </p>
          <p>
            Seja você um ceramista, bordadeira, escultor em madeira, joalheiro ou artista de
            qualquer linguagem, a ArtLink é o seu espaço para existir, ser visto e colaborar.
          </p>
        </div>
      </section>

      {/* MISSÃO / VALORES */}
      <section className="sobre__bloco sobre__bloco--escuro">
        <div className="sobre__conteudo">
          <h2>Nossa missão</h2>
          <p>
            Acreditamos que a arte manual carrega identidade, território e memória. Nossa missão
            é amplificar essas vozes criativas, dar visibilidade ao trabalho artesanal e aproximar
            quem faz de quem aprecia.
          </p>
          <div className="sobre__valores">
            <div className="sobre__valor">
              <span className="sobre__valor-icone">✦</span>
              <h3>Autenticidade</h3>
              <p>Valorizamos o processo tão quanto o produto. Cada imperfeição conta uma história.</p>
            </div>
            <div className="sobre__valor">
              <span className="sobre__valor-icone">✦</span>
              <h3>Colaboração</h3>
              <p>A arte cresce quando é compartilhada. Aqui, obras podem ter dois nomes.</p>
            </div>
            <div className="sobre__valor">
              <span className="sobre__valor-icone">✦</span>
              <h3>Comunidade</h3>
              <p>Seguidores, curtidas e comentários constroem laços reais entre artistas e admiradores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="sobre__bloco sobre__bloco--claro">
        <div className="sobre__conteudo">
          <h2>O que você encontra aqui</h2>
          <ul className="sobre__lista">
            <li><strong>Portfólio digital</strong> — publique suas obras com imagem, título e descrição, e organize tudo em catálogos temáticos.</li>
            <li><strong>Feed de exploração</strong> — descubra artistas e obras de diferentes linguagens e regiões do país.</li>
            <li><strong>Colaborações</strong> — convide outro artista para assinar uma obra junto e que ela apareça no perfil dos dois.</li>
            <li><strong>Conexões reais</strong> — siga artistas que te inspiram, comente, curta e troque mensagens diretamente.</li>
            <li><strong>Perfil personalizado</strong> — escolha cores, texturas e layouts para que seu perfil reflita sua identidade artística.</li>
          </ul>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className="sobre__bloco sobre__bloco--destaque">
        <div className="sobre__conteudo sobre__conteudo--centro">
          <h2>Faça parte</h2>
          <p>
            A ArtLink está em construção junto com a comunidade que a habita. Se você cria,
            se você admira, ou se você simplesmente acredita que a arte manual merece mais
            espaço no mundo digital — você pertence aqui.
          </p>
          <a href="/cadastro" className="sobre__cta">Criar minha conta</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
