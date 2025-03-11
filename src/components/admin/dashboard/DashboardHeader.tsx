
import { motion } from "framer-motion";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage cleaners, assign tasks, and monitor cleaning operations
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
