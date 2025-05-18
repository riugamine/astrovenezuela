import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { getBrandLogo } from "@/lib/utils";
import  Image  from "next/image"

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center">
              <Image 
                src={getBrandLogo("blanco")} 
                alt="Astro" 
                width={120}
                height={40}
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
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
                <Link href="/categories" className="hover:underline">
                  Categorias
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
            astrovenezuela.com © {new Date().getFullYear()} - Todos los derechos
            reservados
          </p>
          <p className="mt-2">
            Powered by{" "}
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
