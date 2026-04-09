import jsPDF from "jspdf";
import fs from "fs";
import path from "path";

const docs = [
  { file: "01-api-spec.md", title: "API Specification" },
  { file: "02-system-document.md", title: "System Document" },
  { file: "03-user-manual.md", title: "User Manual" },
  { file: "04-test-cases.md", title: "Test Cases" },
];

function mdToPdf(mdContent: string, title: string, outputPath: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed: number) => { if (y + needed > 275) addPage(); };

  // Title page
  doc.setFontSize(24);
  doc.text(title, pageWidth / 2, 80, { align: "center" });
  doc.setFontSize(14);
  doc.text("Maintenance Request System", pageWidth / 2, 95, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageWidth / 2, 110, { align: "center" });
  doc.text("Version 2.0", pageWidth / 2, 118, { align: "center" });
  addPage();

  const lines = mdContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { y += 3; continue; }

    // Headers
    if (trimmed.startsWith("# ")) {
      checkPage(15);
      doc.setFontSize(18);
      doc.text(trimmed.replace("# ", ""), margin, y);
      y += 10;
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      y += 4;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      checkPage(12);
      y += 3;
      doc.setFontSize(14);
      doc.text(trimmed.replace("## ", ""), margin, y);
      y += 8;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      checkPage(10);
      y += 2;
      doc.setFontSize(12);
      doc.text(trimmed.replace("### ", ""), margin, y);
      y += 7;
      continue;
    }

    // Skip code blocks markers
    if (trimmed.startsWith("```")) continue;

    // Table rows
    if (trimmed.startsWith("|")) {
      if (trimmed.includes("---")) continue;
      checkPage(6);
      doc.setFontSize(7);
      const cells = trimmed.split("|").filter(Boolean).map((c) => c.trim());
      const colWidth = maxWidth / cells.length;
      cells.forEach((cell, i) => {
        doc.text(cell.substring(0, 30), margin + i * colWidth, y, { maxWidth: colWidth - 2 });
      });
      y += 5;
      continue;
    }

    // Regular text
    checkPage(6);
    doc.setFontSize(9);
    const clean = trimmed.replace(/\*\*/g, "").replace(/`/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const wrapped = doc.splitTextToSize(clean, maxWidth);
    wrapped.forEach((wl: string) => {
      checkPage(5);
      doc.text(wl, trimmed.startsWith("- ") || trimmed.startsWith("| ") ? margin + 3 : margin, y);
      y += 4.5;
    });
  }

  doc.save(outputPath);
  console.log(`Generated: ${outputPath}`);
}

// Generate all PDFs
const docsDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");

for (const d of docs) {
  const mdPath = path.join(docsDir, d.file);
  const pdfPath = path.join(docsDir, d.file.replace(".md", ".pdf"));
  const content = fs.readFileSync(mdPath, "utf-8");
  mdToPdf(content, d.title, pdfPath);
}

console.log("\nAll PDFs generated in docs/ folder");
