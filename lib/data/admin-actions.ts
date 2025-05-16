'use server'
import { supabaseAdmin } from '../supabase/admin';
import { Database } from '../types/database.types';

// Dashboard Actions
export async function getDashboardStats() {
  // Obtener datos básicos
  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: usersCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Calcular fechas relevantes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Obtener órdenes y métricas
  const { data: currentMonthOrders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .gte('created_at', startOfMonth.toISOString());

  const { data: lastMonthOrders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', startOfMonth.toISOString());

  return {
    productsCount,
    usersCount,
    currentMonthOrders,
    lastMonthOrders
  };
}

// Orders Actions
export async function getOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      *,
      products (name, price)
    `)
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;

  return { order, items };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

// Products Actions
export async function getProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, variants(*), product_images(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(productData: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, productData: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  // Eliminar imágenes de detalle
  await supabaseAdmin
    .from('product_images')
    .delete()
    .eq('product_id', productId);

  // Eliminar variantes
  await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('product_id', productId);

  // Eliminar producto
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', productId);

  if (error) throw error;
}

// Categories Actions
export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getSubcategories(parentId: string) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createCategory(categoryData: any) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId: string, categoryData: any) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCategoryStatus(categoryId: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('categories')
    .update({ is_active: !isActive })
    .eq('id', categoryId);

  if (error) throw error;
}

// Users Actions
export async function getUsers() {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;
  return profiles || [];
}

export async function createUser(userData: any) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      full_name: userData.full_name,
      role: 'admin',
    },
  });

  if (error) throw error;
  return data;
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: !isActive })
    .eq('id', userId);

  if (error) throw error;
}