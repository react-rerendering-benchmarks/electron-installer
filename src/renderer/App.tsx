import { useCallback } from "react";
import { memo } from "react";
import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { ChooseAction, ChoosePlatform, Download, License, Progress } from "./steps";
import logo from "../../assets/logo.png";
import { useEffect, useState } from "react";
import { DiscordPlatform, PlatformData } from "./types";
import { getPlatforms } from "./util";
const Header = memo(function Header() {
  return <div className="header">
      <img src={logo} alt="Replugged logo" className="header-logo" />
      <span className="header-name">Replugged Installer</span>
    </div>;
});
export default memo(function App() {
  const [action, setAction] = useState<"plug" | "unplug">("plug");
  const [platforms, setPlatforms] = useState<DiscordPlatform[]>([]);
  const [platformData, setPlatformData] = useState<Record<DiscordPlatform, PlatformData> | null>(null);
  const init = useCallback(async (reset = false): Promise<void> => {
    if (reset) {
      setAction("plug");
      setPlatforms([]);
      setPlatformData(null);
    }
    const data = await getPlatforms();
    setPlatformData(data);
    const unplugged = Object.entries(data).filter(([, value]) => value.installed && !value.plugged).map(([key]) => (key as DiscordPlatform));
    setPlatforms(unplugged);
  }, [setAction, setPlatforms, setPlatformData]);
  useEffect(() => {
    window.electron.ipcRenderer.on("ERROR", event => {
      console.error(event);
    });
    void init();
  }, []);
  return <Router>
      <Header />
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<License />} />
          <Route path="/download" element={<Download />} />
          <Route path="/action" element={<ChooseAction action={action} setAction={setAction} />} />
          <Route path="/platform" element={<ChoosePlatform platformData={platformData} action={action} platforms={platforms} setPlatforms={setPlatforms} init={init} />} />
          <Route path="/progress" element={<Progress action={action} platforms={platforms} init={init} />} />
        </Routes>
      </div>
    </Router>;
});