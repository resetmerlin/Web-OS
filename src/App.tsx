import { Bus, ControlBus } from "./components/x86/hardware/bus";
import { compile } from "./components/x86/hardware/compiler";
import { MEMORY_CHIPS, Microprocessor } from "./components/x86/hardware/cpu";
import { Memory } from "./components/x86/hardware/memory";
import { printlf } from "./components/x86/software/utils";
import { useIniateVideoGraphics } from "./hooks/useIniateVideoGraphics";

function App() {
  const { ref } = useIniateVideoGraphics();

  printlf("Hello World \n My name is Merlin asdfasdfasdfasdfasdfasdfasdfasdf");

  const addressBus = new Bus({ type: "ADDRESS" });

  const controlBus = new ControlBus({
    type: "CONTROL_SIGNALS",
    specs: "X86",
  });
  const dataBus = new Bus({ type: "DATA" });

  const cpu = new Microprocessor({
    addressLines: 10,
    mode: "REAL",
    addressBus,
    controlBus,
    dataBus,
  });

  const memory = new Memory({
    microprocessor: cpu,
    addresses: MEMORY_CHIPS.addresses,
    wordSize: MEMORY_CHIPS.wordSizeBitsFormat,
    addressBus,
    controlBus,
    dataBus,
  });

  console.log("🔵 Preloading Instructions into Memory...");

  // Example instructions in machine code (hexadecimal)
  const instructions = [compile({ value: "Move", wordSize: 8 })];

  // Store instructions in memory starting at address 0x0000
  let address = 0x0000;
  instructions.forEach((instruction) => {
    memory.write({ address, value: instruction });
    address++;
  });

  // CPU Fetches Instruction
  cpu.fetch();
  cpu.decode();

  return <canvas ref={ref} />;
}

export default App;
