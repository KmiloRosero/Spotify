import { ListNode } from './Node';

export class DoublyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length = 0;

  /**
   * Insert a new node at the beginning of the list.
   * @param data Element to insert.
   * @throws Error If the element contains a duplicate numeric id.
   */
  public addFirst(data: T): void {
    this.assertNoDuplicateId(data);

    const node = new ListNode<T>(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return;
    }

    node.next = this.head;
    this.head.prev = node;
    this.head = node;
    this.length += 1;
  }

  /**
   * Insert a new node at the end of the list.
   * @param data Element to insert.
   * @throws Error If the element contains a duplicate numeric id.
   */
  public addLast(data: T): void {
    this.assertNoDuplicateId(data);

    const node = new ListNode<T>(data);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return;
    }

    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
    this.length += 1;
  }

  /**
   * Insert a new node at a specific index.
   * @param index Zero-based position to insert at. Must be between 0 and length (inclusive).
   * @param data Element to insert.
   * @throws Error If index is out of bounds.
   * @throws Error If the element contains a duplicate numeric id.
   */
  public insertAt(index: number, data: T): void {
    if (!Number.isInteger(index)) {
      throw new Error('Index must be an integer.');
    }
    if (index < 0 || index > this.length) {
      throw new Error(
        `Index out of bounds. Received ${index}, but valid range is 0 to ${this.length}.`,
      );
    }

    if (index === 0) {
      this.addFirst(data);
      return;
    }
    if (index === this.length) {
      this.addLast(data);
      return;
    }

    this.assertNoDuplicateId(data);

    const node = new ListNode<T>(data);
    const currentAtIndex = this.getNodeAt(index);
    const prevNode = currentAtIndex.prev;

    node.next = currentAtIndex;
    node.prev = prevNode;
    currentAtIndex.prev = node;
    if (prevNode) {
      prevNode.next = node;
    }

    this.length += 1;
  }

  /**
   * Remove the first node whose data contains a numeric id equal to the provided id.
   * @param id Identifier to remove.
   * @throws Error If the list is empty.
   * @throws Error If no node is found with the provided id.
   */
  public deleteById(id: number): void {
    if (!this.head || !this.tail || this.length === 0) {
      throw new Error('Cannot delete by id from an empty list.');
    }
    if (typeof id !== 'number' || !Number.isFinite(id)) {
      throw new Error('Id must be a finite number.');
    }

    let current: ListNode<T> | null = this.head;
    while (current) {
      const currentId = this.getIdFromData(current.data);
      if (currentId === id) {
        const prevNode = current.prev;
        const nextNode = current.next;

        if (prevNode) {
          prevNode.next = nextNode;
        } else {
          this.head = nextNode;
        }

        if (nextNode) {
          nextNode.prev = prevNode;
        } else {
          this.tail = prevNode;
        }

        this.length -= 1;
        if (this.length === 0) {
          this.head = null;
          this.tail = null;
        }
        return;
      }
      current = current.next;
    }

    throw new Error(`Node with id ${id} was not found.`);
  }

  /**
   * Return all elements in the list as an array (from head to tail).
   * @returns Array of elements.
   */
  public getAll(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Return the total number of nodes in the list.
   * @returns Node count.
   */
  public getLength(): number {
    return this.length;
  }

  /**
   * Find the first element whose data contains a numeric id equal to the provided id.
   * @param id Identifier to search for.
   * @returns The element if found; otherwise null.
   * @throws Error If id is not a finite number.
   */
  public findById(id: number): T | null {
    if (typeof id !== 'number' || !Number.isFinite(id)) {
      throw new Error('Id must be a finite number.');
    }

    let current = this.head;
    while (current) {
      const currentId = this.getIdFromData(current.data);
      if (currentId === id) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Return the head node reference (or null if the list is empty).
   * @returns Head node.
   */
  public getHead(): ListNode<T> | null {
    return this.head;
  }

  /**
   * Return the tail node reference (or null if the list is empty).
   * @returns Tail node.
   */
  public getTail(): ListNode<T> | null {
    return this.tail;
  }

  /**
   * Get the internal node reference at a specific index.
   * @param index Zero-based node index. Must be within 0..length-1.
   * @returns Node at the provided index.
   * @throws Error If index is out of bounds.
   */
  private getNodeAt(index: number): ListNode<T> {
    if (index < 0 || index >= this.length) {
      throw new Error(
        `Index out of bounds. Received ${index}, but valid range is 0 to ${Math.max(
          0,
          this.length - 1,
        )}.`,
      );
    }
    if (!this.head || !this.tail) {
      throw new Error('Internal error: list is in an invalid state.');
    }

    if (index <= Math.floor(this.length / 2)) {
      let current = this.head;
      let currentIndex = 0;
      while (currentIndex < index) {
        current = current.next as ListNode<T>;
        currentIndex += 1;
      }
      return current;
    }

    let current = this.tail;
    let currentIndex = this.length - 1;
    while (currentIndex > index) {
      current = current.prev as ListNode<T>;
      currentIndex -= 1;
    }
    return current;
  }

  /**
   * Extract a numeric id from an element if present.
   * @param data Element to extract id from.
   * @returns Numeric id if present; otherwise null.
   */
  private getIdFromData(data: T): number | null {
    const maybeId = (data as unknown as { id?: unknown })?.id;
    if (typeof maybeId !== 'number' || !Number.isFinite(maybeId)) {
      return null;
    }
    return maybeId;
  }

  /**
   * Ensure that no existing node in the list already has the same numeric id.
   * @param data Element to check.
   * @throws Error If a duplicate numeric id exists.
   */
  private assertNoDuplicateId(data: T): void {
    const id = this.getIdFromData(data);
    if (id === null) return;

    const existing = this.findById(id);
    if (existing !== null) {
      throw new Error(`Duplicate id detected: ${id}.`);
    }
  }
}
