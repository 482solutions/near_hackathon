import { Button, Grid, Box } from "@mui/material";
import { Contract, transactions } from "near-api-js";

import React, { useState } from "react";
import CreateButton from "../../../components/buttons/CreateButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import CustomizedReadInput from "../../../components/inputs/CustomizedReadInput";
import CustomizedModal from "../../../components/modal/CustomizedModal";
import CustomizedSelect from "../../../components/select/CustomizedSelect";
import TitleText from "../../../components/texts/TitleText";

const inputNames = ["Facility", "Creation time", "MWh", "Price", "Currency"];

const CellsModalSection = ({
  data,
  isModalOpen,
  setIsModalOpen,
  setIsExchange,
}) => {
  const [value, setValue] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (id, ownerId, price) => {
    const contract = await new Contract(
      window.walletConnection.account(),
      process.env.REACT_APP_NFT_DEV_ACCOUNT_ID,
      {
        viewMethods: [],
        changeMethods: ["nft_approve"],
      }
    );

    await contract["nft_approve"](
      {
        token_id: id,
        account_id: `market.${process.env.REACT_APP_NFT_DEV_ACCOUNT_ID}`,
        msg: JSON.stringify({
          sale_conditions: `${price}000000000000000000000000`,
        }),
      },
      "300000000000000",
      "1510000000000000000000"
    );
    setIsExchange((prev) => ({ ...prev, [ownerId]: true }));
  };

  return (
    <CustomizedModal
      open={isModalOpen}
      handleClose={() => setIsModalOpen(false)}
    >
      <TitleText title={`Publish certificate no #${data.id} for sale`} />
      <Grid container flexDirection={"column"} gap="19px">
        {inputNames.map((i, idx) => {
          if (i === "Currency") {
            return (
              <CustomizedSelect
                options={[{ value: "Near", label: "Near" }]}
                value={"Near"}
                variant="standard"
                labelName={i}
                key={idx}
                fullWidth
              />
            );
          }
          if (i === "Price") {
            return (
              <Grid key={idx}>
                <CustomizedReadInput
                  controlled
                  type="number"
                  labelName={i}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                />
              </Grid>
            );
          }
          return (
            <Grid key={idx}>
              <CustomizedReadInput
                defaultValue={data[i]}
                disabled
                labelName={i}
              />
            </Grid>
          );
        })}
      </Grid>
      <Grid
        container
        sx={{ height: "36px", marginTop: "48px" }}
        justifyContent={"center"}
        gap="10px"
      >
        <SecondaryButton
          text={"Cancel"}
          onClick={() => setIsModalOpen(false)}
        />
        <Box
          sx={{
            maxWidth: "181px",
            height: "100%",
            button: { fontSize: "14px" },
          }}
        >
          <CreateButton
            text="Publish for sale"
            onClick={() => handleSubmit(data.id, data.accountId, value)}
            disabled={disabled}
          />
        </Box>
      </Grid>
    </CustomizedModal>
  );
};

export default CellsModalSection;
