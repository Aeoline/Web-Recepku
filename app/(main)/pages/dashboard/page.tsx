import { Suspense } from "react";
import Dashboard from "./dashboard";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
};

export default DashboardPage;