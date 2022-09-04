# What is depot?

`depot` is a Warhammer 40,000 companion app powered by [Wahapedia](https://wahapedia.ru)!<br/>

## Getting Started

This project uses Yarn workspaces.
You need to install yarn first if you do not have it.

```
npm install -g yarn
```

## Installing Dependencies

```
yarn
```

## Generating data from Wahapedia
First, download and generate the data from Wahapedia's csv exports.<br />
Run this command.

```
yarn workspace depot-cli start
```

Afterwards, a `wahapedia.json` file should be generated in `depot-cli/dist/`. <br />
Copy this file to `depot-web/public`.

## Development

```
yarn start
```

## Building for Production

```
yarn build
```


# Contributors

- <strong>Owner/Maintainer</strong> - [fjlaubscher](https://github.com/fjlaubscher)

# License

depot is free software, and may be redistributed under the terms specified in the [LICENSE](LICENSE.md) file.