import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <Link href="/">
              <img src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/sign/brand-assets/brand-logo/Logotipo_Blanco-03.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzA5NTExMDNjLTY3ZjgtNDYwNS1hZDc3LTE5YmEwYTM0NjdiMiJ9.eyJ1cmwiOiJicmFuZC1hc3NldHMvYnJhbmQtbG9nby9Mb2dvdGlwb19CbGFuY28tMDMucG5nIiwiaWF0IjoxNzQ2MjA2ODk4LCJleHAiOjIwNjE1NjY4OTh9.Zw5i81ImCL8wJZdFWwXY2u3OlrA2qNZcMzboE99UlrI" alt="Astro" className="h-12 mb-4" />
            </Link>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="hover:underline">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:underline">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces generales */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/productos" className="hover:underline">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline">
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="font-semibold mb-4">Síguenos</h3>
            <a 
              href="https://instagram.com/joseangelweb_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:text-accent"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm">
          <p>
            astrovenezuela.com © {new Date().getFullYear()} - Todos los derechos reservados
          </p>
          <p className="mt-2">
            Powered by{' '}
            <a 
              href="https://instagram.com/joseangelweb_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @joseangelweb_
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;