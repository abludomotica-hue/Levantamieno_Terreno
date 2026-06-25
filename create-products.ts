import prisma from "./src/lib/prisma";

const PRODUCTS_DATA = [
  { sku: "CAM-IP-HIK4M-D", name: "Cámara IP Hikvision 4MP Domo", price: 45000, category: "camara", description: "Cámara domo IP de 4 megapíxeles, lente fija de 2.8mm, infrarrojo de 30m, apta para exterior (IP67)." },
  { sku: "CAM-IP-HIK4M-T", name: "Cámara IP Hikvision 4MP Tubo", price: 48000, category: "camara", description: "Cámara tipo bala IP de 4 megapíxeles, lente de 2.8mm, infrarrojo de 50m, apta para exterior (IP67)." },
  { sku: "CAM-WF-EZV-EX", name: "Cámara Wi-Fi Ezviz Exterior 1080p", price: 39900, category: "camara", description: "Cámara de seguridad inalámbrica Wi-Fi para exterior con defensa activa, audio bidireccional." },
  { sku: "NVR-HIK-4CH", name: "Grabador NVR Hikvision 4 Canales PoE", price: 75000, category: "grabador", description: "NVR de 4 canales de video con 4 puertos PoE independientes, soporte hasta 8MP por canal." },
  { sku: "NVR-HIK-8CH", name: "Grabador NVR Hikvision 8 Canales PoE", price: 110000, category: "grabador", description: "NVR de 8 canales de video con 8 puertos PoE independientes, salida de video 4K." },
  { sku: "HDD-WD-PURP1T", name: "Disco Duro WD Purple 1TB (CCTV)", price: 58000, category: "grabador", description: "Disco duro especializado de 1TB para almacenamiento de videovigilancia 24/7." },
  { sku: "HDD-WD-PURP2T", name: "Disco Duro WD Purple 2TB (CCTV)", price: 79000, category: "grabador", description: "Disco duro especializado de 2TB para almacenamiento continuo de videovigilancia." },
  { sku: "CAB-UTP-CAT6-100", name: "Bobina de Cable UTP Cat6 100m", price: 32000, category: "conectividad", description: "Bobina de 100 metros de cable de red UTP categoría 6 unifilar de cobre." },
  { sku: "CAB-UTP-METER", name: "Bobina de Cable UTP Cat6 (por metro)", price: 450, category: "conectividad", description: "Cable de red UTP Cat6 de cobre para tendidos por metro." },
  { sku: "SWI-POE-4CH", name: "Switch PoE 4 Canales Gigabit", price: 29000, category: "conectividad", description: "Switch de red con 4 puertos PoE y 2 puertos de enlace (Uplink) Gigabit." },
  { sku: "SWI-POE-8CH", name: "Switch PoE 8 Canales Gigabit", price: 49000, category: "conectividad", description: "Switch de red con 8 puertos PoE y 2 puertos de enlace Gigabit." },
  { sku: "ACC-CAJA-ESTAN", name: "Caja Estanca de Conexión CCTV", price: 2500, category: "alimentacion", description: "Caja de paso estanca para intemperie IP65 para proteger los conectores de las cámaras." },
  { sku: "POW-12V-5A", name: "Fuente de Poder 12V 5A + Pulpo 4 vías", price: 12000, category: "alimentacion", description: "Transformador de 12V 5A con cable distribuidor de alimentación para hasta 4 cámaras." },
  { sku: "POW-UPS-850", name: "UPS Interactiva 850VA / 480W", price: 48000, category: "alimentacion", description: "Unidad de respaldo de energía interactiva para mantener activos el NVR, router y cámaras." },
  { sku: "SRV-INST-CAM", name: "Servicio de Instalación y Configuración por Cámara", price: 25000, category: "mano_obra", description: "Montaje, cableado, canalización básica y ajuste de ángulo de visión por cámara." },
  { sku: "SRV-CONF-RED", name: "Configuración de Red y Visualización Móvil", price: 15000, category: "mano_obra", description: "Configuración del NVR/cámaras en la red del cliente y puesta en marcha en aplicación de celular." },
];

async function main() {
  console.log("🌱 Sembrando catálogo de productos estándar...");

  for (const item of PRODUCTS_DATA) {
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
      },
      create: {
        sku: item.sku,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
      },
    });
    console.log(`✅ Producto registrado: ${product.name} (SKU: ${product.sku}) - $${product.price}`);
  }

  console.log("🎉 Catálogo de productos sembrado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error al sembrar productos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
