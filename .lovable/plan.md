

## Replace Final 2 Still Us Card Images

File replacement only. No code changes.

### Mapping

| Uploaded file | Card title | Target file |
|---|---|---|
| att_säga_ifrån-2.png | Att säga ifrån | su-mock-12.webp (replaces previous version) |
| Att_fortsätta_välja.png | Att fortsätta välja | su-mock-20.webp |

### Process

1. Copy uploaded PNGs to `/tmp/`
2. Convert to WebP (85% quality) using ffmpeg
3. Overwrite `su-mock-12.webp` and `su-mock-20.webp` in `/public/card-images/`

This completes all 21 card images (su-mock-0 through su-mock-20).

