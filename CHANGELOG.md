# Changelog
[![npm version](https://badge.fury.io/js/rx-postmessenger.svg)](https://badge.fury.io/js/rx-postmessenger)

All notable changes to `rx-postmessenger` will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] (2021-08-17)

### BREAKING CHANGES
- Replaced the `namespace` structure in the TS declaration file with individual type exports. 
- Made RxJS a peer dependency.
  > I'm not entirely sure if this is breaking from a user point-of-view, 
  > but I made this a major release just to be sure.

### Changed
- Added support for RxJS 7.
- Many internal changes: dependencies, test suite, folder/file structure, and more.

## [2.0.1] (2019-06-22)
- Updated all npm dev-dependencies latest versions, fixing vulnerability issues reported by Github.

## [2.0.0] (2019-05-27)
### Changed
- Documented alpha.1 changes in README.

## [2.0.0-alpha.1] (2019-01-06)
### BREAKING CHANGES
- **Removed EventMap feature**

    This proved to be unmaintainable in terms of type-mapping in private implementations
    and also made the package less 'portable'. Payload type constraints are from now on
    enforced directly on Messenger method calls.

- **RxJS v6**

    Upgraded the RxJS dependency from v5 to v6.

- **Removed `Static.useObservable()` and `Static.getObservable()`**

    These methods are obsolete as of RxJS v6, as the Observable operators are no longer
    provided through prototype patching, but explicitly supplied with `Observable.pipe()`.


## [1.0.4] (2019-01-06)
### Added
- 🧪 Test suite
- Added TravisCI Build status to README

### Changed
- Major refactor of package internals: better SOC and adherence to SRP.
- Refactor public interface definition of EventMap structure.

## [1.0.3] (2018-05-15)
### Changed
- Internal naming of TS interfaces.
- Documentation of Public interface in `rx-postmessenger.d.ts`

## [1.0.2] (2018-03-17)
README update only.

## [1.0.1] (2018-03-17)
README update only.

## [1.0.0] (2018-03-12)
No code changes.

### Added
- LICENSE file

## [1.0.0-beta.1] (2018-01-14)
README update only.

## [0.2.1] (2018-01-01)
### Fixed
- npm distribution config: rename CommonJS build folder
- npm distribution config: ignore `/src` folder

## [0.2.0] (2018-01-01)
### Added
- Support for mapping event-channel names to payload types

## [0.1.12] (2017-12-07)
README update only.

## [0.1.11] (2017-12-07)
README update only.

## [0.1.10] (2017-12-07)

### Changed
- **TS declaration pointer** Package now relies on the dedicated declaration file and no longer generates declarations for CommonJS builds.
## [0.1.9] (2017-12-07)
General development, no notable changes

## [0.1.8] (2017-12-02)

### Fixed
- README error: Code example accessing properties in the wrong way.

## [0.1.7] (2017-12-01)
### Added
- Method to override the used RxJS Observable implementation allowing for custom sets of prototype methods.

## 0.1.6 (2018-12-01) [YANKED]
## [0.1.5] (2017-11-29)

### Changed
- Use full build of RxJS for faster development
- README content

## [0.1.4] (2017-11-28)

### Added
- Initial (serious) README content

### Changed
- Signature of `RxPostmessenger ~ createMessageObject`

## [0.1.3] (2017-11-27)

### Changed
- Messenger methods visibility + other development
- Package.json meta info

## [0.1.2] (2017-11-26)

### Added
- Minified and non-minified UMD bundle builds

### Changed
- Temporarily removed `/src` from gitignore

## [0.1.1] (2017-11-26)

### Fixed
- Wrong value for `"main""` entry in package.json.

## [0.1.0] (2017-11-26, initial release)

### Added
- Bade messenger class
- Project setup (builds, configuration etc.)

[Unreleased]: https://github.com/PXLWidgets/php-composer-version/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v2.0.0-alpha.1...v2.0.0
[2.0.0-alpha.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.4...v2.0.0-alpha.1
[1.0.4]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v1.0.0-beta.1...v1.0.0
[1.0.0-beta.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.2.1...v1.0.0-beta.1
[0.2.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.12...v0.2.0
[0.1.12]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.5...v0.1.7
[0.1.5]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/JJWesterkamp/rx-postmessenger/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/JJWesterkamp/rx-postmessenger/tree/v0.1.0
