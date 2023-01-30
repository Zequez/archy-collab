import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";
import { useState } from "react";

type TeamSpace = {
  name: string;
  passphrase: string;
  uid: string;
};

const App = ({ teamId }: { teamId: string }) => {
  return (
    <PassphraseProtected passphrase="possibilities">
      <div>You are on the space</div>
    </PassphraseProtected>
  );
};

const typedRoomPasswordStore = persistentAtom<string>("userPass", "");

const PassphraseProtected = ({
  passphrase,
  children,
}: {
  passphrase: string;
  children: any;
}) => {
  const passInput = useStore(typedRoomPasswordStore);
  const [doingSuccessTimeout, setDoingSuccessTimeout] = useState(false);

  function setPassphrase(val: string) {
    if (passphrase === val) {
      setDoingSuccessTimeout(true);
      setTimeout(() => {
        setDoingSuccessTimeout(false);
      }, 1500);
    }
    typedRoomPasswordStore.set(val);
  }

  console.log(passInput, passphrase, doingSuccessTimeout);

  if (passInput !== passphrase || doingSuccessTimeout) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-400">
        <div className="bg-gray-100 rounded-md p-4 shadow-md">
          <div className="pb-2">
            What's the secret passphrase to access this space?
          </div>
          <input
            className="p-2 border border-solid border-gray-300 rounded-md text-lg text-center block w-full"
            value={passInput}
            onChange={(ev) => setPassphrase(ev.target.value)}
          />
          {doingSuccessTimeout && (
            <div className="text-2xl text-center mt-2 opacity-50">Correct!</div>
          )}
        </div>
      </div>
    );
  } else {
    return <>{children}</>;
  }
};

export default App;
