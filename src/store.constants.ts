import { GeneralListResponse } from 'src/models/response/GeneralList.response';

export const defaultResponse: GeneralListResponse<any> = {
  pageIndex: 1,
  data: [],
  total: 0,
};
