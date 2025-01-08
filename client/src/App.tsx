import React, { useState, useEffect } from "react";
import "./App.scss";
import { Tabs, Grid2, List, ListItem, Box } from "@mui/material";
import ChefSpecialConfig from "./components/ChefSpecialConfig";

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="">
      <Tabs className="tabs" value={selectedTab} onChange={handleTabChange}>
        <Grid2 container className="tabs__list">
          <Grid2>
            <Grid2 container>
              <Grid2>
                <List
                  className="tabs__list-list"
                  style={{ paddingTop: "6px", paddingBottom: "0px" }}
                >
                  <ListItem className="tabs__item tabs__item--selected">
                    Chef Special
                  </ListItem>
                  <ListItem className="tabs__item">Meal Times</ListItem>
                  <ListItem className="tabs__item">Notes</ListItem>
                </List>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Tabs>
      {selectedTab === 0 && (
        <ChefSpecialConfig />
      )}

      {selectedTab === 1 && (
        <Box sx={{ padding: 2 }}>
          <h2>Meal Times</h2>
        </Box>
      )}

      {selectedTab === 2 && (
        <Box sx={{ padding: 2 }}>
          <h2>Notes</h2>
        </Box>
      )}
    </div>
  );
};

export default App;
