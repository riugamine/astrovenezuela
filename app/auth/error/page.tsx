import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#32217A] to-[#7F98C9] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-red-500 mb-4" />
          <CardTitle>Error de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Ha ocurrido un error durante el proceso de autenticación.
            Por favor, intenta nuevamente.
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