#!/usr/bin/env sh
LC_ALL=en_US.UTF-8 emacs -Q --script build-site.el
mkdir -p public/posts/
cp -r content/resources/* public/resources/
cp content/posts/demo.js public/posts/
