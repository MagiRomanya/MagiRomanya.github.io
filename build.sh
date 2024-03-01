#!/usr/bin/env sh

emacs -Q --script build-site.el
mkdir -p public/posts/
cp content/posts/demo.js public/posts/
