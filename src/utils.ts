export const firstOf = (input: string | string[] | undefined): string | undefined => {
  if (typeof input === 'undefined') {
    return undefined;
  }

  if (Array.isArray(input)) {
    return input[0];
  }

  return input;
};
