const CACHE_NAME = 'exam-system-cache-v1';
const BASE_PATH = '/KiemTra/';

const urlsToCache = [
	BASE_PATH,
	BASE_PATH + 'index.html',
	BASE_PATH + 'main.css',
	BASE_PATH + 'main.js',
	BASE_PATH + 'data/index.json',
	// Thêm các file dữ liệu bài kiểm tra
	BASE_PATH + 'data/temp/test1.json',
	BASE_PATH + 'data/temp/test2.json',
	BASE_PATH + 'data/chiSo_acid_chatBeo.json'
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => cache.addAll(urlsToCache))
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
		.then(response => response || fetch(event.request))
	);
});
