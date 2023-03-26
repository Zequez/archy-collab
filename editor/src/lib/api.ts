import { useEffect, useState } from "react";
import { Store, Resource, Agent } from "@tomic/react";

export { Store, Resource, Agent };

import initialWebsite from "./initialWebsite";

export const NAMESPACE = "archy-collab";
export const ANONYMOUS_PUBLIC_KEY =
  "eyJjbGllbnQiOnt9LCJzdWJqZWN0IjoiaHR0cHM6Ly9hdG9taWNkYXRhLmRldi9hZ2VudHMvQ0Nla2xVNUo0Y3h5anR2dmJTYU1sOEhtY2JCY2lRbElJTEpXcVRGQUxmST0iLCJwcml2YXRlS2V5Ijoid2xqa29LRlRRK1A4RUZPNHNibXlhOXVSVFd4NE44WkluMmxaSHlhOStJTT0iLCJwdWJsaWNLZXkiOiJDQ2VrbFU1SjRjeHlqdHZ2YlNhTWw4SG1jYkJjaVFsSUlMSldxVEZBTGZJPSJ9";

export const urls = {
  htmlDocument: "https://atomicdata.dev/property/html-document",
  error: "https://atomicdata.dev/classes/Error",
  isA: "https://atomicdata.dev/properties/isA",
  noclass: "https://atomicdata.dev/noclass",
  name: "https://atomicdata.dev/properties/name",
  parent: "https://atomicdata.dev/properties/parent",
  archyCollab: "https://atomicdata.dev/drive/jn6aczrpfg",
  invitationFolder: "https://atomicdata.dev/Folder/xdi4s7bzo9",
  invitations: "https://atomicdata.dev/invite/4n1xa3ygbx9",
};

export function isError(resource: Resource): boolean {
  return (resource.get(urls.isA) as string[]).includes(urls.error);
}

export const store = new Store({
  serverUrl: "https://atomicdata.dev",
});

export async function createNewResource(
  subjectUrl: string,
  propVals: { [x: string]: string | string[] }
) {
  const resource = new Resource(subjectUrl, true);
  await Promise.all([
    ...Object.entries(propVals).map(([key, val]) =>
      resource.set(key, val, store)
    ),
  ]);
  await resource.save(store);
  return resource;
}

export type ServerDoc = {
  htmlDocument: string;
};

export type useDocumentFromServerState = [
  ServerDoc | null,
  (doc: ServerDoc) => void,
  boolean
];

export function useDocumentFromServer(
  agent: Agent | null,
  documentPath: string
): useDocumentFromServerState {
  const [serverDocument, setServerDocument] = useState<ServerDoc | null>(null);
  const [resource, setResource] = useState<Resource | null>(null);
  // const [loading, setLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);

  const resourceUrl = `https://atomicdata.dev/${NAMESPACE}/${documentPath}`;

  useEffect(() => {
    if (agent) {
      (async function () {
        let resource = await store.fetchResourceFromServer(resourceUrl);

        const resourceDoesNotExist = isError(resource);

        if (resourceDoesNotExist) {
          resource = await createNewResource(resourceUrl, {
            [urls.parent]: urls.invitationFolder,
            [urls.htmlDocument]: initialWebsite,
            [urls.isA]: [urls.noclass],
            [urls.name]: documentPath,
          });
        }

        setResource(resource);

        const serverHtml = resource.get(urls.htmlDocument) as string;

        store.addResources();

        setServerDocument({ htmlDocument: serverHtml });
      })();
    }
  }, [agent]);

  async function commit(doc: ServerDoc) {
    if (resource) {
      setCommitLoading(true);
      await resource.set(urls.htmlDocument, doc.htmlDocument, store);
      console.log("Save!", await resource.save(store));
      setCommitLoading(false);
    }
  }

  return [serverDocument, commit, commitLoading];
}
