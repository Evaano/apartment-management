import PDFDocument from "pdfkit";
import { formatDate } from "~/utils";
import { prisma } from "~/db.server";

export async function loader() {
  const bills = await prisma.billing.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      lease: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!bills || bills.length === 0) {
    throw new Response("Payments not found", { status: 404 });
  }

  const generatePDF = async (bills: any[]): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: "portrait" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const margin = 50;

      // Title
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Bill Summary", margin, margin, { align: "center" });

      // Table headers
      const headers = [
        "Payment Date",
        "Tenant",
        "Property",
        "Amount",
        "Status",
      ];

      const columnWidths = [120, 80, 150, 80, 70]; // Adjusted column widths
      const getX = (colIndex: number) =>
        margin + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);

      // Draw table headers
      doc.fontSize(10).font("Helvetica-Bold");
      headers.forEach((header, i) => {
        doc.text(header, getX(i), margin + 40, {
          width: columnWidths[i],
          align: "left",
        });
      });

      // Draw table rows
      doc.font("Helvetica");
      bills.forEach((bill, index) => {
        let yPosition = margin + 60 + index * 20;

        // Add a new page if Y position exceeds page height
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = margin + 60; // Reset Y position for the new page

          // Redraw headers
          headers.forEach((header, i) => {
            doc.text(header, getX(i), margin + 40, {
              width: columnWidths[i],
              align: "left",
            });
          });
        }

        // Row data
        doc.text(formatDate(bill.paymentDate), getX(0), yPosition, {
          width: columnWidths[0],
          align: "left",
        });

        doc.text(bill.lease.user.name, getX(1), yPosition, {
          width: columnWidths[1],
          align: "left",
        });

        doc.text(bill.lease.propertyDetails || "N/A", getX(2), yPosition, {
          width: columnWidths[2],
          align: "left",
        });

        doc.text(`$${bill.amount.toFixed(2)}`, getX(3), yPosition, {
          width: columnWidths[3],
          align: "left",
        });

        doc.text(bill.status || "Pending", getX(4), yPosition, {
          width: columnWidths[4],
          align: "left",
        });
      });

      // Add total summary
      const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `Total Bills: $${totalAmount.toFixed(2)}`,
          margin,
          doc.page.height - 100,
          { align: "right" },
        );

      doc.end();
    });
  };

  const pdfBuffer = await generatePDF(bills);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
