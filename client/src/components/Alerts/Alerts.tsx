import React, { useState } from "react";
import { AlertsTable } from "./AlertsTable";

interface AlertsProps {
  hospitalId: number;
}

const Alerts: React.FC<AlertsProps> = (hospitalId) => {
  return (
    <div>
        <AlertsTable />
    </div>
  );
};

export default Alerts;
