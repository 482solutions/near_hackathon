import { allCountries } from "country-region-data";

const transformedToSelectCountries = allCountries.map((i, idx) => ({
  value: idx,
  label: i[0],
}));

export const InputsData = {
  Station: [
    {
      title: "Facility name",
      required: true,
    },
    {
      title: "Device type",
      isSelect: true,
      options: [
        "Solar",
        "Wind",
        "Liquid",
        "Hydro - Electric head",
        "Gaseous",
        "Thermal",
      ].map((i) => ({ label: i, value: i })),
      required: true,
    },
    {
      title: "Plant performance",
      required: true,
    },
    {
      title: "Governemnt support",
      required: true,
    },
    {
      title: "Investment support",
      required: true,
    },
    {
      title: "Date of starting commercial explotation",
      type: "Date",
      required: true,
    },
    {
      title: "Date of creation",
      type: "Date",
      required: true,
    },
    {
      title: "Country",
      isSelect: true,
      required: true,
      options: transformedToSelectCountries,
    },
    {
      title: "Region",
      isSelect: true,
      options: [],
      required: true,
      default: "",
    },
    {
      title: "Manufacturer Country",
      isSelect: true,
      required: true,
      options: transformedToSelectCountries,
    },
  ],
  Company: [
    {
      title: "Organization Name",
      required: true,
    },
    {
      title: "Organization Address",
      required: true,
    },
    {
      title: "Business type",
      required: true,
      isSelect: true,
      options: ["Private", "Public", "Holding and Subsidary", "Associate"].map(
        (i) => ({ value: i, label: `${i} Companies` })
      ),
    },
    {
      title: "Trade Registry Company number",
      required: true,
    },
    {
      title: "Signatory Full Name",
      required: true,
    },
    {
      title: "Signatory Address",
      required: true,
    },
    {
      title: "Signatory Email",
      required: true,
    },
    {
      title: "Signatory Telephone",
      required: true,
    },
  ],
  EAC: [
    {
      title: "Start date of creation",
      type: "Date",
      required: true,
      default: "",
    },
    {
      title: "End date of creation",
      type: "Date",
      required: true,
      default: "",
    },
    {
      title: "Amount of energy in MWh",
      required: true,
      default: "",
    },
    {
      title: "Stations",
      options: [],
      isSelect: true,
      required: true,
    },
  ],
};
