export class PrefetchInputQueue {
  private maxSize: number;
  private queue: bigint[];

  constructor({ maxSize }: { maxSize: number }) {
    this.maxSize = maxSize;
    this.queue = [];
  }

  /**
   * Checks if we can enqueue more instructions.
   */
  private canEnqueue() {
    return this.queue.length < this.maxSize;
  }

  /**
   * Checks if we can dequeue instructions.
   */
  private canDequeue() {
    return this.queue.length > 0;
  }

  /**
   * Adds an instruction to the queue.
   */
  public enqueue(input: bigint) {
    if (!this.canEnqueue()) {
      console.warn("🚨 Prefetch queue is full. Cannot enqueue.");
      return false;
    }

    this.queue.push(input);
    return true;
  }

  /**
   * Removes and returns the next instruction in the queue.
   */
  public dequeue(): bigint | null {
    if (!this.canDequeue()) {
      console.warn("🚨 Prefetch queue is empty. Cannot dequeue.");
      return null;
    }

    return this.queue.shift() ?? null;
  }
}
