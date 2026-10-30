# Simple portfolio

A responsive portfolio built with HTML and CSS. Includes example projects and placeholder personal details.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open the site in your browser on port 8000. No build step or package installation is required.

## Make it yours

Edit `index.html` to replace Alex Morgan, the biography, example projects, and `hello@example.com`. Adjust colors and layout in `style.css`. Project artwork is drawn with CSS; the project cards are illustrative and do not link to real projects. The design uses system fonts and CSS artwork, with no external font or image dependencies.

## Banking app prototype

`banking/` contains Juniper, a separate demo dashboard. From the repository root, run `python3 -m http.server 8000` and open `/banking/`. Includes account balances, searchable transactions, account filters, reviewed internal transfers, and a reset control. Balances use integer pennies; changes persist in browser local storage when available.

All funds, accounts, and transactions are fictional. No authentication, real payments, account linking, or banking backend is included. Do not enter personal banking details. This is a UI prototype, not a production financial service.
