export type State = Record<string, string>;

export type Listener = (
  hash: string,
  oldValue: string | undefined,
  newValue: string | undefined,
) => void | Promise<void>;

export default new (class IpfsState {
  /**
   * The current state.
   */
  public state: State = {};

  /**
   * The listeners.
   */
  private listeners: Listener[] = [];

  /**
   * Subscribe to state changes.
   * @param listener The listener to subscribe.
   * @returns A function to unsubscribe.
   */
  public async subscribe(listener: Listener): Promise<() => void> {
    this.listeners.push(listener);

    return (): void => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Initialize the state with the given data. This will overwrite the current state.
   * @param data The data to initialize the state with.
   */
  public initialize(data: Record<string, string>): void {
    this.state = {...data};
  }

  /**
   * Get the content-type for the given hash.
   * @param hash The hash to get the content-type for.
   * @returns The content-type for the given hash.
   */
  public get(hash: string): string | undefined {
    return this.state[hash];
  }

  /**
   * Set the content-type for the given hash.
   * @param hash The hash to set the content-type for.
   * @param type The content-type to set.
   */
  public set(hash: string, type: string): void {
    const oldValue = this.state[hash];

    this.state[hash] = type;

    this.listeners.forEach((listener) => listener(hash, oldValue, undefined));
  }

  /**
   * Check if the given hash exists in the state.
   * @param hash The hash to check.
   * @returns Whether the given hash exists in the state.
   */
  public has(hash: string): boolean {
    return !!this.state[hash];
  }

  /**
   * Delete the given hash from the state.
   * @param hash The hash to delete.
   */
  public delete(hash: string): void {
    const oldValue = this.state[hash];

    delete this.state[hash];

    this.listeners.forEach((listener) => listener(hash, oldValue, undefined));
  }
})();
