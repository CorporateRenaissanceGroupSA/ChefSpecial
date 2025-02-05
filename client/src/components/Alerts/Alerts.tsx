import React, { useState } from "react";
import { AlertsTable } from "./AlertsTable";

interface AlertsProps {
  hospitalId: number;
  userId: number;
}

const Alerts: React.FC<AlertsProps> = ({hospitalId, userId}) => {
  return (
    <div>
      <AlertsTable hospitalId={hospitalId} userId={userId} />
    </div>
  );
};

export default Alerts;
