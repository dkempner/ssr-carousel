# SSR Carousel Demo

## Running

1. install deps with `yarn --frozen-lockfile`
2. start dev server with `PORT=9999 yarn dev`
3. visit localhost:9999/storefront in your browser

## Why?

This demo explores several techniques for creating a carousel component which renders on the server, that's responsive, and that doesn't create large layout shifts once the page mounts.

We believe that SSR content is our ticket to fast storefront cold starts, and unlocks better SEO bot crawling as well.

## Techniques

### 1. Over-fetch data, use media queries to control amount shown

#### Pros

1. You can guarantee no overflows of content, ie you're showing exactly 5 items per row for this screen width.

#### Cons

1. Overfetching means it's slower for everyone, and only benefits people with the biggest screens.
2. Discrete number of sizes you support (unless you generate media queries programatically)

### 2. Over-fetch data, use fixed-width items

#### Pros

1. Your only choice if your design requires fixed-width items

#### Cons

1. Overfetching means it's slower for everyone
2. Items can overflow, showing a half item on the screen (might be a pro?)

### 3. Under-fetch data, use media queries for width

### 4. Under-fetch data, use fixed-width items
