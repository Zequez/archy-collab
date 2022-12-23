const Text = ({ input }: { input: string | null }): JSX.Element => {
  return (
    <div className="p-2 h-full border-b border-dashed border-gray-300 border-r whitespace-pre-wrap">
      {input || ""}
    </div>
  );
};

export default Text;
