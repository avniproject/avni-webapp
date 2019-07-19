const config = {
  orgName: `${
    process.env.OPENCHS_ORG_NAME !== undefined
      ? process.env.OPENCHS_ORG_NAME
      : "OpenCHS"
  }`,
  orgClassName: orgId => (orgId === 1 ? "black" : "text-primary")
};

export default config;
