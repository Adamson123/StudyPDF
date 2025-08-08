import { ChangeEvent } from "react";

export const getNumberInput = (e: ChangeEvent<HTMLInputElement>) =>
  (e.target.value === "" ? "" : Number(e.target.value)) as any;

export const delay = async (ms: number = 1000) => {
  new Promise((resolve) => setTimeout(resolve, ms));
};
