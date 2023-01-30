type IndividualItem = {
  name: string;
  component: "text" | "birthdate" | "avatar" | "link";
};

type TeamSpace = {
  name: string;
  passphrase: string;
  uid: string;
  individualItems: string[];
};

type Participant = {
  teamspaces: TeamSpace[];
  teamspaceData: { [key: string]: string };
};

const participants = {};

export const get = (req: Request) => {
  return {
    body: JSON.stringify(participants),
  };
};
