const Image = ({ input }: { input: string | null }): JSX.Element => {
  const src = input || "/placeholder-avatar.svg";
  return (
    <div className="h-52 w-full p-2 flex items-center border-b border-dashed border-gray-300 border-r">
      <img
        src={src}
        className="h-full w-full object-cover rounded-md shadow-md border border-gray-300"
      />
    </div>
  );
};

export default Image;
