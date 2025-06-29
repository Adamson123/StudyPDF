import { ChangeEvent } from "react";

export const getNumberInput = (e: ChangeEvent<HTMLInputElement>) =>
  (e.target.value === "" ? "" : Number(e.target.value)) as any;
