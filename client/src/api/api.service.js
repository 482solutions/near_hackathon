import { MEASURMENTS, ORGANISATIONS, STATION } from "./api.endpoints";
import { httpClient } from "./httpClient";

export const getOrganisations = async () => {
  const res = await httpClient.get(ORGANISATIONS);
  return res?.data;
};

export const createOrganisation = async (body) => {
  const res = await httpClient.post(ORGANISATIONS, body);
  return res?.data;
};

export const getStation = async () => {
  const res = await httpClient.get(STATION);
  return res?.data;
};

export const createStation = async (body) => {
  const res = await httpClient.post(STATION, body);
  return res?.data;
};

export const createMeasurment = async (body) => {
  const res = await httpClient.post(MEASURMENTS, body);
  return res?.data;
};
