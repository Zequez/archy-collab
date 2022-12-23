type AvatarBubbleProps = {
	x: number,
	y: number;
	size: number;
	src: string;
}

const AvatarBubble = ({ x, y, size, src }: AvatarBubbleProps) => {
	const baseSize = 160;
	const sizePx = baseSize * size / 100;
	const borderClass = size < 50 ? "border-2" : "border-2";
	const delayMin = 0;
	const delayMax = 1;
	const delay = delayMin + (1 - size/100) * delayMax;


	return <div className="absolute inset-0 flex items-center justify-center">
		<img 
			src={src}
			className={`rounded-full ${borderClass} border-solid border-white border-opacity-75 w-40 h-40 shadow-md relative`}
			style={{
				left: `${x}px`,
				top: `${y}px`,
				height: `${sizePx}px`,
				width: `${sizePx}px`,
				animation: `wait ${delay}s, fadeIn 1s ${delay}s`
			}}
			alt="Picture of me" />
	</div>;

}

export default AvatarBubble;