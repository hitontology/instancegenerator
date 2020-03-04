# Instance Generator

The graphical user interface to generate new instances for HITO, starting with software products.

## Development
You only need Git, NPM and a browser. NPM is only needed for linting and testing. CORS over the file system needs to not be blocked by your browser. In Firefox, for example, you can achieve this by going to `about:config` and setting `privacy.file_unique_origin` to `false`.

### Setup
1. `git clone` this repository
2. `npm install`

### Publish
The master branch is published on GitHub Pages at <https://hitontology.github.io/instancegenerator/>.
Just push as normal and it will reflect on that page after a short while:

1. perform changes
2. `git add myfiles`
3. `git commit -m "my commit message"`
4. `git push`

### Update

1. `git pull`
2. `npm update`
3. `npm run build`

Make sure it runs locally before updating on the server, see releasechecklist.md.

### Code Style
Specified in the ESlint config file `.eslintrc.json`.
Follow [How to name css classes](http://bdavidxyz.com/blog/how-to-name-css-classes/).

### Scripts
* `npm run test` runs the mocha tests

## Details
### Intended Audience
Medical informatics experts of the HITO project.

### Usage Requirements
Any modern browser should work as long as it supports ES6 modules. Optimized for PC. Internet Explorer is not supported.

### Other
Test CORS at https://hitontology.github.io/instancegenerator/cors.html.
