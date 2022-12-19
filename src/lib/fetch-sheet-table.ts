type Transformer = (person: any) => Promise<any> | any;

const apiHost = import.meta.env.DEV
  ? "http://localhost:5000/"
  : "http://gsheets-api-service.zequez.space/";

async function fetchSheetTable(
  sheetId: string,
  range: string,
  transformers: Transformer[] = []
) {
  const url = `${apiHost}api?id=${sheetId}&range=${range}`;

  const response = await fetch(url);
  const data = await response.json();
  const headers: string[] = data.values[0];
  const rows: string[][] = data.values.slice(1);

  const rowsObjects = rows.map((row) =>
    Object.fromEntries(row.map((val, j) => [headers[j], val]))
  );

  for (let transformer of transformers) {
    await Promise.all(
      rowsObjects.map(async (p, i) => {
        const newData = await transformer(p);
        Object.assign(rowsObjects[i], newData);
      })
    );
  }

  return rowsObjects;
}

export default fetchSheetTable;
