# By Ali Furlan Static Site

This folder contains the deployable static website for `https://byalifurlan.com/`.

## Structure

`/`
- `index.html`
- `work.html`
- `404.html`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `README.md`

`/assets/`
- `css/` shared stylesheet
- `js/` shared JavaScript
- `icons/` favicon assets
- `images/` page imagery, posters, and social preview assets
- `videos/` project videos and hero media

## Local testing

Open `index.html` directly for a quick visual check.

For browser-like testing, serve the folder with any simple static server so page links and media behave the same way they will after upload.

## GitHub Pages testing

Upload the contents of this folder as the published site root.

Important notes:
- Keep all filenames and folder names lowercase and case-consistent.
- The contact form uses Netlify attributes for production-style hosting, but GitHub Pages does not process forms.
- On `github.io` previews, the site falls back to opening the visitor's email app so enquiries can still be sent during testing.
- Canonical URLs and sitemap entries stay pointed at `https://byalifurlan.com/` so production SEO data is not overwritten during testing.

## Production notes

- If the final host is Netlify, keep the current form attributes in place.
- If the final host is not Netlify, replace form handling with a supported backend endpoint or form service.
- The current hero source is a `.mov` file. For best browser compatibility and page weight, export a web-ready `.mp4` replacement before final launch.
