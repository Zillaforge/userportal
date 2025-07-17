export type FilterMatch =
  | boolean
  | number
  | [number, number]
  | [number, number][];

export type DataTableItemValue =
  | boolean
  | string
  | number
  | null
  | undefined
  | Date
  | (string | number)[]
  | Record<string, any>;
interface InternalItem<T = any> {
  [x: string]: any;
  value: any;
  raw: T;
}

export interface SortItem {
  key: string;
  order?: boolean | 'asc' | 'desc';
}

export type FilterFunction = (
  value: string,
  query: string,
  item?: InternalItem
) => FilterMatch;
