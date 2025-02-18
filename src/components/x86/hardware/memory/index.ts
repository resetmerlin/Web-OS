import {
  convertBitToByte,
  getNumberOfBinaryValues,
  makeBuffer,
} from "../utils";
import { ONE_BIT } from "../constants";
import { Microprocessor } from "../cpu";
import { FullAddressDecoding } from "../memory/address-decoder";
import { Bus, ControlBus } from "../bus";
import { RawMemoryBuffer } from "./raw-memory-buffer";

/**
 * We assume that we use same specification of certain memory chips
 * reference:
 * @link https://people.engr.tamu.edu/rgutier/lectures/mbsd/mbsd_l16.pdf
 */
export class Memory {
  private numberOfChips: number;
  private chipSelectBits: number;
  private addressingDepth: number;
  private buffer: RawMemoryBuffer;
  private _locationsPerChip: number;
  private decoder: FullAddressDecoding;
  /**
   * how much each location stores, unit is byte
   */
  private _wordSize: number;

  constructor({
    microprocessor,
    addresses,
    wordSize,
    addressBus,
    dataBus,
    controlBus,
  }: {
    microprocessor: Microprocessor;
    addresses: number;
    wordSize: number;
    addressBus: Bus;
    dataBus: Bus;
    controlBus: ControlBus;
  }) {
    if (microprocessor instanceof Microprocessor === false) {
      throw new Error("The Memory size is dependent to CPU's hardware specs");
    }

    this._wordSize = convertBitToByte(wordSize);
    this._locationsPerChip = addresses;

    this.buffer = new RawMemoryBuffer({
      wordSize: this._wordSize,
      buffer: this.getTotalAddressableMemoryBuffer(microprocessor),
    });
    this.numberOfChips = this.getNumberOfChips();
    this.chipSelectBits = this.getAddressLinesToSelectChips();
    this.addressingDepth = this.getAddressLinesForInternalMemoryCells();
    this.validation(microprocessor);

    this.decoder = new FullAddressDecoding({
      numberOfChips: this.numberOfChips,
      chipSelectBits: this.chipSelectBits,
    });

    this.read({ addressBus, dataBus, controlBus });
  }

  private read({
    addressBus,
    dataBus,
    controlBus,
  }: {
    addressBus: Bus;
    dataBus: Bus;
    controlBus: ControlBus;
  }) {
    /**
     * Step 1: When memory receives READ control signals, begin next process
     */
    controlBus.receives({
      event: "READ",
      handler: (data) => {
        if (data === false) return;
        /**
         *  Step 2: Get addresses value from address bus
         */
        addressBus.receives({
          handler: (data) => {
            const { address } = data as { address: number };
            console.log(
              `💾 [MEMORY] Received Address: ${address.toString(16)}`
            );

            const value = this.getValueFromMemory({ input: address });
            console.log(`📤 [MEMORY] Sending Data: ${value}`);

            /**
             *  Step 3: Sends value to data bus
             */
            dataBus.sends({ detail: value });
          },
        });
      },
    });
  }

  public write({ address, value }: { address: number; value: bigint }) {
    // Validate address range
    if (address < 0 || address >= this.buffer.byteLength) {
      throw new Error("❌ Invalid memory address");
    }

    console.log(
      `📝 [MEMORY] Writing ${value} at Address: ${address.toString(16)}`
    );
    this.buffer.storeValue({ address, value });
  }

  /**
   *
   * To get a value from memory it should select target number of chip.
   * And then it should selct internal cells inside in that chip.
   *
   * @description: Let's assume you have a building which has 3 floor moreover it has 7 rooms per floor.
   *     You wanna go 2 floor and door number 201, In elevator to go there you just have to press all of the floor
   *     and after that you just have to disable remaing floor button except floor 2 right? Then u will
   *     able to locate your door room number 201
   *     -> In this explaination, the floor is equal to the number of memory chips and number of rooms per floor
   *        means that there 7 internal cells. Last, the disabling the button exept your target floor equals to the
   *        bit masking.
   */
  private getValueFromMemory({ input }: { input: number }) {
    // Step 1: Select the correct memory chip
    const chipIndex = this.decoder.getChipSelectionValue(input);

    if (chipIndex == null) {
      throw new Error("No chip selected for the given input.");
    }

    //
    const bitMask = (1 << this.addressingDepth) - 1;

    // Step 2: Extract internal address inside the selected chip
    const internalAddress = input & bitMask;

    // Step 3: Read the value from memory (only after selection is done!)
    return this.buffer.getValue(internalAddress);
  }

  private getAddressLinesToSelectChips() {
    /**
     *
     * calculate the address lines to select each one of the chips
     * if number of chips is 8, 2 ^ 3 is equals to 8. so the quantity of address lines are 3
     */
    const formula = (numberOfChips: number) =>
      Math.log(numberOfChips) / Math.log(ONE_BIT);

    return formula(this.numberOfChips);
  }

  private getAddressLinesForInternalMemoryCells() {
    /**
     *
     * calculate the address lines to addresss its internal memory cells
     * if memory per chip is 128, 2 ^ 7 is equals to 128. so the quantity of address lines are 7
     */
    const formula = (memoryPerChip: number) =>
      Math.log(memoryPerChip) / Math.log(ONE_BIT);

    return formula(this.getMemoryPerChips());
  }

  private getTotalAddressableMemoryBuffer(microprocessor: Microprocessor) {
    if (microprocessor instanceof Microprocessor === false) {
      throw new Error("The Memory size is dependent to CPU's hardware specs");
    }

    const formula = (numberOfAddressLines: number, sizePerLocation: number) => {
      /**
       * calculate the total addressable memory locations
       * Total Addressable Memory Locations = 2 ^ (Number of Address Lines)
       */
      const numberOfLocations = getNumberOfBinaryValues(numberOfAddressLines);

      /**
       * calculate the total memory size
       * Total Memory Size = Number of Locations * size per locations(ex: 1byte)
       */
      const totalMemorySize = numberOfLocations * sizePerLocation;

      return totalMemorySize;
    };

    return makeBuffer(
      formula(microprocessor.getAddressLines(), this._wordSize)
    );
  }

  private getNumberOfChips() {
    const formula = (totalAddressableMemory: number, memoryPerChip: number) => {
      /**
       * Formula to get number of memory chips
       * Number of chips = Total Addressable Memory / Memory per Chip
       */
      const numberOfChips = totalAddressableMemory / memoryPerChip;

      return numberOfChips;
    };

    return formula(this.buffer.byteLength, this.getMemoryPerChips());
  }

  private getMemoryPerChips() {
    const formula = (sizePerLocation: number, locationsPerChip: number) => {
      /**
       * Formula to get memroy per chips
       *
       * Memory Per Chip = locations(words) per chips * size per locations(ex: 1byte)
       */
      const memoryPerChip = locationsPerChip * sizePerLocation;

      return memoryPerChip;
    };

    return formula(this._wordSize, this._locationsPerChip);
  }

  private validation(microprocessor: Microprocessor) {
    if (microprocessor instanceof Microprocessor === false) {
      throw new Error("The Memory size is dependent to CPU's hardware specs");
    }

    if (
      this.addressingDepth + this.chipSelectBits !==
      microprocessor.getAddressLines()
    ) {
      throw new Error(
        "The hardware specs between cpu's address lines and memory specs won;t match"
      );
    }
  }
}
