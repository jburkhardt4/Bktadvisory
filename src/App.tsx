import { EstimatorAppShell } from "./components/EstimatorAppShell";

export type { FormData, QuoteData } from "./types";
export { initialFormData } from "./types";

function App() {
  return <EstimatorAppShell />;
}

export default App;
