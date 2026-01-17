import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { DistributionResult, Session, Teacher } from '../types';
import type { TFunction } from '../i18n';

// Base64 encoded PNG for the app icon (use a minimal known-good PNG to avoid decode issues)
const iconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';


// Function to add Arabic font to jsPDF
const loadArabicFont = async (doc: jsPDF) => {
    try {
        // Prefer a local copy first (place `Cairo-Regular.ttf` under `public/fonts/`),
        // then fall back to the previously used raw GitHub URL.
        const fontUrls = [
            '/fonts/Cairo-Regular.ttf',
            'https://raw.githubusercontent.com/Gue3bara/Cairo/master/fonts/ttf/Cairo-Regular.ttf'
        ];

        let buffer: Blob | null = null;
        let lastError: any = null;

        for (const url of fontUrls) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch font from ${url}: ${response.status}`);
                buffer = await response.blob();
                break; // success
            } catch (err) {
                lastError = err;
                console.warn('Font fetch failed for', url, err);
            }
        }

        if (!buffer) {
            console.error('All font fetch attempts failed', lastError);
            doc.setFont('helvetica');
            return false;
        }

        return new Promise<boolean>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    const base64data = reader.result as string;
                    const base64 = base64data.split(',')[1];

                    if (base64) {
                        try {
                            doc.addFileToVFS('Cairo.ttf', base64);
                            doc.addFont('Cairo.ttf', 'Cairo', 'normal');
                            doc.setFont('Cairo');
                            resolve(true);
                        } catch (fontErr) {
                            console.error('Failed to register font with jsPDF:', fontErr);
                            // If the font can't be used (e.g., missing cmap), fallback
                            doc.setFont('helvetica');
                            resolve(false);
                        }
                    } else {
                        console.error('Failed to parse base64 font data');
                        resolve(false);
                    }
                } catch (err) {
                    console.error('Error processing font data:', err);
                    doc.setFont('helvetica');
                    resolve(false);
                }
            };
            reader.onerror = () => {
                console.error('FileReader error');
                doc.setFont('helvetica');
                resolve(false);
            };
            reader.readAsDataURL(buffer as Blob);
        });
    } catch (error) {
        console.error('Error loading Arabic font:', error);
        doc.setFont('helvetica');
        return false;
    }
};

export const exportToPDF = async (result: DistributionResult, sessions: Session[], teachers: Teacher[], hallCount: number, T: TFunction, lang: 'ar' | 'en' | 'fr') => {
    try {
        const doc = new jsPDF();
        const isRtl = lang === 'ar';

        if (isRtl) {
            // For Arabic, use html2canvas rendering to preserve glyph shaping and ligatures.
            // Ensure the Cairo font is loaded via loadArabicFont for fallback in non-canvas flows.
            await loadArabicFont(doc);
            doc.setR2L(true);
        } else {
            doc.setFont('helvetica');
        }

        if (isRtl) {
            // Render each session as an HTML page and capture with html2canvas to preserve Arabic rendering.
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Helper to render an element to PDF page
            const renderElementToPdf = async (el: HTMLElement, addNewPage = false) => {
                const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                if (addNewPage) doc.addPage();
                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
            };

            // Create a temporary container for pages
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px';
            container.style.padding = '20px';
            container.dir = 'rtl';

            // Ensure font-face is available inside the temp container
            const style = document.createElement('style');
            style.innerHTML = `@font-face { font-family: 'Cairo'; src: url('/fonts/Cairo-Regular.ttf') format('truetype'); }
                body, div { font-family: 'Cairo', sans-serif; color: #111827; }
                .pdf-page { width: 800px; background: white; padding: 16px; box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: right; }
                th { background: #f3f4f6; }
            `;
            container.appendChild(style);

            // Header page
            const headerPage = document.createElement('div');
            headerPage.className = 'pdf-page';
            headerPage.innerHTML = `<div style="text-align:center; margin-bottom:8px;"><h2>${T('pdfReportTitle')}</h2></div>`;
            container.appendChild(headerPage);
            await renderElementToPdf(headerPage, false);

            // Session pages
            for (let s = 0; s < sessions.length; s++) {
                const session = sessions[s];
                const sessionAssignment = result.assignments[session.id];
                const pageEl = document.createElement('div');
                pageEl.className = 'pdf-page';
                const sessionTitle = `${T('pdfSessionTitle')} ${session.name} - ${T('sessionSubject')}: ${session.subject}`;
                let html = `<h3 style="text-align: right;">${sessionTitle}</h3>`;

                if (!sessionAssignment) html += `<p style="text-align: right;">${T('pdfNoReserves')}</p>`;
                else {
                    html += `<table><thead><tr><th>${T('pdfProctor2')}</th><th>${T('pdfProctor1')}</th><th>${T('pdfHall')}</th></tr></thead><tbody>`;
                    for (let i = 1; i <= hallCount; i++) {
                        const proctors = sessionAssignment.hallAssignments[i] || [];
                        const proctor1 = proctors[0]?.name || T('unavailable');
                        const proctor2 = proctors[1]?.name || T('unavailable');
                        html += `<tr><td style="text-align: right;">${proctor2}</td><td style="text-align: right;">${proctor1}</td><td style="text-align: center;">${T('hall')} ${i}</td></tr>`;
                    }
                    html += `</tbody></table>`;
                    const reservesText = sessionAssignment.reserves.map(t => t.name).join('، ') || T('pdfNoReserves');
                    html += `<p style="text-align: right; margin-top:12px;"><strong>${T('pdfReserves')}:</strong> ${reservesText}</p>`;
                }

                pageEl.innerHTML += html;
                container.appendChild(pageEl);
                await renderElementToPdf(pageEl, true);
            }

            // Summary page
            const summaryEl = document.createElement('div');
            summaryEl.className = 'pdf-page';
            summaryEl.innerHTML = `<h3 style="text-align:center;">${T('pdfSummaryTitle')}</h3>`;
            let summaryHtml = `<table><thead><tr><th>${T('pdfTeacherName')}</th><th>${T('pdfSessionCount')}</th></tr></thead><tbody>`;
            const summaryBody = Object.values(result.stats).sort((a, b) => b.count - a.count);
            summaryBody.forEach(stat => {
                summaryHtml += `<tr><td style="text-align: right;">${stat.name}</td><td style="text-align: center;">${stat.count}</td></tr>`;
            });
            summaryHtml += `</tbody></table>`;
            summaryEl.innerHTML += summaryHtml;
            container.appendChild(summaryEl);
            await renderElementToPdf(summaryEl, true);

            // Clean up
            document.body.appendChild(container);
            // small delay to allow fonts to load
            await new Promise(res => setTimeout(res, 300));
            document.body.removeChild(container);

        } else {
            // Non-RTL (existing flow)
            // --- Header on first page ---
            try {
                doc.addImage(iconDataUrl, 'PNG', isRtl ? 185 : 15, 9, 12, 12);
            } catch (imgErr) {
                console.warn('Header image failed to add to PDF, skipping image. Source may be corrupted or cross-origin:', imgErr);
            }
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
        }

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
            try {
                doc.addImage(iconDataUrl, 'PNG', isRtl ? pageWidth - 18 : 10, pageHeight - 14.5, 8, 8);
            } catch (imgErr) {
                console.warn('Footer image failed to add to PDF, skipping image. Source may be corrupted or cross-origin:', imgErr);
            }

            // Developer Name
            doc.setFont(isRtl ? 'Cairo' : 'helvetica', 'normal');
            doc.text(T('appDeveloper'), isRtl ? 20 : pageWidth - 10, pageHeight - 10, { align: isRtl ? 'left' : 'right' });
        }


        doc.save(`${T('filePrefix')}.pdf`);
    } catch (error) {
        console.error("Export PDF Error:", error);
        if (error && (error as any).stack) console.error((error as any).stack);
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