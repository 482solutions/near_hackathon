import { httpClient } from "./httpClient";

const ORGANISATIONS = "/organisation";

export const getOrganisations = (key) => {
  const res = httpClient.post(ORGANISATIONS, { privateKey: key });
  return res?.data;
};
