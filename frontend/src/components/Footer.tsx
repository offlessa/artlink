import { Link } from "react-router-dom";
import "../styles/components/Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__logo-wrap">
            <img src="/artlink-icon.png" className="footer__logo-icon" alt="" />
            <div>
              <div className="footer__logo">Artlink</div>
              <div className="footer__logo-sub">online gallery</div>
            </div>
          </div>
          <div className="footer__deco" />
          <p className="footer__tagline">
            Conectando a arte através do sentimento e da criação artesanal.
          </p>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Navegação</span>
          <Link to="/" className="footer__link">Home</Link>
          <Link to="/busca" className="footer__link">Explorar</Link>
          <Link to="/perfil" className="footer__link">Meu perfil</Link>
          <Link to="/sobre" className="footer__link">Sobre nós</Link>
        </div>

        <div className="footer__col">
          <span className="footer__col-title">Contato</span>
          <span className="footer__text">artlink@email.com</span>
          <span className="footer__text">Instagram: @artlink</span>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copy">© 2025 Artlink. Todos os direitos reservados.</span>
        <span className="footer__mark">Designed by Guilherme Madruga</span>
      </div>
    </footer>
  );
}
