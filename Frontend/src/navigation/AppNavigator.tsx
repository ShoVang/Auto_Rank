import { useState } from "react";
import { HomeScreen } from "../screens/HomeScreen";
import { VehiclesScreen } from "../screens/VehiclesScreen";
import { SiteNav, type ScreenName } from "./SiteNav";

export function AppNavigator() {
  const [screen, setScreen] = useState<ScreenName>("home");

  return (
    <>
      <SiteNav current={screen} onNavigate={setScreen} />
      {screen === "home" ? (
        <HomeScreen onBrowse={() => setScreen("vehicles")} />
      ) : (
        <VehiclesScreen />
      )}
    </>
  );
}
