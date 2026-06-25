# Ablu Tech — Plataforma de Levantamiento Técnico

Este es el sistema premium para la recopilación de datos técnicos de terreno e inspecciones de seguridad física para la empresa **Ablu Tech**.

Desarrollado con Next.js 16 (App Router), Prisma 7, SQLite y Auth.js v5.

## 🚀 Requisitos e Instalación Local

### 1. Clonar e Instalar Dependencias
Instale las dependencias del proyecto:
```bash
npm install
```

### 2. Configurar Variables de Entorno
Cree un archivo `.env` en la raíz (puede duplicar `.env.example`):
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="Jq8f7B2z1wR5yX9vD4s3mN2kP6oI9uY8tX7rE6wQ5eR"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Migrar y Poblar la Base de Datos
Prisma 7 requiere configurar el archivo `prisma.config.ts`. Para aplicar las migraciones de base de datos e insertar los datos del semillero (usuario admin y cliente de muestra), ejecute:
```bash
# Sincronizar esquema y aplicar migraciones
npx prisma migrate dev --name init

# Generar cliente de Prisma
npx prisma generate

# Poblar base de datos (Semillero)
npx prisma db seed
```

### 4. Ejecutar el Servidor de Desarrollo
Inicie el servidor local:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) en su navegador para ver el resultado.

---

## 🔑 Credenciales de Acceso (Por Defecto)

- **Usuario**: `admin`
- **Contraseña**: `admin`

---

## 📱 Características Clave de la Plataforma
- **Diseño Mobile-First**: Optimizado ergonómicamente con barra de navegación inferior para uso ágil en terreno.
- **Captura GPS**: Geolocalización en tiempo real con un solo clic.
- **Asistente Wizard en 6 Pasos**: Completa de forma limpia las 15 secciones técnicas obligatorias sin saturar la pantalla.
- **Firma Digital**: Firma en pantalla integrada mediante HTML5 Canvas.
- **Formato de Impresión**: Exportación limpia a PDF o impresión física con estilos automáticos sin cabeceras web.
