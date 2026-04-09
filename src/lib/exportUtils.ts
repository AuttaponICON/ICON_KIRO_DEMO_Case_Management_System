"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportRow {
  [key: string]: string | number;
}

export function exportPDF(title: string, headers: string[], rows: ExportRow[], columns: string[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }), 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows.map((r) => columns.map((c) => String(r[c] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`${title}.pdf`);
}

export function exportExcel(title: string, headers: string[], rows: ExportRow[], columns: string[]) {
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {};
    columns.forEach((c, i) => { obj[headers[i]] = r[c] ?? ""; });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${title}.xlsx`);
}
