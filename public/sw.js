// public/sw.js

/* eslint-disable no-restricted-globals */

const CACHE_NAME = "life-manager-v1";

// 1. 설치 (Install)
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(self.skipWaiting()); // 대기 없이 바로 활성화
});

// 2. 활성화 (Activate)
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(self.clients.claim());
});

// 3. 요청 가로채기 (Fetch) - *이게 있어야 설치 배너 조건 충족*
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});