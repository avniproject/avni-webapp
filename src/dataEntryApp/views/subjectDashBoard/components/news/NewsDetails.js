import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import API from "../../../../../news/api";
import NewsDetailsCard from "../../../../../news/components/NewsDetailsCard";
import { Paper } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(5),
  marginLeft: theme.spacing(10),
  marginRight: theme.spacing(10),
  padding: theme.spacing(5),
  paddingTop: theme.spacing(3)
}));

export default function NewsDetails({ history, ...props }) {
  const [news, setNews] = useState({});

  useEffect(() => {
    API.getNewsById(props.match.params.id)
      .then(res => res.data)
      .then(res => setNews(res));
  }, []);

  return (
    <StyledPaper>
      <NewsDetailsCard news={news} history={history} displayActions={false} />
    </StyledPaper>
  );
}
