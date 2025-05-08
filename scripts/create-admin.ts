const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const { z } = require('zod');
const readline = require('readline');
const path = require('path');

// Cargar variables de entorno desde la raíz del proyecto
config({ path: path.resolve(__dirname, '../.env') });

// Validar variables de entorno requeridas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno requeridas no encontradas');
  console.log('Por favor, asegúrate de tener las siguientes variables en tu archivo .env:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase con validación
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Schema de validación para el administrador
const adminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres')
});


// Interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string) => {
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

    if (authError) {
      console.error('Error detallado:', {
        status: authError.status,
        message: authError.message,
        name: authError.name,
        details: authError
      });
      throw authError;
    }

    if (!authData?.user) {
      throw new Error('No se pudo crear el usuario - respuesta vacía');
    }

    console.log('Usuario creado:', {
      id: authData.user.id,
      email: authData.user.email,
      role: authData.user.role
    });

    // Actualizar rol en la tabla de perfiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'admin',
      })
      .single();

    if (profileError) {
      console.error('Error al crear perfil:', profileError);
      throw profileError;
    }

    console.log('✅ Administrador creado exitosamente');
  } catch (error: any) {
    console.error('❌ Error creando administrador:', error);
    if (error.message) {
      console.error('Mensaje de error:', error.message);
    }
  } finally {
    rl.close();
  }
}

createAdmin();