import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#32217A] to-[#7F98C9] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FontAwesomeIcon icon={faEnvelope} className="h-12 w-12 text-[#001730] mb-4" />
          <CardTitle>Verifica tu correo electrónico</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Hemos enviado un enlace de verificación a tu correo electrónico.
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Link href="/auth">
            <Button variant="outline" className="w-full">
              Volver al inicio de sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}