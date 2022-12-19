import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import cx from "classnames";

type CardProps = {
  name: string;
  job: string;
  website: string;
  email: string;
  telegram: string;
  writing: string;
  avatar: string | null;
  subscribed: string;
  timestamp: string;
};

function Card({
  name,
  job,
  website,
  email,
  telegram,
  writing,
  avatar,
  subscribed,
  timestamp,
}: CardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const avatarUrl =
    avatar ||
    `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=200`;

  return (
    <li>
      <MiniCard
        name={name}
        job={job}
        avatar={avatarUrl}
        hidden={isOpen}
        onOpen={() => setIsOpen(true)}
      />
      {isOpen ? (
        <FullCard
          name={name}
          job={job}
          avatar={avatarUrl}
          website={website}
          email={email}
          telegram={telegram}
          writing={writing}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </li>
  );
}

const MiniCard = ({
  name,
  job,
  avatar,
  hidden,
  onOpen,
}: {
  name: string;
  job: string;
  avatar: string;
  hidden: boolean;
  onOpen: () => void;
}) => {
  return (
    <div
      className={cx(
        `rounded-md shadow-sm
      border border-gray-200 bg-white
      cursor-pointer hover:shadow-lg transition-all`,
        { "": hidden }
      )}
      onClick={onOpen}
    >
      <div className="h-56 overflow-hidden">
        <img src={avatar} className="rounded-t-md object-cover w-full h-full" />
      </div>
      <div className="p-4">
        <h2 className="font-semibold">{name}</h2>
        <p className="text-gray-500">{job}</p>
      </div>
    </div>
  );
};

const FullCard = ({
  name,
  job,
  avatar,
  website,
  email,
  telegram,
  writing,
  onClose,
}: {
  name: string;
  job: string;
  avatar: string;
  website: string;
  email: string;
  telegram: string;
  writing: string;
  onClose: () => void;
}) => {
  // const modalRoot = document.getElementById("modal-root");
  useEffect(() => {
    if (window) {
      window.document.body.style.overflow = "clip";
    }
    return () => {
      window.document.body.style.overflow = "";
    };
  }, []);

  const telegramClean = telegram.replace(/^@/, "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 overflow-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-10 z-10"
        onClick={onClose}
      ></div>
      <div
        className={`
        min-h-screen
        md:min-h-0
        md:mt-8
        bg-white border-gray-200 md:rounded-md md:border md:p-1.5
        shadow-sm md:shadow-lg
        relative z-20 mx-auto  max-w-lg
        `}
      >
        <div className="w-full aspect-square overflow-hidden">
          <img src={avatar} className="md:rounded-t-md w-full object-cover" />
        </div>
        <div
          onClick={onClose}
          className="flex items-center justify-center text-2xl bg-white text-black opacity-80 rounded-full h-12 w-12 absolute top-4 left-4 shadow-lg cursor-pointer"
        >
          &larr;
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-gray-500 mb-4">{job}</p>
          {website && <CardLink text={website} href={website} />}
          {email && <CardLink text={email} href={`mailto:${email}`} />}
          {telegramClean && (
            <CardLink
              text={`@${telegramClean}`}
              href={`https://t.me/${telegramClean}`}
            />
          )}
          <p className="mt-4 text-gray-700 whitespace-pre-wrap">{writing}</p>
        </div>
      </div>
    </div>
  );
};

const CardLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <a
      className="link inline-block bg-green-100 border border-green-200 rounded-md py-1 px-2 mr-2 mb-2"
      href={href}
    >
      {text}
    </a>
  );
};

export default Card;
