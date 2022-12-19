export type ItemRenderer = (props: {
  input: string | null;
}) => JSX.Element | string;
export class Item<K> {
  dataFrom: keyof K;
  title: string;
  renderWith: ItemRenderer;

  constructor(dataFrom: keyof K, title: string, renderWith: ItemRenderer) {
    this.dataFrom = dataFrom;
    this.title = title;
    this.renderWith = renderWith;
  }
}
