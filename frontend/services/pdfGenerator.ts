import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ImageAnalysisResult, UrlAnalysisResult, TextAnalysisResult, GroundingSource } from '../types';

const addHeader = (doc: jsPDF, title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor('#0891B2'); // cyan-600
    doc.text('CyberAI-Inspector', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor('#334155'); // slate-700
    doc.text(title, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor('#64748B'); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
};

const addFooter = (doc: jsPDF) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`© ${new Date().getFullYear()} CyberAI-Inspector. For demonstration purposes only.`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }
};

const getVerdictRowStyle = (score: number) => {
    if (score > 70) return { fillColor: [236, 253, 245], textColor: [21, 128, 61] }; // Green
    if (score > 40) return { fillColor: [254, 252, 232], textColor: [180, 83, 9] }; // Yellow
    return { fillColor: [254, 242, 242], textColor: [185, 28, 28] }; // Red
};


export const generateImageReportPdf = (result: ImageAnalysisResult) => {
    const doc = new jsPDF();
    addHeader(doc, 'Image Analysis Report');
    
    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Result']],
        body: [
            ['Overall Verdict', result.verdict],
            ['Trust Score', `${result.trustScore} / 100`],
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0891B2' },
        didParseCell: (data) => {
            if (data.row.index === 1) { // Trust Score row
                Object.assign(data.cell.styles, getVerdictRowStyle(result.trustScore));
            }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
        startY: finalY + 10,
        head: [['Metadata (EXIF)', 'Value']],
        body: result.analysis.metadata.map(item => [item.name, item.value]),
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });

    autoTable(doc, {
        head: [['Compression Analysis', 'Value']],
        body: result.analysis.compression.map(item => [item.name, item.value]),
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });

    autoTable(doc, {
        head: [['Detected Artifacts']],
        body: result.analysis.artifacts.map(item => [item]),
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });

    addFooter(doc);
    doc.save('CyberAI-Inspector_Image_Report.pdf');
};

export const generateUrlReportPdf = (result: UrlAnalysisResult) => {
    const doc = new jsPDF();
    addHeader(doc, 'URL Analysis Report');

    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Result']],
        body: [
            ['Overall Verdict', result.verdict],
            ['Trust Score', `${result.trustScore} / 100`],
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0891B2' },
        didParseCell: (data) => {
             if (data.row.index === 1) {
                Object.assign(data.cell.styles, getVerdictRowStyle(result.trustScore));
            }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
        startY: finalY + 10,
        head: [['Domain Information', 'Value']],
        body: result.domainInfo.map(item => [item.name, String(item.value)]),
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });
    
    autoTable(doc, {
        head: [['SSL/TLS Certificate', 'Value']],
        body: result.sslInfo.map(item => [item.name, item.value]),
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });

    autoTable(doc, {
        head: [['Backlink Profile Metric', 'Value']],
        body: [
            ['Total Backlinks', result.backlinkProfile.total],
            ['Reputable Backlinks', result.backlinkProfile.reputable],
        ],
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
    });
    
    addFooter(doc);
    doc.save('CyberAI-Inspector_URL_Report.pdf');
};

export const generateTextReportPdf = (result: TextAnalysisResult) => {
    const doc = new jsPDF();
    addHeader(doc, 'Text Verifier Report');
    
    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Result']],
        body: [
            ['Overall Verdict', result.verdict],
            ['Trust Score', `${result.trustScore} / 100`],
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0891B2' },
        didParseCell: (data) => {
            const score = result.trustScore > 65 ? 80 : 30; // Map verdict to score for coloring
             if (data.row.index === 1) {
                Object.assign(data.cell.styles, getVerdictRowStyle(score));
            }
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    doc.setFontSize(12);
    doc.setTextColor('#0E7490');
    doc.text('AI-Powered Summary', 14, finalY + 12);
    doc.setFontSize(10);
    doc.setTextColor('#334155');
    const summaryLines = doc.splitTextToSize(result.summary, 180);
    doc.text(summaryLines, 14, finalY + 18);
    finalY += 18 + (summaryLines.length * 4);


    autoTable(doc, {
        startY: finalY + 5,
        head: [['Verified Sources', 'URL']],
        body: result.sources.length > 0
            ? result.sources.map((source: GroundingSource) => [source.web.title, source.web.uri])
            : [['No authoritative sources could be found.', '']],
        theme: 'striped',
        headStyles: { fillColor: '#0E7490' },
        columnStyles: {
            1: { cellWidth: 80 }
        }
    });

    addFooter(doc);
    doc.save('CyberAI-Inspector_Text_Report.pdf');
};
