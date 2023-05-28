import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const BASE_URL = 'https://pixabay.com/api/';
const KEY_API = '36630358-242656ee3a90f5cf2b5c56a75';
let page = 1;
let currentQuerySearch = '';
const per_page = 40;

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', hendlerSearchForm);
refs.loadBtn.addEventListener('click', handlerPagination);

const lightbox = new SimpleLightbox('.gallery__link', {
  captionsData: 'alt',
  captionSelector: 'img',
  captionDelay: '250',
  captionPosition: 'bottom',
  enableKeyboard: 'true',
});

async function hendlerSearchForm(evt) {
  evt.preventDefault();
  cleanMarkup();
  page = 1;
  currentQuerySearch = evt.target.searchQuery.value.trim();

  if (!currentQuerySearch) {
    return;
  }
  const response = await serviceImg(currentQuerySearch, page);

  if (response.totalHits === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notify.success(`Hooray! We found ${response.totalHits} images.`);
    refs.gallery.innerHTML = createMarkupGallery(response.hits);
    lightbox.refresh();
    showLoadMoreBtn(response.totalHits);
  }
}

async function serviceImg(querySearch, page) {
  try {
    const { data } = await axios.get(
      `${BASE_URL}?key=${KEY_API}&q=${querySearch}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${page}`
    );
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
}

function createMarkupGallery(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
   <div class="photo-card">
   <a class="gallery__link link" href="${largeImageURL}">
  <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>
   `
    )
    .join('');
}

async function handlerPagination() {
  page += 1;
  const response = await serviceImg(currentQuerySearch, page);
  refs.gallery.insertAdjacentHTML(
    'beforeend',
    createMarkupGallery(response.hits)
  );
  lightbox.refresh();
  showLoadMoreBtn(response.totalHits);
}

function cleanMarkup() {
  refs.gallery.innerHTML = '';
}

function showLoadMoreBtn(totalHits) {
  if (page < Math.ceil(totalHits / per_page)) {
    refs.loadBtn.classList.remove('visually-hidden');
  } else {
    refs.loadBtn.classList.add('visually-hidden');
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
