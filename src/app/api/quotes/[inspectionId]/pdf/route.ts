import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function formatCLP(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CL')}`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inspectionId: string }> }
) {
  const { inspectionId } = await params

  const quote = await prisma.quote.findUnique({
    where: { inspectionId },
    include: {
      items: { orderBy: { name: 'asc' } },
      inspection: {
        include: {
          client: true,
          technician: { select: { name: true, email: true } }
        }
      }
    }
  })

  if (!quote) {
    return new NextResponse('Cotización no encontrada', { status: 404 })
  }

  const { inspection } = quote
  const subtotalNeto = quote.totalAmount
  const iva = Math.round(subtotalNeto * 0.19)
  const totalFinal = subtotalNeto + iva

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Presupuesto Comercial - ${inspection.client.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      background: #fff;
      padding: 40px 48px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1d4ed8;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-name {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1d4ed8;
      text-transform: uppercase;
    }
    .company-subtitle {
      font-size: 9px;
      font-weight: 700;
      color: #6b7280;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .company-details {
      font-size: 10px;
      color: #6b7280;
      margin-top: 10px;
      line-height: 1.6;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .doc-meta p {
      font-size: 10px;
      color: #6b7280;
      margin-top: 6px;
      line-height: 1.7;
    }
    .doc-meta span { color: #111827; font-weight: 700; }

    /* INFO GRID */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .info-section h3 {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .info-section p {
      font-size: 10px;
      color: #374151;
      line-height: 1.8;
    }
    .info-section strong { color: #6b7280; font-weight: 600; }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    thead tr {
      background: #1d4ed8;
      color: white;
    }
    thead th {
      padding: 10px 14px;
      text-align: left;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    thead th.right { text-align: right; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td {
      padding: 9px 14px;
      font-size: 10.5px;
      color: #374151;
    }
    tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
    tbody td.name { font-weight: 600; color: #111827; }

    /* TOTALS + NOTES */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 24px;
      align-items: start;
      margin-bottom: 40px;
    }
    .notes-box h4 {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .notes-box p {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.8;
      white-space: pre-line;
    }
    .totals-box {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      font-size: 10px;
      color: #6b7280;
      border-bottom: 1px solid #f3f4f6;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row span:last-child { font-weight: 700; color: #111827; }
    .totals-row.total-final {
      background: #eff6ff;
      font-size: 12px;
      font-weight: 800;
      color: #1d4ed8;
    }
    .totals-row.total-final span:last-child { color: #1d4ed8; font-size: 13px; }

    /* SIGNATURES */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      margin-top: 60px;
      text-align: center;
    }
    .sig-line {
      border-top: 1px solid #d1d5db;
      padding-top: 8px;
      width: 180px;
      margin: 0 auto;
    }
    .sig-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #374151;
    }
    .sig-sub { font-size: 9px; color: #9ca3af; margin-top: 2px; }

    /* FOOTER */
    footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
    }
    footer strong { color: #6b7280; }

    @media print {
      body { padding: 20px 28px; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">Ablu Tech</div>
      <div class="company-subtitle">Sistemas de Seguridad y Automatización</div>
      <div class="company-details">
        Ablu Domótica SpA &nbsp;|&nbsp; Santiago, Chile<br/>
        contacto@ablutech.cl
      </div>
    </div>
    <div class="doc-meta">
      <span class="doc-badge">Presupuesto Comercial</span>
      <p>N° Inspección: <span>${inspectionId.slice(0, 8).toUpperCase()}</span></p>
      <p>Fecha Emisión: <span>${formatDate(new Date())}</span></p>
      <p>Válido por: <span>30 días</span></p>
    </div>
  </div>

  <!-- CLIENT + TECHNICAL INFO -->
  <div class="info-grid">
    <div class="info-section">
      <h3>Información del Cliente</h3>
      <p><strong>Cliente:</strong> ${inspection.client.name}</p>
      <p><strong>Dirección:</strong> ${inspection.client.address}</p>
      <p><strong>Teléfono:</strong> ${inspection.client.phone}</p>
      ${inspection.client.email ? `<p><strong>Email:</strong> ${inspection.client.email}</p>` : ''}
    </div>
    <div class="info-section">
      <h3>Detalles del Levantamiento</h3>
      <p><strong>Técnico Formulador:</strong> ${inspection.technician.name}</p>
      <p><strong>Fecha Levantamiento:</strong> ${formatDate(inspection.visitDate)}</p>
      ${inspection.recommendedSystem ? `<p><strong>Sistema Propuesto:</strong> ${inspection.recommendedSystem}</p>` : ''}
      ${inspection.estimatedInstallTime ? `<p><strong>Plazo Estimado:</strong> ${inspection.estimatedInstallTime}</p>` : ''}
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table>
    <thead>
      <tr>
        <th>Descripción del Producto / Servicio</th>
        <th class="right" style="width:60px">Cant.</th>
        <th class="right" style="width:110px">Precio Unit. Neto</th>
        <th class="right" style="width:120px">Total Neto</th>
      </tr>
    </thead>
    <tbody>
      ${quote.items.map(item => `
      <tr>
        <td class="name">${item.name}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">${formatCLP(item.price)}</td>
        <td class="right">${formatCLP(item.price * item.quantity)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- TOTALS + NOTES -->
  <div class="bottom-grid">
    <div class="notes-box">
      <h4>Términos &amp; Condiciones</h4>
      <p>${quote.notes || 'Forma de pago: 50% de pie al inicio, 50% al término de la instalación.\nValidez de la cotización: 30 días desde la fecha de emisión.\nGarantía del equipamiento: 1 año de fábrica.\nMano de obra garantizada por 90 días.'}</p>
    </div>
    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal Neto:</span>
        <span>${formatCLP(subtotalNeto)}</span>
      </div>
      <div class="totals-row">
        <span>IVA (19%):</span>
        <span>${formatCLP(iva)}</span>
      </div>
      <div class="totals-row total-final">
        <span>Total c/IVA:</span>
        <span>${formatCLP(totalFinal)}</span>
      </div>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signatures">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Firma Técnico Responsable</div>
      <div class="sig-sub">${inspection.technician.name}</div>
      <div class="sig-sub">Ablu Tech</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Aceptación de Presupuesto</div>
      <div class="sig-sub">${inspection.client.name}</div>
      <div class="sig-sub">RUT / CI: ___________________</div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <strong>Ablu Domótica SpA</strong> &nbsp;|&nbsp; Santiago, Chile &nbsp;|&nbsp; contacto@ablutech.cl
    &nbsp;|&nbsp; Este presupuesto es válido por 30 días desde la fecha de emisión.
  </footer>

  <script>
    // Auto-print when opened directly
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 400)
    })
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}
