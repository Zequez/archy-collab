import fetchSheetTable from "./fetch-sheet-table";
import {
  telegramTransformer,
  TelegramTransformerAdditions,
} from "@/lib/telegram-tools";

const SHEET_ID = "1UEa0Zpwu6YV4STZMQK4hjjOnBj0prpeh6zalVciWSq4";
const SHEET_RANGE = `Responses`;

export type Person = {
  Timestamp: string;
  "Email Address": string;
  Website: string;
  "Job Title": string;
  "Telegram Handle": string;
  "Freeform Writing Space": string;
  "Subscribe to my newsletter?": string;
  "Full Name": string;
  "Gratitude Virtual Currency Accounting": string;
} & TelegramTransformerAdditions;

async function getData(): Promise<Person[]> {
  return (await fetchSheetTable(SHEET_ID, SHEET_RANGE, [
    telegramTransformer("Telegram Handle"),
  ])) as Person[];
}

export default getData;
