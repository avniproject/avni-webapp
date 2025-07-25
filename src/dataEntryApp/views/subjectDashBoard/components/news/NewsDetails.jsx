import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
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

const NewsDetails = () => {
  const [news, setNews] = useState({});
  const { id } = useParams();

  useEffect(() => {
    API.getNewsById(id)
      .then(res => res.data)
      .then(res => setNews(res));
  }, [id]);

  return (
    <StyledPaper>
      <NewsDetailsCard news={news} displayActions={false} />
    </StyledPaper>
  );
};

export default NewsDetails;
