export type State = Record<string, string>;

export type Listener = (
  hash: string,
  oldValue: string | undefined,
  newValue: string | undefined,
) => void | Promise<void>;

export default new (class IpfsState {
  public state: State = {};

  private listeners: Listener[] = [];

  public async subscribe(listener: Listener): Promise<() => void> {
    this.listeners.push(listener);

    return (): void => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public initialize(data: Record<string, string>): void {
    this.state = {...data};
  }

  public get(hash: string): string | undefined {
    return this.state[hash];
  }

  public set(hash: string, type: string): void {
    const oldValue = this.state[hash];

    this.state[hash] = type;

    this.listeners.forEach((listener) => listener(hash, oldValue, undefined));
  }

  public has(hash: string): boolean {
    return !!this.state[hash];
  }

  public delete(hash: string): void {
    const oldValue = this.state[hash];

    delete this.state[hash];

    this.listeners.forEach((listener) => listener(hash, oldValue, undefined));
  }
})();
