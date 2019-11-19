export type Part =
  | string
  | ['rect', [number, number, number, number, number, number]];
export type Parts = Array<Part>;

export type IconsPaths = {
  [key: string]: Parts;
};
