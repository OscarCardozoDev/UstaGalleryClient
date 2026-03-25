import DashboardLayout from "./layout/Dashboard.layout";
import DashboardRoutes from "./routes";

export default function DashboardModule() {
  return (
    <DashboardLayout>
      <div className="font-sans text-dashboard-textPrimary">
        <DashboardRoutes />
      </div>
    </DashboardLayout>
  );
}