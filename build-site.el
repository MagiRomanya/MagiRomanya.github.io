;; Set the package installation directory so that packages aren't stored in the
;; ~/.emacs.d/elpa path.
(require 'package)
(setq package-user-dir (expand-file-name "./.packages"))
(setq package-archives '(("melpa" . "https://melpa.org/packages/")
                         ("elpa" . "https://elpa.gnu.org/packages/")))


;; Initialize the package system
(package-initialize)
(unless package-archive-contents
  (package-refresh-contents))

;; Install dependencies
(package-install 'htmlize)
(package-install 'ox-rss)

;; Load the publishing system
(require 'org)
(require 'ox-publish)


;; Customize the HTML output
(setq org-html-validation-link nil            ;; Don't show validation link
      org-html-head-include-scripts nil       ;; Use our own scripts
      org-html-head-include-default-style nil ;; Use our own styles
      org-html-metadata-timestamp-format "%d-%m-%Y"
      org-html-checkbox-type 'site-html
      org-html-self-link-headlines t
      org-html-htmlize-output-type 'css
      org-html-head
      ;; "<link rel=\"stylesheet\" href=\"https://cdn.simplecss.org/simple.min.css\" />")
      ;; "<link rel='icon' type='image/x-icon' href='/images/favicon.ico'/>
      "<link rel='icon' href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>'>
      <meta name='viewport' content='width=device-width, initial-scale=1'>
      <link rel='stylesheet' href='https://code.cdn.mozilla.net/fonts/fira.css'>
      <link rel='stylesheet' href='/css/site.css' type='text/css'/>
      <link rel='stylesheet' href='/css/syntax-coloring.css' type='text/css'/>")

;; Sitemap custom entries
(setq this-date-format "%d %b, %Y")
(defun me/org-sitemap-format-entry (entry style project)
  "Format posts with author and published data in the index page.

ENTRY: file-name
STYLE:
PROJECT: `posts in this case."
  (cond ((not (directory-name-p entry))
         ;; (format "*[[file:%s][%s]]*
         ;;         #+HTML: <p class='pubdate'>by %s on %s.</p>"
         (format "*[[file:%s][%s]]*
                 #+HTML: <p class='pubdate'>Posted on %s.</p>"
                 entry
                 (org-publish-find-title entry project)
                 ;; (car (org-publish-find-property entry :author project))
                 (format-time-string this-date-format
                                     (org-publish-find-date entry project))))
        ((eq style 'tree) (file-name-nondirectory (directory-file-name entry)))
        (t entry)))

;; HTML Preamble (top of the page)
(defun me/website-html-preamble (plist)
  "PLIST: An entry."
  (if (org-export-get-date plist this-date-format)
      (plist-put plist
                 :subtitle (format "Published on %s by %s."
                                   (org-export-get-date plist this-date-format)
                                   (car (plist-get plist :author)))))
  ;; Preamble
  (with-temp-buffer
    (insert-file-contents "../../html-templates/preamble.html") (buffer-string)))

;; Define the publishing project
(setq org-publish-project-alist
      (list
       (list "magiromanya:posts"
             :recursive t
             :base-directory "./content/posts/"
             :publishing-function 'org-html-publish-to-html
             :publishing-directory "./public/posts/"
             :html-link-home "/"
             :html-link-up "/"
             ;;---- Sitemap config
             :auto-sitemap t
             :sitemap-title "Blog Entries"
             :sitemap-style 'list
             :sitemap-format-entry 'me/org-sitemap-format-entry
             :sitemap-sort-files 'anti-chronologically
             ;;----
             :html-preamble 'me/website-html-preamble
             :with-author t
             :with-creator nil
             :with-toc nil
             :recursive t
             :section-numbers nil
             :time-stamp-file nil)
       (list "magiromanya:main"
             :recursive t
             :base-directory "./content/static"
             :publishing-function 'org-html-publish-to-html
             :html-preamble 'me/website-html-preamble
             :publishing-directory "./public"
             :with-author t
             :with-creator nil
             :with-toc nil
             :section-numbers nil
             :time-stamp-file nil)
       (list "css"
             :base-directory "./css"
             :base-extension "css"
             :publishing-directory "./public/css"
             :publishing-function 'org-publish-attachment
             :recursive t)
       (list "rss"
             :base-directory "./content/posts"
             :base-extension "org"
             :html-link-home "https://magiromanya.com/"
             :rss-link-home "https://magiromanya.com/"
             ;; :html-link-use-abs-url t
             :rss-extension "xml"
             :publishing-directory "./public"
             :publishing-function 'org-rss-publish-to-rss
             ;; :section-number nil
             :include '("sitemap.org")
             :exclude ".*"
             :table-of-contents nil)))

;; Generate the site output
(org-publish-all t)

(message "Build complete!")
