import { useState, useEffect } from "react";
import {
  useArray,
  useString,
  properties,
  Datatype,
  useResource,
  useCurrentAgent,
  Agent,
  Store,
  StoreContext,
  StoreEvents,
} from "@tomic/react";
import { atom } from "nanostores";
import {
  getAgentFromLocalStorage,
  saveAgentToLocalStorage,
} from "@lib/agentStorage";

// type BlankSiteProps = {
//   initialContent: string;
// }

// const agentStore = atom<Agent | null>(null);

const initialAgent = getAgentFromLocalStorage();
console.log("Initial agent", initialAgent);
const store = new Store({
  agent: initialAgent,
  serverUrl: "https://atomicdata.dev",
});
store.on(StoreEvents.AgentChanged, saveAgentToLocalStorage);

const App = () => {
  return (
    <StoreContext.Provider value={store}>
      <BlankSite />
    </StoreContext.Provider>
  );
};

const BlankSite = ({}: {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const moduleConfig = useResource(
    "https://atomicdata.dev/module-config/tlpiqvfbd2e"
  );
  const [configJson, setConfigJson] = useString(
    moduleConfig,
    "https://atomicdata.dev/property/pq0cvnocfr",
    { commit: true }
  );
  const [text, setText] = useState(configJson);

  useEffect(() => {
    setText(configJson);
  }, [configJson]);

  useEffect(() => {
    console.log("Config JSON changed", configJson);
    if (configJson) {
      setIsLoading(false);
    }
  }, [configJson]);

  // useEffect(() => {
  //   store.on(StoreEvents.AgentChanged, () => )
  // }, [])

  // const [secretKey, setSecretKey] = useState("");
  // const [agent, setAgent] = useCurrentAgent();
  const [agent, setAgent] =
    typeof window === "undefined" ? useState<Agent>() : useCurrentAgent();
  // const [agent, setAgent] = useState<Agent>();

  function handleUpdateSecretKey(secret: string) {
    console.log(secret);
    try {
      const newAgent = Agent.fromSecret(secret);
      setAgentIfChanged(agent, newAgent);
      console.log(newAgent);
    } catch (e) {
      alert("Invalid key");
    }
  }

  function setAgentIfChanged(oldAgent: Agent | undefined, newAgent: Agent) {
    if (JSON.stringify(oldAgent) !== JSON.stringify(newAgent)) {
      setAgent(newAgent);
    }
  }

  return (
    <div className="relative h-screen w-screen">
      {isLoading ? (
        <div className="text-3xl flex items-center justify-center h-full w-full">
          Loading...
        </div>
      ) : (
        <>
          <textarea
            value={text}
            className="block h-screen w-screen box-border resize-none"
            onChange={(ev) => setText(ev.target.value)}
          ></textarea>
          <div className="absolute bottom-0 right-0">
            {agent ? (
              <>
                <button
                  className=" bg-red-400 active:bg-red-600 text-white uppercase p-2 mr-4 mb-4 font-bold rounded-md"
                  onClick={() => setConfigJson(text)}
                >
                  Publish
                </button>
                <button className=" bg-gray-400 active:bg-gray-600 text-white uppercase p-2 mr-4 mb-4 font-bold rounded-md">
                  Sign out
                </button>
              </>
            ) : (
              <button
                className="bg-blue-400 active:bg-blue-600 text-white uppercase p-2 mr-4 mb-4 font-bold rounded-md"
                onClick={() =>
                  handleUpdateSecretKey(prompt("Enter your key") || "")
                }
              >
                Keyhole
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
