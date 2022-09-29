class CircularArray<T> {
  private backing: T[];
  private size: number;
  private start: number;

  get length(): number {
    return this.size;
  }

  constructor(private maxSize: number) {
    this.backing = [];
    this.start = 0;
    this.size = 0;
  }

  public push(...ts: T[]): number {
    if (this.size + ts.length > this.maxSize) {
      throw new Error('Ring overflow error.');
    }
    for (const t of ts) {
      this.backing[(this.start + this.size) % this.maxSize] = t;
      this.size++;
    }
    return this.size;
  }

  public shift() {
    if (this.size === 0) {
      return null;
    }
    this.size--;
    const val = this.backing[this.start];
    this.start = (this.start + 1) % this.maxSize;
    return val;
  }

  public pop() {
    if (this.size === 0) {
      return null;
    }
    this.size--;
    return this.backing[(this.start + this.size) % this.maxSize];
  }

  public get(index: number) {
    return this.backing[(this.start + index) % this.maxSize];
  }
}

export default CircularArray;
