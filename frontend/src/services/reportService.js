import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadReportPDF(report, farmerProfile) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(21, 128, 61); // Emerald-700
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AgriYield AI - Precision Farm Advisory Report', 14, 18);

  // Farmer Meta Box
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const farmerName = farmerProfile?.fullName || 'Smallholder Farmer';
  const village = farmerProfile?.village || 'Jos South, Plateau State';
  const dateStr = new Date(report.timestamp || Date.now()).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.text(`Farmer: ${farmerName}`, 14, 38);
  doc.text(`Village / L.G.A: ${village}, Jos South`, 14, 44);
  doc.text(`Target Crop: ${report.crop?.toUpperCase() || 'POTATO / TOMATO'}`, 14, 50);
  doc.text(`Date & Time: ${dateStr}`, pageWidth - 80, 38);
  doc.text(`Advisory ID: #${(report.id || 'REP').substring(0, 8).toUpperCase()}`, pageWidth - 80, 44);

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 55, pageWidth - 14, 55);

  let currentY = 64;

  // Title of Prediction Type
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  const typeTitles = {
    disease: 'Crop Disease Diagnosis & Treatment Protocol',
    yield: 'Harvest Yield Prediction & Optimization',
    crop: 'Crop Suitability Assessment',
    fertilizer: 'Soil Nutrient & Fertilizer Recommendation',
    combined: 'Comprehensive Farm Health & Agronomy Report'
  };
  doc.text(typeTitles[report.type] || 'Agricultural Advisory', 14, currentY);
  currentY += 8;

  // Table Data preparation
  const tableData = [];
  if (report.type === 'disease') {
    tableData.push(['Diagnosis', report.result?.common_name || report.result?.disease_name || 'N/A']);
    tableData.push(['Confidence Score', `${report.result?.confidence || 90}%`]);
    tableData.push(['Severity Level', report.result?.severity || 'Moderate']);
    tableData.push(['Organic Remedy', report.result?.treatment?.organic || 'Remove infected foliage.']);
    tableData.push(['Chemical Control', report.result?.treatment?.chemical || 'Fungicide spray (e.g. Ridomil Gold).']);
    tableData.push(['Hausa Summary', report.result?.treatment?.hausa_action || 'Cire ganyen da ya kamu.']);
  } else if (report.type === 'fertilizer') {
    tableData.push(['Nutrient Status', report.result?.title || 'NPK Evaluation']);
    tableData.push(['Priority Nutrient', report.result?.priority_nutrient || 'N/A']);
    tableData.push(['Required Action', report.result?.action || 'N/A']);
    tableData.push(['Current Soil Levels', `N: ${report.result?.current?.N}, P: ${report.result?.current?.P}, K: ${report.result?.current?.K}`]);
    tableData.push(['Hausa Guidance', report.result?.hausa_action || 'N/A']);
  } else if (report.type === 'yield') {
    tableData.push(['Expected Yield (Acre)', `${report.result?.yield_kg_per_acre} kg / acre`]);
    tableData.push(['Expected Yield (Hectare)', `${report.result?.yield_kg_per_hectare} kg / ha`]);
    tableData.push(['Farm Benchmark', report.result?.interpretation || 'Average Yield']);
    tableData.push(['Improvement Tips', (report.result?.tips || []).join('\n• ')]);
  } else if (report.type === 'crop') {
    const recs = (report.result?.recommendations || []).map(r => `${r.crop.toUpperCase()} (${r.confidence}%)`).join(', ');
    tableData.push(['Top Recommended Crops', recs]);
    tableData.push(['Plateau Suitability', report.result?.plateau_context?.explanation || 'Optimal temperate highland conditions.']);
  } else if (report.type === 'combined') {
    tableData.push(['Leaf Health Status', report.diseaseSummary || 'Healthy foliage']);
    tableData.push(['Estimated Harvest', `${report.yieldSummary || '7,400'} kg / acre`]);
    tableData.push(['Soil Nutrient Priority', report.fertilizerSummary || 'Balanced NPK']);
    tableData.push(['Irrigation Advice', report.irrigationSummary || 'Consistent root-zone moisture']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Field / Metric', 'Agronomic Evaluation & Guidance']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 9, cellPadding: 4 }
  });

  const finalY = doc.lastAutoTable.finalY + 14;

  // Extension Disclaimer & Contacts
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'AgriYield AI is developed for smallholder farmers in Jos South, Plateau State, Nigeria. Supported crops: Irish Potato & Tomato.\nFor field laboratory verification or seed certification, consult National Root Crops Research Institute (NRCRI) Vom or Plateau Agricultural Development Programme (PADP).',
    14,
    finalY,
    { maxWidth: pageWidth - 28 }
  );

  doc.save(`AgriYield_Report_${report.type || 'advisory'}_${Date.now()}.pdf`);
}
