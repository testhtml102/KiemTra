const CACHE_NAME = 'exam-system-cache-v1';
const urlsToCache = [
	'/',
	'/index.html',
	'/main.css',
	'/main.js',
	'/data/index.json',
	// Thêm các file dữ liệu bài kiểm tra
	'/data/temp/test1.json',
	'/data/temp/test2.json',
	'/data/chiSo_acid_chatBeo.json'
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