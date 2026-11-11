"""Turns dist/.ipad-base.pdf into the fillable iPad copy.

Reads the field positions measured by build.js and places a typeable
form field over each ruled line, so the client can tap to type on iPad,
then sign in the shaded boxes with Apple Pencil (Markup).
"""
import io, json, pathlib
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A4

here = pathlib.Path(__file__).parent
dist = here / "dist"
fields = json.loads((dist / ".ipad-fields.json").read_text())
base = PdfReader(dist / ".ipad-base.pdf")
PX = 0.75                     # CSS px -> PDF pt
W, H = A4
ink = Color(88 / 255, 59 / 255, 31 / 255)
clear = Color(1, 1, 1, alpha=0)

buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=A4)
for i in range(len(base.pages)):
    for f in (f for f in fields if f["page"] == i):
        h = f["h"] * PX
        c.acroForm.textfield(
            name=f["name"], x=f["x"] * PX, y=H - (f["y"] + f["h"]) * PX + 1,
            width=f["w"] * PX, height=h - 1,
            fontName="Times-Roman", fontSize=11 if h > 18 else 10,
            textColor=ink, fillColor=clear, borderWidth=0, borderColor=clear,
            forceBorder=False,
        )
    c.showPage()
c.save()

writer = PdfWriter(clone_from=PdfReader(io.BytesIO(buf.getvalue())))
for page, bg in zip(writer.pages, base.pages):
    page.merge_page(bg, over=False)
writer.set_need_appearances_writer(True)
writer.add_metadata({"/Title": "Radiant Birth Journey – Letter of Agreement (iPad)"})
out = dist / "Radiant-Birth-Journey-Agreement-iPad.pdf"
writer.write(out)
print("wrote", out, len(fields), "fields")
