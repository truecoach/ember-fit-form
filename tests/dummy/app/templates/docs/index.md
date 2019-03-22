# Introduction

*A form component which wraps a native `<form>` element and provides
form state management abstractions.*

We built `ember-fit-form` because we wanted a simple pattern for
managing form cancellation, validation, and submission, with
visibility into the form's dirtiness, validity, and submittability.

`ember-fit-form` provides flexible state management for
forms. We aim to support many data and validation libraries
for use within your application's forms. We're also built on
[ember-concurrency](http://ember-concurrency.com/),
so you can support promise-aware hooks to manage form state.

> Please note that `ember-fit-form` does not provide form control
> components. It is simply an html form element with abstractions for
> state management.
