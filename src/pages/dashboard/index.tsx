import DashboardLayout from "./layout/Dashboard.layout";
import DashboardRoutes from "./routes";

export default function DashboardModule() {
  return (
    <DashboardLayout>
      <div className="h-full font-sans bg-dashboard-background text-dashboard-textPrimary">
        <DashboardRoutes />
      </div>
    </DashboardLayout>
  );
}