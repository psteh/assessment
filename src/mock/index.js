import { createServer } from 'miragejs';

import data from './data.json';

const numberOfDataPerPage: number = 20;

createServer({
  routes() {
    this.namespace = '/api';

    this.get(
      '/posts/:page',
      (_, request): { data: Array<object>, numberOfPages: number } => {
        // pagination
        // 1 = 0 - 19
        // 2 = 20 - 39
        // 3 = 40 - 59
        // 4 = 60 - 79
        // 5 = 80 - 99

        const page: number = Number(request.params.page) || 1;
        const startOfElement: number = (page - 1) * numberOfDataPerPage;
        const selectedCategories: string = request.queryParams.categories || '';
        const filteredCategories: Array<string> =
          selectedCategories.split(',') || [];

        // filter data by selected categories
        const filteredData = data.posts.filter((post) => {
          // do not filter if there is no selected category to be filtered
          if (filteredCategories.length > 0 && filteredCategories[0] !== '') {
            return (
              post.categories.filter((category) =>
                filteredCategories.includes(category.name)
              ).length > 0
            );
          }
          return post;
        });
        const paginatedData = filteredData.slice(
          startOfElement,
          startOfElement + numberOfDataPerPage
        );

        return {
          data: paginatedData,
          numberOfPages: Math.ceil(filteredData.length / numberOfDataPerPage),
        };
      }
    );

    this.get('/categories', (): any => {
      // set takes in unique string - helps with multiple duplicates category name
      const categories = new Set();

      data.posts.map((post) =>
        post.categories.map((category) => categories.add(category.name))
      );

      return Array.from(categories);
    });
  },
});
