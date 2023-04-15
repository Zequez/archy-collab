import { useEffect, useState } from "react";
import { ANONYMOUS_PUBLIC_KEY, Agent, store } from "./api";

export const useAgent = (
  onCancel: () => void
): [Agent | null, (agentSecret: string) => void] => {
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const agentSecret =
      localStorage.getItem("agentSecret") ||
      prompt(
        "Secret key? If none is supplied a public anonymous key will be used; anyone will also be able to edit this page."
      ) ||
      ANONYMOUS_PUBLIC_KEY;
    if (agentSecret) {
      setAgentFromSecret(agentSecret);
    } else {
      onCancel();
    }
  }, []);

  function setAgentFromSecret(secret: string) {
    const newAgent = Agent.fromSecret(secret);
    localStorage.setItem("agentSecret", secret);
    store.setAgent(newAgent);
    setAgent(newAgent);
  }

  return [agent, setAgentFromSecret];
};
