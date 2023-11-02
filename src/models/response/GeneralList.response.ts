export interface GeneralListResponse<T> {
  pageIndex?: number;
  total: number;
  data: T[];
}
