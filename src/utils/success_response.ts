export type SuccessResponse = {
  code: number;
  message: string;
  body: object;
};
export class SuccessResult {
  code: number;
  message: string;
  body: object;
  constructor(data: { code: number; message: string; body: object }) {
    this.code = data.code;
    this.message = data.message;
    this.body = data.body;
  }
}
