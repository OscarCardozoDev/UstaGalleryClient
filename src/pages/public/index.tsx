import MainPageLayout from "./layouts/MainPage";
import MainPageRoutes from "./routes";

export default function MainPageModule() {
  return (
    <MainPageLayout>
      <div className="font-sans text-dashboard-textPrimary">
        <MainPageRoutes />
      </div>
    </MainPageLayout>
  );
}