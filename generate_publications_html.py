import json
from pathlib import Path


def format_author(author):
    name = author["name"]
    url = author.get("website")
    if url:
        return f'<a href="{url}">{name}</a>'
    return name


def generate_publication_html(pub):
    authors_html = ", ".join(format_author(a) for a in pub["authors"][:-1])
    if len(pub["authors"]) > 1:
        authors_html += f' and {format_author(pub["authors"][-1])}'
    else:
        authors_html = format_author(pub["authors"][0])

    buttons = []
    if pub.get("pdf"):
        buttons.append(f'<a class="button" href="{pub["pdf"]}">PDF</a>')
    if pub.get("video"):
        buttons.append(f'<a class="button" href="{pub["video"]}">Video</a>')
    if pub.get("project"):
        buttons.append(f'<a class="button" href="{pub["project"]}">Website</a>')
    buttons_html = " ".join(buttons)

    return f"""
<div class="publication">
    <a href="{pub['pdf']}">
    <img src="{pub['image']}" alt="Paper teaser" class="teaser" />
    </a>
  <div class="pub-info">
    <h3>{pub['title']}</h3>
    <p class="authors">{authors_html}</p>
    <p class="journal">{pub['journal']} ({pub['year']})</p>
    <div class="pub-buttons">{buttons_html}</div>
  </div>
</div>
"""


def make_it_org(htmldoc):
    return "#+BEGIN_EXPORT html\n" + htmldoc + "\n#+END_EXPORT"


def main():
    with open("content/publications/publications.json") as f:
        publications = json.load(f)

    html = '<div class="publications">\n'
    for pub in publications:
        html += generate_publication_html(pub)
    html += "</div>"

    org = make_it_org(html)
    Path("content/static/publications.org").write_text(org, encoding="utf-8")
    print("Generated publications.html!")


if __name__ == "__main__":
    main()
