# Jade tips


* When adding a mixin to a page (or any child mixins), any client javascript controller files must be added to the `append js_scripts` block directive in the page file


## Structure for jade templates

* x-page.md -> __extends__ -> layout.jade
    * [single] include single pre-computed CSS file for page (append css_scripts)
    * [single] include single pre-computed javascript file for page (append js_scripts)
    * [multi] include HTML to be appended to layout (append body
        * HTML will include mixins, mixins may include sub-mixins