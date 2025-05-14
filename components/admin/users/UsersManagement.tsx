'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";

export default function UsersManagement() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Gestión de Usuarios
            </h1>
            <Button 
              onClick={() => setIsCreating(true)}
              className="w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nuevo Administrador
            </Button>
          </div>
        </CardContent>
      </Card>

      {isCreating ? (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <UserForm onClose={() => setIsCreating(false)} />
          </CardContent>
        </Card>
      ) : (
        <UserList />
      )}
    </div>
  );
}