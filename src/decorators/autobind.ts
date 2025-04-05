export function autobind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalmethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalmethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
