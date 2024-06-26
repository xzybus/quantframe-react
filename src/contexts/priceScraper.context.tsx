import { createContext, useContext, useEffect, useState } from "react";
import { OnTauriEvent, SendNotificationToWindow } from "../utils";
import { RustError, ScraperState } from "../types";
import { useTranslateContext } from "../hooks";
type PriceScraperContextProps = ScraperState & {
  max: number;
  min: number;
  current: number;
}
type PriceScraperContextProviderProps = {
  children: React.ReactNode;
}

export const PriceScraperContext = createContext<PriceScraperContextProps>({
  is_running: false,
  last_run: null,
  error: null,
  message: undefined,
  max: 0,
  min: 0,
  current: 0,
});

export const usePriceScraperContext = () => useContext(PriceScraperContext);

export const PriceScraperContextProvider = ({ children }: PriceScraperContextProviderProps) => {
  const useTranslate = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateContext(`price_scraper.${key}`, { ...context }, i18Key);
  const [is_running, setIsRunning] = useState(false);
  const [last_run, setLastRun] = useState<Date | null>(null);
  const [error, setError] = useState<RustError | null>(null);
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    OnTauriEvent("PriceScraper:Initialize", (data: { last_run: Date | null }) => {
      setLastRun(data.last_run)
    });
    OnTauriEvent("PriceScraper:OnChange", (data: { max: number, min: number, current: number }) => {
      setIsRunning(true)
      setMax(data.max)
      setMin(data.min)
      setCurrent(data.current)
    });
    OnTauriEvent("PriceScraper:Complete", () => {
      setMax(0)
      setMin(0)
      setIsRunning(false)
      setCurrent(0)
      setLastRun(new Date())
    });
    OnTauriEvent("PriceScraper:Error", (error: RustError) => {
      setIsRunning(false)
      setError(error)
      SendNotificationToWindow(useTranslate("error_title"), useTranslate("error_message"));
    });
    return () => { }
  }, []);
  return (
    <PriceScraperContext.Provider value={{ is_running, last_run, error, min, max, current, message: undefined }}>
      {children}
    </PriceScraperContext.Provider>
  )
}