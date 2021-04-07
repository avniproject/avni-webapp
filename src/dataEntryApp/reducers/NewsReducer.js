const prefix = "app/dataEntry/reducer/news/";

export const types = {
  GET_NEWS: `${prefix}GET_NEWS`,
  SET_NEWS: `${prefix}SET_NEWS`,
  SET_IS_NEWS_AVAILABLE: `${prefix}SET_IS_NEWS_AVAILABLE`
};

export const getNews = () => ({
  type: types.GET_NEWS
});

export const setNews = newsList => ({
  type: types.SET_NEWS,
  newsList
});

export const setIsNewsAvailable = isNewsAvailable => ({
  type: types.SET_IS_NEWS_AVAILABLE,
  isNewsAvailable
});

const initialState = {
  newsList: [],
  isNewsAvailable: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_NEWS: {
      return {
        ...state,
        newsList: action.newsList
      };
    }
    case types.SET_IS_NEWS_AVAILABLE: {
      return {
        ...state,
        isNewsAvailable: action.isNewsAvailable
      };
    }
    default:
      return state;
  }
}

export const selectIsNewsAvailable = state => state.dataEntry.news.isNewsAvailable;
export const selectNewsList = state => state.dataEntry.news.newsList;
