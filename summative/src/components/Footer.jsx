import './Footer.css';

function Footer() {
  return (
     <footer className="footerSection">
      <div className="footerGroup">
        <h3 className="footerTitle">Explore</h3>
        <ul className="footerLinks">
         <li><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="footerLink">Youtube</a></li>
          <li><a href="https://github.com/Yikun000" target="_blank" rel="noopener noreferrer" className="footerLink">GitHub</a></li>
          <li><a href="https://www.google.com/" target="_blank" rel="noopener noreferrer" className="footerLink">Google</a></li>
        </ul>
      </div>
      <div className="footerGroup">
        <h3 className="footerTitle">Connect</h3>
        <ul className="footerLinks">
          <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footerLink">Instagram</a></li>
          <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footerLink">Twitter</a></li>
          <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footerLink">Facebook</a></li>
        </ul>
      </div>
      <div className="footerCopyright">
        <h5>© 2025 WOOFLIX. All rights reserved.</h5>
      </div>
    </footer>
  );
}

export default Footer;