import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MovementTransaction, UserProfile, ToolAsset } from '../types';

interface PdfOptions {
  transactions: MovementTransaction[];
  assets: ToolAsset[];
  currentUser: UserProfile;
  filterLabel?: string;
}

export function generateAuditPdf({
  transactions,
  currentUser,
  filterLabel = 'Todos los registros de movimientos',
}: PdfOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Aviation palette
  const primaryNavy = [12, 27, 51]; // #0c1b33
  const skyBlue = [2, 132, 199]; // #0284c7
  const darkSlate = [15, 23, 42];
  const mutedGray = [100, 116, 139];

  // 1. Top Brand Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Sky Blue Accent Stripe
  doc.setFillColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.rect(0, 24, pageWidth, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('METTAV GROUP SAS • GESTIÓN DE PIEZAS & MAQUINARIA', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONTROL OFICIAL DE MOVIMIENTOS, REPUESTOS Y MANTENIMIENTO', 14, 18);

  // Right-aligned report code and date
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8.5);
  doc.text(`AUDITORÍA OFICIAL: AUD-METTAV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, pageWidth - 14, 11, { align: 'right' });
  doc.text(`EMISIÓN: ${dateStr} ${timeStr}`, pageWidth - 14, 18, { align: 'right' });

  // 2. Report Document Title
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LIBRO MAESTRO DE MOVIMIENTOS, DESPACHOS Y RECEPCIONES EN BODEGA', 14, 34);

  // 3. Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, pageWidth - 28, 22, 2, 2, 'FD');

  // Metadata Left Column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.text('ADMINISTRADOR RESPONSABLE:', 18, 44);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${currentUser.name} (Doc: ${currentUser.documentId})`, 68, 44);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.text('CARGO / DEPARTAMENTO:', 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${currentUser.roleTitle} — ${currentUser.shift}`, 68, 50);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.text('FILTRO APLICADO:', 18, 56);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${filterLabel} (${transactions.length} registros)`, 68, 56);

  // Metadata Right Column: Key Metrics summary
  const totalOut = transactions.filter((t) => t.type === 'OUT').length;
  const totalIn = transactions.filter((t) => t.type === 'IN').length;
  const totalQty = transactions.reduce((acc, t) => acc + (t.quantity || 0), 0);

  const metricBoxX = pageWidth - 110;
  doc.setDrawColor(203, 213, 225);
  doc.line(metricBoxX - 6, 40, metricBoxX - 6, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('TOTAL MOVIMIENTOS:', metricBoxX, 44);
  doc.text('DESPACHOS / SALIDAS:', metricBoxX, 50);
  doc.text('INGRESOS / DEVOLUCIONES:', metricBoxX, 56);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.text(`${transactions.length} movimientos`, metricBoxX + 46, 44);

  doc.setTextColor(194, 65, 12); // Orange for OUT
  doc.text(`${totalOut} despachos a obra`, metricBoxX + 46, 50);

  doc.setTextColor(21, 128, 61); // Green for IN
  doc.text(`${totalIn} ingresos (Unidades: ${totalQty})`, metricBoxX + 46, 56);

  // 4. Data Table
  const tableData = transactions.map((t) => {
    const isOut = t.type === 'OUT';
    const typeLabel = isOut ? 'SALIDA (OUT)' : 'INGRESO (IN)';
    const operatorInfo = `${t.operatorName || t.operator || 'N/A'}\nDoc: ${t.operatorDocument || t.operatorId || 'N/A'}`;
    const workOrder = t.workOrder || 'N/A';
    const reasonText = t.withdrawalReason || t.notes || 'Movimiento estándar de inventario';

    return [
      `${t.id}\nOT: ${workOrder}`,
      typeLabel,
      `${t.assetName}\nID: ${t.assetId}`,
      `${t.quantity} un.`,
      operatorInfo,
      t.location || 'Bodega Central',
      reasonText,
      t.timestamp || 'Hoy',
    ];
  });

  autoTable(doc, {
    startY: 64,
    head: [
      [
        'ID MOV / OT',
        'TIPO',
        'ÍTEM / MAQUINARIA',
        'CANT',
        'RESPONSABLE / OPERADOR',
        'DESTINO / UBICACIÓN',
        'MOTIVO DEL MOVIMIENTO',
        'FECHA & HORA',
      ],
    ],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [12, 27, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 46 },
      3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 38 },
      5: { cellWidth: 36 },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 26, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const text = String(data.cell.raw);
        if (text.includes('SALIDA')) {
          data.cell.styles.textColor = [194, 65, 12];
        } else {
          data.cell.styles.textColor = [16, 120, 50];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 28 },
  });

  // 5. Signature Section
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  const startSignaturesY = finalY + 12 > pageHeight - 35 ? null : finalY + 10;

  if (!startSignaturesY) {
    doc.addPage();
  }

  const signY = startSignaturesY || 30;

  // Regulatory text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(
    'Certificación de Auditoría Interna: El presente informe de trazabilidad y movimientos de maquinaria, equipos e insumos industriales se emite conforme a las políticas de calidad y control de activos de METTAV GROUP SAS.',
    14,
    signY
  );

  // Signatures Lines
  const lineY = signY + 16;
  const col1 = 30;
  const col2 = pageWidth / 2 + 10;
  const lineWidth = 90;

  doc.setDrawColor(148, 163, 184);
  doc.line(col1, lineY, col1 + lineWidth, lineY);
  doc.line(col2, lineY, col2 + lineWidth, lineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${currentUser.name}`, col1 + lineWidth / 2, lineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${currentUser.roleTitle} (Doc: ${currentUser.documentId})`, col1 + lineWidth / 2, lineY + 8, { align: 'center' });
  doc.text('Departamento de Operaciones y Logística', col1 + lineWidth / 2, lineY + 12, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Gerencia de Operaciones', col2 + lineWidth / 2, lineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Supervisión y Control de Calidad', col2 + lineWidth / 2, lineY + 8, { align: 'center' });
  doc.text('METTAV GROUP SAS', col2 + lineWidth / 2, lineY + 12, { align: 'center' });

  // 6. Page Numbers Footer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(
      `METTAV GROUP SAS • Sistema Integral de Control de Inventarios y Maquinaria`,
      14,
      pageHeight - 8
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Save the PDF file
  const fileName = `METTAV_Auditoria_Movimientos_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

