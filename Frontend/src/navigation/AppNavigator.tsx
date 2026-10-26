import { useState } from "react";
import { CompareScreen } from "../screens/CompareScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { VehiclesScreen } from "../screens/VehiclesScreen";
import type { Vehicle } from "../types/vehicle";
import { SiteNav, type ScreenName } from "./SiteNav";

export function AppNavigator() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [selected, setSelected] = useState<Vehicle | null>(null);

  return (
    <>
      <SiteNav current={screen} onNavigate={setScreen} />
      {screen === "home" ? (
        <HomeScreen onBrowse={() => setScreen("vehicles")} />
      ) : null}
      {screen === "vehicles" ? (
        <VehiclesScreen
          selected={selected}
          onSelect={setSelected}
          onCompare={(car) => {
            setSelected(car);
            setScreen("compare");
          }}
        />
      ) : null}
      {screen === "compare" && selected ? (
        <CompareScreen car={selected} onBack={() => setScreen("vehicles")} />
      ) : null}
    </>
  );
}
