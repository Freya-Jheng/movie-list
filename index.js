//variables
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
// 拿來裝從api取出來的資料
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const movies_per_page = 12
const paginator = document.querySelector('#paginator')
let filterList = []

// Function Area 
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // console.log(POSTER_URL+item.image)
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie"  data-toggle="modal" data-id="${item.id}" data-target="#movie-Modal" >More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id} > + </button>
              </div>
            </div>
          </div>
        </div>
      `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}"
    class="img-fluid" alt="Movie Poster">`
    modalDescription.innerText = data.description
    modalDate.innerText = 'Release Date :' + data.release_date
  })

}

function addToFavorite(id) {
  // function isMatchedMovieId (movie){
  //   return movie.id === id
  // }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  //將isMatchedMovieId()寫成匿名函式
  //avoid to add the same movie, you can use "some()". It's a kind of function. To recognize whether the input satisfies the conditions. If yes, return true; no return false
  if (list.some(movie => movie.id === id)) {
    return alert('This movie has already been added in your favorite list !')
  }


  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / movies_per_page)
  //解決有餘數的問題＝要無條件進位＝Math.ceil()
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//get movies based on the page number
function getMoviesByPage(page) {

  //因為我們也要讓搜尋結果分頁，因此這裡的movies會有兩種解釋：
  //1. 原本完整80多部的電影 2. 使用者搜尋過後的電影
  const data = filterList.length ? filterList : movies

  //if we find out thr range of movies based on movies.id
  // page 1  movies  0~11
  // page 2  movies 12~23
  // page 3  movies 24~35  ,,,
  const startIndex = (page - 1) * movies_per_page
  const endIndex = startIndex + movies_per_page //slice不包含end值

  return data.slice(startIndex, endIndex)

}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return alert('This is an invalid keyword!')
  }
  // 寫法一 for loop
  // for(const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filterList.push(movie)
  //   }
  // }

  // 寫法二 filter
  filterList = movies.filter(function (movie) {
    return movie.title.toLowerCase().includes(keyword)
  })
  if (filterList.length === 0) {
    return alert(`Can't find movies with: ${keyword}`)
  }

  renderPaginator(filterList.length)
  renderMovieList(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  // results=Array(80筆資料)
  //  console.log(response.data.results)
  // 將results的資料put到movies
  // 法一 for loop
  // for(const movie of response.data.results){
  //   movies.push(movie)
  // }
  // 法二 push的展開運算
  // const numbers = [1, 2, 3, 4, 5]
  // movies.put(...[1,2,3,4,5]) 第17行＝第18行
  // movies.put(1, 2, 3, 4, 5)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
  // note: 用以下方式也可以成功，單考量到在程式碼的維護及辨識度上，用const來定義movies比較好
  // let movies = response.data.results
  // console.log(movies)
})
