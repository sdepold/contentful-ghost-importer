# contentful-ghost-importer

A CLI that imports data from ghost to contentful.

## Installation

```
npm install -g contentful-ghost-importer
```

## Usage

The CLI takes care of creating the necessary content types (Post, Tag, User) as
well as of importing all posts, tags and users from the ghost export into Contentful.

```
contentful-ghost-importer -b <blogHost> -s <spaceId> -t <cmaToken> path/to/ghost-data.json
```

## Options

The following options are available:

```
Usage:
contentful-ghost-importer path/to/ghost-export.json

Options:
  -s, --space-id  The space id you want to import the data to.    [required]
  -t, --token     A CMA access token.                             [required]
  -b, --blog-host The host of the original blog.                  [required]
  -h, --host      The host you want to import the data to.        [Default: "api.contentful.com"]
```

## Ghost data

Before running the importer you will need to log into your ghost admin interface and download
all your data as JSON file. You can find instructions about how to achieve that
[in the ghost support section](http://support.ghost.org/import-and-export-my-ghost-blog-settings-and-data/#export-your-blog-settings-and-data).
