import { Button, TableCell, TableRow } from "@mui/material";
import { Contract } from "near-api-js";
import React, { useRef } from "react";
import { BtnStyle } from "../../my-eacs/components/EacsTableCell";

const MarketDataCell = ({ data, keyWord }) => {
  const dataRef = useRef({
    Asks: [
      "N/A",
      "N/A",
      data.sale_conditions,
      <Button sx={BtnStyle} onClick={() => handlePurchase(data.token_id)}>
        Buy
      </Button>,
    ],
    Bids: [data.sale_conditions, "N/A", "N/A"],
  });

  async function handlePurchase(tokenId) {
    const contract = await new Contract(
      window.walletConnection.account(),
      `market.${process.env.REACT_APP_NFT_DEV_ACCOUNT_ID}`,
      {
        viewMethods: [],
        changeMethods: ["direct_ask_sell"],
      }
    );
    await contract["direct_ask_sell"]({
      id: tokenId,
    });
  }

  return (
    <TableRow>
      {data.view &&
        Object.values(data.view).map((i, idx) => {
          return <TableCell key={idx}>{i}</TableCell>;
        })}
    </TableRow>
  );
};

export default MarketDataCell;
