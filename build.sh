#!/usr/bin/env sh

emacs -Q --script build-site.el
mkdir -p public
cp -r content/resources/ public/
cp content/demo.js public/
