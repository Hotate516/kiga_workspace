import '@testing-library/jest-dom';

// JSDOM doesn't implement some layout-related APIs, which are required by ProseMirror (Tiptap's core).
// This is a workaround to prevent errors in the test environment.
if (typeof window !== 'undefined') {
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: () => {},
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: function* () {},
      } as unknown as DOMRectList;
    };

    return range;
  };
}
