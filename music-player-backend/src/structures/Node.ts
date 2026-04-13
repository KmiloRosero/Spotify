export class ListNode<T> {
  public data: T;
  public next: ListNode<T> | null;
  public prev: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}
