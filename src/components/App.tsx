import { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

interface Post {
  id: string;
  title: string;
  publishDate: string;
  author: {
    name: string;
    avatar: string;
  };
  summary: string;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

const StyledFlexCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 992px) {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  padding: 50px 0;

  @media (max-width: 992px) {
    font-size: 12px;
    padding: 0;
  }
`;

const StyledPostsContainer = styled.div`
  max-width: 1200px;
  background-color: #333333;
  color: #ffffff;
  border-radius: 12px;
  padding: 20px;

  th {
    border-bottom: 1px solid #333333;
    padding: 4px 0;
  }

  @media (max-width: 992px) {
    max-width: 100%;
    border-radius: 0;
    padding: 20px 0;

    img {
      display: none;
    }
  }
`;

const StyledTd = styled.td`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StyledPaginationContainer = styled.div`
  width: 100%;
  border-top: 1px solid #333;
  padding: 12px 0;
  margin-top: 12px;

  button {
    background-color: #d3d3d3;
    border-radius: 12px;
    border: none;
    font-size: 18px;
    padding: 6px 12px;
    cursor: pointer;
    margin: 0 3px;
  }

  @media (max-width: 992px) {
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      font-size: 8px;
    }
  }
`;

const StyledCategoriesContainer = styled.div`
  margin-bottom: 20px;

  .active {
    background-color: green;
  }

  @media (max-width: 992px) {
    overflow: scroll;
  }
`;

const StyledCategoryPill = styled.div`
  font-size: 10px;
  border-radius: 12px;
  padding: 4px 8px;
  cursor: pointer;
  background-color: #3d3d3d;
  margin: 0 3px;
  white-space: nowrap;

  @media (max-width: 992px) {
    width: 100%;
  }
`;

const App = () => {
  const [posts, setPosts] = useState<Array<Post>>([]);
  const [page, setPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [categories, setCategories] = useState<Array<string>>([]);
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    []
  );

  useEffect(() => {
    // get query params on load
    const urlSearchParams = new URLSearchParams(window.location.search);
    const selectedCategories: string =
      Object.fromEntries(urlSearchParams.entries())?.selectedCategories || '';

    if (selectedCategories !== '') {
      setSelectedCategories(selectedCategories.split(','));
    }

    fetch(`/api/categories`)
      .then((res) => res.json())
      .then((res) => setCategories(res));
  }, []);

  useEffect(() => {
    fetch(`/api/posts/${page}`)
      .then((res) => res.json())
      .then((res) => {
        setPosts(res.data || []);
        setNumberOfPages(res.numberOfPages || 1);
      });
  }, [page]);

  useEffect(() => {
    fetch(`/api/posts/1?categories=${selectedCategories.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setPosts(res.data || []);
        setNumberOfPages(res.numberOfPages || 1);
      });

    // set selected categories to query params
    if (window) {
      const url = new URL(window.location.href);
      url.searchParams.set('selectedCategories', selectedCategories.toString());
      window.history.pushState({}, '', url);
    }
  }, [selectedCategories]);

  const isSelectedCategory = (category: string): boolean =>
    selectedCategories.includes(category);

  const nextPage = (): void => {
    // contain user to available pages
    if (page < numberOfPages) {
      setPage(page + 1);
    }
  };
  const prevPage = (): void => {
    // contain user to available pages
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const filterCategory = (category: string): void => {
    // add/remove selectedCategory from state
    selectedCategories.includes(category)
      ? setSelectedCategories(
          selectedCategories.filter(
            (selectedCategory) => !(selectedCategory === category)
          )
        )
      : setSelectedCategories([...selectedCategories, category]);
  };

  const renderPosts = (): ReactNode => (
    <table>
      <th>Name</th>
      <th>Title</th>
      <th>Summary</th>
      {posts?.map((post, index) => {
        const { title, author, summary } = post || {};
        const { name, avatar } = author || {};

        return (
          <tr key={index}>
            <StyledTd>
              <img src={avatar} alt={name} />
              {name}
            </StyledTd>
            <td>{title}</td>
            <td>{summary}</td>
          </tr>
        );
      })}
    </table>
  );

  const renderDynamicPagination = (): Array<ReactNode> => {
    const dynamicPagination = [];
    for (let i = 1; i <= numberOfPages; i++) {
      dynamicPagination.push(
        <button key={i} onClick={() => setPage(i)}>
          {i}
        </button>
      );
    }
    return dynamicPagination;
  };

  const renderCategoriesFilter = (): ReactNode => {
    return (
      <StyledCategoriesContainer>
        <StyledFlexCenter>
          {categories.map((category, index) => (
            <StyledCategoryPill
              key={index}
              className={`${isSelectedCategory(category) ? 'active' : ''}`}
              onClick={() => filterCategory(category)}
            >
              {category}
            </StyledCategoryPill>
          ))}
        </StyledFlexCenter>
      </StyledCategoriesContainer>
    );
  };

  return (
    <StyledContainer>
      <StyledFlexCenter>
        <StyledPostsContainer>
          {renderCategoriesFilter()}
          {renderPosts()}
          <StyledPaginationContainer>
            <StyledFlexCenter>
              <button id="prev-btn" onClick={prevPage}>
                Prev
              </button>
              {renderDynamicPagination()}
              <button id="next-btn" onClick={nextPage}>
                Next
              </button>
            </StyledFlexCenter>
          </StyledPaginationContainer>
        </StyledPostsContainer>
      </StyledFlexCenter>
    </StyledContainer>
  );
};

export default App;
