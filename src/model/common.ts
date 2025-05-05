export interface IPaging {
  current_page: number;
  total_count: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

export enum STATUS {
    SUCCESS = 'success',
    FAILURE = 'failure'
  }
export type DataResponse<T> = {
    status: STATUS,
    data?: T,
    meta?: IPaging
}

export interface IToken {
    access_token: string;
    refresh_token: string;
}