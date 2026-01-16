import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DistributionResult, Session, Teacher } from '../types';
import type { TFunction } from '../i18n';

// Base64 encoded SVG for the app icon
const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`;
const iconDataUrl = `data:image/svg+xml;base64,${btoa(iconSVG)}`;


// Function to add Arabic font to jsPDF
const loadArabicFont = async (doc: jsPDF) => {
    try {
        const fontUrl = 'https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvangtZmpQdkhYl0E.ttf';
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error('Failed to fetch font');
        const buffer = await response.blob();

        return new Promise<boolean>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                // Remove the data URL prefix (e.g., "data:application/octet-stream;base64,")
                const base64 = base64data.split(',')[1];

                if (base64) {
                    doc.addFileToVFS('Cairo.ttf', base64);
                    doc.addFont('Cairo.ttf', 'Cairo', 'normal');
                    doc.setFont('Cairo');
                    resolve(true);
                } else {
                    console.error('Failed to parse base64 font data');
                    resolve(false);
                }
            };
            reader.onerror = () => {
                console.error('FileReader error');
                resolve(false);
            };
            reader.readAsDataURL(buffer);
        });
    } catch (error) {
        console.error('Error loading Arabic font:', error);
        // Fallback to standard font
        doc.setFont('helvetica');
        return false;
    }
};

export const exportToPDF = async (result: DistributionResult, sessions: Session[], teachers: Teacher[], hallCount: number, T: TFunction, lang: 'ar' | 'en' | 'fr') => {
    try {
        const doc = new jsPDF();
        const isRtl = lang === 'ar';

        if (isRtl) {
            await loadArabicFont(doc);
            doc.setR2L(true);
        } else {
            doc.setFont('helvetica');
        }

        // --- Header on first page ---
        doc.addImage(iconDataUrl, 'SVG', isRtl ? 185 : 15, 9, 12, 12);
        doc.text(T('pdfReportTitle'), 105, 15, { align: 'center' });

        sessions.forEach((session, index) => {
            if (index > 0) doc.addPage();
            const sessionTitle = `${T('pdfSessionTitle')} ${session.name} - ${T('sessionSubject')}: ${session.subject}`;
            doc.text(sessionTitle, isRtl ? 200 : 10, 30, { align: isRtl ? 'right' : 'left' });

            const sessionAssignment = result.assignments[session.id];
            if (!sessionAssignment) return;

            const body = [];
            for (let i = 1; i <= hallCount; i++) {
                const proctors = sessionAssignment.hallAssignments[i] || [];
                const proctor1 = proctors[0]?.name || T('unavailable');
                const proctor2 = proctors[1]?.name || T('unavailable');
                const hallLabel = `${T('hall')} ${i}`;

                // Note: For Arabic in autoTable, we often need to reverse the text manually if the complex script support isn't perfect,
                // but relying on the font and R2L setting is the first step.
                if (isRtl) {
                    body.push([proctor2, proctor1, hallLabel]);
                } else {
                    body.push([hallLabel, proctor1, proctor2]);
                }
            }

            const head = isRtl
                ? [[T('pdfProctor2'), T('pdfProctor1'), T('pdfHall')]]
                : [[T('pdfHall'), T('pdfProctor1'), T('pdfProctor2')]];

            autoTable(doc, {
                startY: 35,
                head: head,
                body: body,
                theme: 'grid',
                headStyles: { halign: 'center', font: isRtl ? 'Cairo' : 'helvetica', fontStyle: 'bold' },
                bodyStyles: { font: isRtl ? 'Cairo' : 'helvetica', halign: isRtl ? 'right' : 'left' },
                columnStyles: { [isRtl ? 2 : 0]: { halign: 'center' } },
                styles: {
                    font: isRtl ? 'Cairo' : 'helvetica'
                }
            });

            const finalY = (doc as any).lastAutoTable.finalY;
            doc.text(T('pdfReserves'), isRtl ? 200 : 10, finalY + 10, { align: isRtl ? 'right' : 'left' });
            const reservesText = sessionAssignment.reserves.map(t => t.name).join(isRtl ? '، ' : ', ') || T('pdfNoReserves');
            doc.text(reservesText, isRtl ? 200 : 10, finalY + 18, { align: isRtl ? 'right' : 'left' });
        });

        // Summary Page
        doc.addPage();
        doc.text(T('pdfSummaryTitle'), 105, 15, { align: 'center' });

        const summaryBody = Object.values(result.stats)
            .sort((a, b) => b.count - a.count)
            .map(stat => isRtl ? [stat.count.toString(), stat.name] : [stat.name, stat.count.toString()]);

        const summaryHead = isRtl ? [[T('pdfSessionCount'), T('pdfTeacherName')]] : [[T('pdfTeacherName'), T('pdfSessionCount')]];

        autoTable(doc, {
            startY: 25,
            head: summaryHead,
            body: summaryBody,
            theme: 'grid',
            headStyles: { halign: 'center', font: isRtl ? 'Cairo' : 'helvetica', fontStyle: 'bold' },
            bodyStyles: { font: isRtl ? 'Cairo' : 'helvetica', halign: isRtl ? 'right' : 'left' },
            columnStyles: { [isRtl ? 0 : 1]: { halign: 'center' } },
            styles: {
                font: isRtl ? 'Cairo' : 'helvetica'
            }
        });

        // --- Footer on all pages ---
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
            doc.setFontSize(9);
            doc.setTextColor(128);

            // Brand Name (always LTR)
            doc.setFont('helvetica', 'normal');
            doc.text('AITLOUTOU', isRtl ? pageWidth - 28 : 20, pageHeight - 10, { align: isRtl ? 'right' : 'left' });
            doc.addImage(iconDataUrl, 'SVG', isRtl ? pageWidth - 18 : 10, pageHeight - 14.5, 8, 8);

            // Developer Name
            doc.setFont(isRtl ? 'Cairo' : 'helvetica', 'normal');
            doc.text(T('appDeveloper'), isRtl ? 20 : pageWidth - 10, pageHeight - 10, { align: isRtl ? 'left' : 'right' });
        }


        doc.save(`${T('filePrefix')}.pdf`);
    } catch (error) {
        console.error("Export PDF Error:", error);
        alert(T('errorExportingPDF') || "Failed to export PDF. Please try again.");
    }
};


export const exportToCSV = (result: DistributionResult, sessions: Session[], hallCount: number, T: TFunction) => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Excel
    csvContent += [T('csvSession'), T('csvSubject'), T('csvHall'), T('csvProctor1'), T('csvProctor2'), T('csvReserves')].join(',') + "\n";

    sessions.forEach(session => {
        const sessionAssignment = result.assignments[session.id];
        if (!sessionAssignment) return;

        const reserves = sessionAssignment.reserves.map(t => t.name).join('; ');

        for (let i = 1; i <= hallCount; i++) {
            const proctors = sessionAssignment.hallAssignments[i] || [];
            const proctor1 = proctors[0]?.name || '';
            const proctor2 = proctors[1]?.name || '';
            const row = [session.name, session.subject, `${T('hall')} ${i}`, `"${proctor1}"`, `"${proctor2}"`, i === 1 ? `"${reserves}"` : ''].join(',');
            csvContent += row + "\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${T('filePrefix')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};