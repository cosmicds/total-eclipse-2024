# Vue Data Story Template

This repository contains a template for setting up a purely Vue-based Cosmic Data Story using WorldWide Telescope. This template is built using components from [`@cosmicds/vue-toolkit`](https://github.com/cosmicds/vue-toolkit), which is included here as a dependency. This template sets up the basic infrastructure for a story - integrating the WorldWide Telescope component, providing some basic HTML scaffolding for placing controls in the main component, and generally providing the overall Vue project structure.

## Usage

To start creating your own data story, you can use the following steps.

* First, clone the repository, setting the name of the destination folder as appropriate for your story
```
git clone https://github.com/cosmicds/vue-ds-template.git <my-story-name>
```
* Next, you can run the setup script to do some basic renaming for you. You should give the story name in `kebab-case`. Where conventions dictate, the script will automatically rename using `PascalCase` and `camelCase`.
```
cd <my-story-name>
scripts/setup.sh
```
If you get complaints that the script isn't executable, make it so by running `chmod +x scripts/setup.sh`.

* That's it! You're now ready to start creating your story. As mentioned above, we provide some basic layout scaffolding in the main component template, but feel free to remove whatever doesn't fit your story's needs.
    - To preview the story using the development server, run `yarn serve`
    - To build the story for production use, run `yarn build`

## Deployment

The built story is just a set of HTML/CSS/JS + any assets that you add, so it should be easy to host anywhere. One simple way to host a story is using Github Pages, which provides a free static site hosting service for public repositories. This can even be done automatically using Github Actions - see the `build-deploy` in the [Carina data story](https://github.com/cosmicds/carinads) for an example.

## BrowserStack testing - CosmicDS team

If you're a member of the CosmicDS team, we can perform E2E testing (both locally and in Github Actions) using BrowserStack. See the tests in the [Carina data story](https://github.com/cosmicds/carinads) as an example. Note that you'll need to have our BrowserStack username and access key for this to work correctly.
