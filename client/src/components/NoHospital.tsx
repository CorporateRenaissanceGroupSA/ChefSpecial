import React from "react";
import noHospitalImage from "./Assets/NoHospital.png";
import { Box } from "@mui/material";

const NoHospital: React.FC = () => {
  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        justifySelf: "center",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}

    >
      <img
        src={noHospitalImage}
        alt="No Hospital Selected"
        style={{ width: "300px", height: "auto" }}
      />
      <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
        No Hospital Selected
      </p>
      <p style={{ fontSize: "16px" }}>
        Choose a hospital in the navigation bar on top.
      </p>
    </Box>
  );
};

export default NoHospital;
