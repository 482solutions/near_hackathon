import { create } from "ipfs-http-client";
import { useEffect, useState } from "react";

const ipfsConfig = {
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
};

const useIpfs = () => {
  const [client, setClient] = useState();
  useEffect(() => {
    const instance = create(ipfsConfig);
    setClient(instance);
  }, []);

  return { client };
};

export default useIpfs;
