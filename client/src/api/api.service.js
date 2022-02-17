import { MEASURMENTS, NFT, ORGANISATIONS, STATION } from "./api.endpoints";
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

export const getStationByOrgAndStationName = async (organisation, station) => {
  const res = await httpClient.get(`${STATION}/${organisation}/${station}`);
  return res?.data;
};

export const createStation = async (body) => {
  const res = await httpClient.post(STATION, body);
  return res?.data;
};

export const createMeasurment = async (body) => {
  const res = await httpClient.patch(MEASURMENTS, body);
  return res?.data;
};

export const getMeasurments = async (org = null, station = null) => {
  const res = await httpClient.get(`${MEASURMENTS}/${org}/${station}`);
  return res?.data;
};

export const createNFT = async (body) => {
  const res = await httpClient.post(NFT, body);
  return res?.data;
};

export const getNFTs = async (owner) => {
  const res = await httpClient.get(
    `${NFT}${owner !== undefined ? `?owner=${owner}` : ""}`
  );
  return res?.data;
};

export const getNFTById = async (id) => {
  const res = await httpClient.get(`${NFT}/${id}`);
  return res?.data;
};
