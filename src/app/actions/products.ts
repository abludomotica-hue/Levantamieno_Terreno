'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface ProductData {
  sku: string
  name: string
  price: number
  category: string
  description?: string
}

/**
 * Obtiene todos los productos del catálogo.
 */
export async function getProducts() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  return prisma.product.findMany({
    orderBy: { name: 'asc' },
  })
}

/**
 * Crea un nuevo producto en el catálogo.
 */
export async function createProduct(data: ProductData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
    throw new Error('No autorizado para gestionar el catálogo')
  }

  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      price: Number(data.price),
      category: data.category,
      description: data.description || null,
    },
  })

  revalidatePath('/catalog')
  return product
}

/**
 * Actualiza los datos de un producto.
 */
export async function updateProduct(id: string, data: ProductData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
    throw new Error('No autorizado')
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: data.sku,
      name: data.name,
      price: Number(data.price),
      category: data.category,
      description: data.description || null,
    },
  })

  revalidatePath('/catalog')
  return product
}

/**
 * Elimina un producto del catálogo.
 */
export async function deleteProduct(id: string) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
    throw new Error('No autorizado')
  }

  await prisma.product.delete({
    where: { id },
  })

  revalidatePath('/catalog')
}
