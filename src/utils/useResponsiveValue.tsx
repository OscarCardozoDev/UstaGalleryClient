import useScreen from "./useScreen";
import { getScreenType } from "./useBreakPoints";

export default function useResponsiveValue(values: Record<string, number>) {
  const { width } = useScreen();
  const screen = getScreenType(width);

  return values[screen] ?? null;
}