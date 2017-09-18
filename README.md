# Explore Birmingham Map

**Showcases places you should visit in Birminham, AL**

Gives info for local points of interest via
Goolge maps connected to Wikipedia

_________

A demo single page application(SPA) that uses

Javascript

Knockout.js

jQuery

Zurb Foundation

Google Maps API & Google Fonts

and the Wikipedia API.


#### run the app locally
open `index.html` in your browser

#### hosting the app on the web
serve
`index.html`
over http/https
with the other files included in this repo.

#### changing the app

The places used are stored in `app.js`
To add new places, just put them in the same format as you see in the file.

To change the look and style edit `style.css`
and `index.html`

To change the way the map works edit the initMap function in `app.js`

Wikipedia links use  a simple search based on the name of the place.
To modify this behavior edit the populateWikiData function in `app.js`


The points can also be retrieved remotely as JSON. The app uses javascript localStorage to cache the data for faster access on repeat loads and for demo simplicity.

### License
MIT LICENSE
