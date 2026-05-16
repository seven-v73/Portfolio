export function cloneItem<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const nextItems = [...items];
  const [item] = nextItems.splice(from, 1);
  nextItems.splice(to, 0, item);
  return nextItems;
}
