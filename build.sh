#!/usr/bin/env sh
python generate_publications_html.py
LC_ALL=en_US.UTF-8 emacs -Q --script build-site.el
mkdir -p public/posts/
mkdir -p public/resources/
cp -r content/resources/* public/resources/
cp content/posts/demo.js public/posts/
