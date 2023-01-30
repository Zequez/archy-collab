import { atom, useAtom } from "jotai";

type BoxState = {
  position: "static" | "absolute";
  content: BoxState[] | HTMLElement[];
};

const rootBoxes = atom<BoxState[]>([]);

const App = () => {
  const [boxes, setBoxes] = useAtom(rootBoxes);
  const addBox = (ev: React.MouseEventHandler<HTMLDivElement>) => {};
  return (
    <div className="bg-red-500 h-screen w-screen overflow">Hello there</div>
  );
};

const Box = ({ position, content }: BoxState) => {};

export default App;
