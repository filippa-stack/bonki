

## Add InApp Redirect script to index.html

Single change in `index.html`.

### Change

Insert the InApp Redirect script tag before the closing `</head>` (after line 44):

```html
<script
  id="iar"
  src="https://rum.auditzy.com/teUjBCLn-bonkiapp.com-iar.js"
  async
></script>
```

### Location

Between the Twitter image meta tag (line 44) and the closing `</head>` tag (line 45).

