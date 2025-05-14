'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { toast } from "sonner";

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  onClose: () => void;
}

export function UserForm({ onClose }: UserFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const createUser = useMutation({
    mutationFn: async (data: UserFormData) => {
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          role: 'admin',
        },
      });

      if (error) throw error;
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Administrador creado exitosamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error al crear el administrador:', error);
      toast.error('Error al crear el administrador');
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createUser.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input {...field} 
                onChange={(e) => field.onChange(e.target.value)}
                value={ field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} 
                onChange={(e) => field.onChange(e.target.value)}
                value={ field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} 
                onChange={(e) => field.onChange(e.target.value)}
                value={ field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? 'Creando...' : 'Crear Administrador'}
          </Button>
        </div>
      </form>
    </Form>
  );
}