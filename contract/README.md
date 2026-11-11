# Birth client agreement

Radiant Birth Journey's Letter of Agreement for new birth clients, in two versions:

| File | Use it for |
| --- | --- |
| `dist/Radiant-Birth-Journey-Agreement-print.pdf` | Printing on A4 (white paper, brown ink). Fill in and sign by hand. |
| `dist/Radiant-Birth-Journey-Agreement-iPad.pdf` | Signing on iPad. Tap a ruled line to type; sign in the shaded boxes with Apple Pencil. |

## Signing on the iPad

1. Save `Radiant-Birth-Journey-Agreement-iPad.pdf` to the Files app (or Books).
2. Before the appointment, duplicate it (long-press → Duplicate) so the blank stays blank, and rename the copy with the client's name.
3. Tap any ruled line to type: names, address, due date, fees and dates.
4. Tap the Markup (pen) icon, pick a pen, and sign in each shaded box with Apple Pencil. Clients can initial the box at the foot of each page the same way.
5. Tap Done, then Share → Mail / AirDrop to send the client their signed copy.

## Editing the wording

The text lives in `contract.html`. After changing it, rebuild both PDFs:

```sh
node build.js        # needs Playwright + Chromium; renders both PDFs and checks nothing overflows a page
python3 add_fields.py  # needs pypdf + reportlab; adds the typeable fields to the iPad copy
```
