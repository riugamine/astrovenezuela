import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { z } from 'zod';
import readline from 'readline';

// Cargar variables de entorno
config();

// Schema de validación para el administrador
const adminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres')
});

// Crear cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  try {
    // Recopilar información del administrador
    const email = await question('Email del administrador: ');
    const password = await question('Contraseña: ');
    const fullName = await question('Nombre completo: ');

    // Validar datos
    const adminData = adminSchema.parse({
      email,
      password,
      fullName
    });

    // Crear usuario en Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.fullName,
        role: 'admin'
      }
    });

    if (authError) throw authError;

    // Actualizar rol en la tabla de perfiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (profileError) throw profileError;

    console.log('✅ Administrador creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    rl.close();
  }
}

createAdmin();