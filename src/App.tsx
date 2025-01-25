import { printlf } from "./components/x86/software/utils";
import { useIniateVideoGraphics } from "./hooks/useIniateVideoGraphics";

function App() {
  const { ref } = useIniateVideoGraphics();

  printlf("Hello World \n My name is Merlin");

  return <canvas ref={ref} />;
}

export default App;
