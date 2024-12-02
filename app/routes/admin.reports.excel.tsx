import XLSX from "xlsx";
import { prisma } from "~/db.server";
import { formatDate } from "~/utils";

export async function loader() {
  const maintenanceRequests = await prisma.maintenance.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      User: true,
    },
  });

  if (!maintenanceRequests) {
    throw new Response("Payments not found", { status: 404 });
  }

  // Prepare data for Excel
  const excelData = maintenanceRequests.map((request) => ({
    "Requested Date": formatDate(request.createdAt.toISOString()),
    User: request.User.name,
    Details: request.details,
    Status: request.status || "Pending",
  }));

  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Summary");

  // Generate Excel buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  // Return response with Excel file
  return new Response(excelBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bills_summary.xlsx"`,
    },
  });
}
