//  Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searcheInput = form.elements['search']

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
  form.reset();
})

const newsService = (function() {
  const apiKey = "6700db069f0b4b2aae2f9b2f35dce879";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadLines(country = 'ru', callback) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, callback);
    },
    everything(query, callback) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,
      callback);
    }
  }
}())


//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

//load news function 
function loadNews() {
  showLoader()
  const country = countrySelect.value;
  const searche = searcheInput.value;

  if (!searche) {
    newsService.topHeadLines(country, onGetResponse);
  } else {
    newsService.everything(searche, onGetResponse);
  }
}

function onGetResponse(error, response) {

  removePreloader();

  if (error) {
    showAlert(error, "rounded");
  }
  if (!(response.articles.length)) {
    showAlert("There are no results");
    return;
  }
  renderNews(response.articles);

}

function renderNews(news) {
  const newsConteiner = document.querySelector('.news-container .row');
  if (newsConteiner.children.length) {
    clearContainer(newsConteiner);
  }
  let fragment = ''

  news.forEach(newsItem => {
    return fragment += 
    `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${newsItem.urlToImage}">
          <span class="card-title">${newsItem.title || ""}</span>
        </div>
        <div class="card-content">
          <p>${newsItem.description} || ''</p>
        </div>
        <div class="card-action">
          <a href="${newsItem.url}">Read More</a>
        </div>
      </div>
    </div>
    `;
  })
  
  newsConteiner.insertAdjacentHTML('afterbegin', fragment)
}

function clearContainer(container) {
  let child = container.lastElementChild;
  while(child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

function showAlert(message, type = 'success') {
  M.toast({
    html: message,
    classes: type
  });
}

// SHOW LOADER FUNCTION 

function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
    `
  );
}

function removePreloader() {
  const loader = document.querySelector('.progress');

  if (loader) {
    loader.remove();
  }
}