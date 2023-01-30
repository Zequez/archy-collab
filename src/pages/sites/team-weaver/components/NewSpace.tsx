import { useEffect, useState } from "react";
import { supabase } from "@lib/api";
import type { Session } from "@supabase/gotrue-js/src/lib/types";
import Auth from "./Auth";

const NewSpace = () => {
  const [userSession, setUserSession] = useState<"loading" | null | Session>(
    "loading"
  );
  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      setUserSession(session);
    })();
  }, []);
  return (
    <div>
      {userSession === "loading" ? (
        "Loading..."
      ) : !userSession ? (
        <Auth />
      ) : (
        <div>
          You are logged
          <pre>{JSON.stringify(userSession.user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default NewSpace;
