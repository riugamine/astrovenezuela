import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001730] via-[#32217A] to-[#7F98C9] p-4">
      <Card className="w-full max-w-sm bg-white/95 dark:bg-primary/20 text-primary backdrop-blur-sm shadow-lg py-6">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#001730]/10 p-4">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="h-8 w-8 text-[#001730]" 
              />
            </div>
          </div>
          <CardTitle className="text-center text-xl font-medium">
            Verifica tu correo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-primary">
            Te hemos enviado un enlace de verificación.
            Revisa tu bandeja de entrada.
          </p>
          <Link href="/auth" className="block">
            <Button 
              variant="outline" 
              className="w-full hover:bg-[#001730] hover:text-white transition-colors"
            >
              Volver
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}