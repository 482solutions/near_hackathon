import { Button, Grid, Box } from "@mui/material";
import React from "react";
import CreateButton from "../../../components/buttons/CreateButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import CustomizedInput from "../../../components/inputs/CustomizedInput";
import CustomizedReadInput from "../../../components/inputs/CustomizedReadInput";
import CustomizedModal from "../../../components/modal/CustomizedModal";
import CustomizedSelect from "../../../components/select/CustomizedSelect";
import TitleText from "../../../components/texts/TitleText";

const inputNames = ["Facility", "Creation time", "MWh", "Price", "Currency"];

const CellsModalSection = ({ id, isModalOpen, setIsModalOpen }) => {
  return (
    <CustomizedModal
      open={isModalOpen}
      handleClose={() => setIsModalOpen(false)}
    >
      <TitleText title={`Publish certificate no #${id} for sale`} />
      <Grid container flexDirection={"column"} gap="19px">
        {inputNames.map((i, idx) => {
          if (i === "Currency") {
            return (
              <CustomizedSelect
                options={[{ value: "asd", label: "asd" }]}
                variant="standard"
                labelName={i}
                key={idx}
              />
            );
          }
          return (
            <Grid key={idx}>
              <CustomizedReadInput labelName={i} />
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
          <CreateButton text="Publish for sale" />
        </Box>
      </Grid>
    </CustomizedModal>
  );
};

export default CellsModalSection;
