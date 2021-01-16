# Change Log

## 3.0.1

- bugfix: Restores ability to pass classes and other html attributes to FitForm's form element [#83](https://github.com/truecoach/ember-fit-form/pull/83)

## 3.0.0

- Adds support for ember-changeset >= v3.0.0
- Drops support for Node < v10
- Drops support for Ember < v3.16
- Drops support for positional params. The `FitForm` component's positional param should be replaced with the `@models` named arg, which accepts either a single model or an array of models.
- Drops support for EmberObject in implementation of FormAdapters. Custom adapters should be refactored to use ES classes.