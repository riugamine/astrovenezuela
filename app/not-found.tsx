import { Button } from '@/components/ui/button';
import { Meteors } from '@/components/magicui/meteors';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-primary to-black">
      {/* Efecto de meteoros */}
      <div className="absolute inset-0">
        <Meteors className="opacity-40" />
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-accent">404</h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-accent">
            ¡Ups! Parece que estás perdido
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            No pudimos encontrar la página que estás buscando. ¿Quizás quieras volver al inicio?
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-accent text-primary hover:bg-primary-foreground hover:text-primary transition-all group text-base"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <FontAwesomeIcon
              icon={faHome}
              className="group-hover:scale-110 transition-transform"
            />
            Volver al Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}