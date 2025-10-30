/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import withPWA from "next-pwa";
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	// Empty turbopack config to silence Next.js 16 webpack/turbopack warning
	// next-pwa uses webpack config which conflicts with Turbopack
	turbopack: {},
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
};

const pwaConfig = withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
	buildExcludes: [/middleware-manifest\.json$/],
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			handler: "CacheFirst",
			options: {
				cacheName: "google-fonts-webfonts",
				expiration: {
					maxEntries: 4,
					maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
				},
			},
		},
		{
			urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "google-fonts-stylesheets",
				expiration: {
					maxEntries: 4,
					maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-font-assets",
				expiration: {
					maxEntries: 4,
					maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-image-assets",
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\/_next\/image\?url=.+$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "next-image",
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\.(?:mp3|wav|ogg)$/i,
			handler: "CacheFirst",
			options: {
				rangeRequests: true,
				cacheName: "static-audio-assets",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\.(?:mp4)$/i,
			handler: "CacheFirst",
			options: {
				rangeRequests: true,
				cacheName: "static-video-assets",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\.(?:js)$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-js-assets",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\.(?:css|less)$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-style-assets",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "next-data",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
			},
		},
		{
			urlPattern: /\/api\/.*$/i,
			handler: "NetworkFirst",
			method: "GET",
			options: {
				cacheName: "apis",
				expiration: {
					maxEntries: 16,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
				networkTimeoutSeconds: 10, // fall back to cache if api does not respond within 10 seconds
			},
		},
		{
			urlPattern: /.*/i,
			handler: "NetworkFirst",
			options: {
				cacheName: "others",
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 24 * 60 * 60, // 24 hours
				},
				networkTimeoutSeconds: 10,
			},
		},
	],
});

// @ts-ignore - next-pwa type incompatibility with Next.js 15
export default pwaConfig(config);
