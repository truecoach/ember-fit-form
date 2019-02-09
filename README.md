ember-fit-form
==============================================================================

*A form component based on the native html form.***

`ember-fit-form` provides flexible state management for
forms. We aim to support many data and validation libraries
for use within your application's forms. We're also built on
[ember-concurrency](http://ember-concurrency.com/), so you can easily
support promise-aware hooks to manage your applications form state.

**Currently supported data models:**

1. [ember-data](https://emberjs.com/api/ember-data/release/classes/DS.Model)

    Validation Libraries:
    - [ember-cp-validations](https://github.com/offirgolan/ember-cp-validations)
    - [ember-valdiations](https://github.com/DavyJonesLocker/ember-validations)

2. [ember-changeset](https://github.com/poteto/ember-changeset)

    Validation Libraries:
    - [ember-changeset-validations](https://github.com/poteto/ember-changeset-validations)

Installation
------------------------------------------------------------------------------

```
ember install ember-fit-form
```


Usage
------------------------------------------------------------------------------

### Example

``` hbs
{{!-- my-form.hbs --}}
{{#fit-form changeset onCancel=(action rollback) onSubmit=(action save) as |form|}}

  <input oninput={{action (mut changeset.name) value="target.value"}}>

  {{!-- other form content --}}

  <button {{form.cancel}} disabled={{form.isCancelling}}>
    {{if form.isCancelling "Cancelling..." "Cancel"}}
  </button>

  <button {{form.submit}} disabled={{form.isUnsubmittable}}>
    {{if form.isSubmitting "Saving..." "Save"}}
  </button>
{{/fit-form}}
```

``` javascript
// my-form.js
rollback() {
  return changeset.rollbackAttributes();
},
save() {
  return changeset.save();
}
```

### Fit-Form Adapters
By default, `ember-fit-form` expects Changeset objects as the form's models. If you
would like to use another Object, pass the `adapterName` property:

``` hbs
{{#fit-form model adapterName="ember-model" as |form|}}

  <input oninput={{action (mut model.name) value="target.value"}}>

  {{!-- other form content --}}

  <button {{form.cancel}} disabled={{form.isCancelling}}>
    {{if form.isCancelling "Cancelling..." "Cancel"}}
  </button>

  <button {{form.submit}} disabled={{form.isUnsubmittable}}>
    {{if form.isSubmitting "Saving..." "Save"}}
  </button>
{{/fit-form}}
```

#### Configuring Default Adapter
_Coming Soon_

#### Custom Adapters
_Coming Soon_

### Fit-Form Actions

#### submit
Submits the form.

Submitting a form calls the form's [`validate`](#validate) method and
then calls the form's [`onSubmit`](#onSubmit) hook if validation
succeeds.

```js
form.submit();
```

```hbs
<button {{action form.submit}}>Submit</button>
{{!-- or --}}
<button onclick={{action form.submit}}>Submit</button>
```

> The `onSubmit` hook will never be called if a form [`isInvalid`](#isInvalid).

#### cancel
Cancels the form.

Cancelling a form calls the form's [`onCancel`](#onCancel) hook.

```js
form.cancel();
```

```hbs
<button {{action form.cancel}}>Cancel</button>
{{!-- or --}}
<button onclick={{action form.cancel}}>Cancel</button>
```

#### validate
Validates the form.

Validating a form calls the validate action for each of the form's models.


```js
form.validate();
```

```hbs
<button {{action form.validate}}>Check Validity</button>
{{!-- or --}}
<button onclick={{action form.validate}}>Check Validity</button>
```

### Fit-Form Component Action Hooks
The `form` object is always curried in as the last argument for all
component action hooks.

#### `onSubmit`
The `onSubmit` hook action is a promise-aware action which is called on
submission of form which [`isValid`](#isValid)

``` hbs
{{#fit-form model onSubmit=(action save) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
save(/* form */) {
  return model.save();
}
```

#### `onSuccess`

The `onSuccess` hook is a promise-aware action which is called when the [`onSubmit`](#onSubmit) hook is fulfilled.

``` hbs
{{#fit-form model onSuccess=(action success) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
success(/* result, form */) {
  // Do something
}
```

#### `onError`

The `onError` hook is a promise-aware action which is called when the [`onSubmit`](#onSubmit) hook is rejected.

``` hbs
{{#fit-form model onError=(action error) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
error(/* error, form */) {
  // Do something
}
```

#### `onCancel`
The `onCancel` hook is a promise-aware action which is called on form cancellation.

``` hbs
{{#fit-form model onCancel=(action rollback) as |form|}}
  <button {{form.cancel}}>Cancel</button>
{{/fit-form}}
```

``` javascript
rollback() {
  return model.rollback();
}
```

### Fit-Form Component Event Handler Hooks
The `form` object is always curried in as the last argument for all
component event handler hooks.

#### onkeydown
When `onkeydown` is passed into `fit-form` component, it registers the
`keyDown` event on the html form element. The `onkeydown` hook is called when
the `keyDown` event is triggered.

``` hbs
{{#fit-form model onkeydown=(action handlekey) as |form|}}
  {{!-- form content --}}
{{/fit-form}}
```

``` javascript
handlekey(event, form) {
  if (event.key === "Enter" && event.shiftKey) {
    // Shift + Enter
    form.submit();
  } else if (event.key === "Escape")
    form.cancel();
  }
}
```

#### onkeyup
When `onkeyup` is passed into `fit-form` component, it registers the
`keyUp` event on the html form element. The `onkeyup` hook is called when
the `keyUp` event is triggered.

See [`onkeydown`](#onkeydown) example for usage.

#### keypress
When `onkeypress` is passed into `fit-form` component, it registers the
`keyPress` event on the html form element. The `onkeypress` hook is called when
the `keyPress` event is triggered.

See [`onkeydown`](#onkeydown) example for usage.

### Fit-Form Attributes

#### isUnsubmittable

Returns a Boolean value of the form's (un)submittability.

```js
form.get('isUnsubmittable'); // true
```

```hbs
<button {{action form.submit}} disabled={{form.isUnsubmittable}}>Submit</button>
```

> You can still call [`submit`](#submit) if a form `isUnsubmittable`.

#### isSubmittable

Returns a Boolean value of the form's submittability.

```js
form.get('isSubmittable'); // true
```

```hbs
{{#if form.isSubmittable}}
  <span class=fa fa-check'></span>
{{/if}}
```

#### isValid

Returns a Boolean value of the form's validity. A valid form is one
where all of the form's models are valid.

```js
form.get('isValid'); // true
```

```hbs
{{#if form.isValid}}
  <span class=fa fa-check'></span>
{{/if}}
```

#### isInvalid

Returns a Boolean value of the form's (in)validity. A invalid form is one
where the some of the form's models are invalid.

```js
form.get('isInvalid'); // true
```

```hbs
{{#if form.isInvalid}}
  <span class=fa fa-times></span>
{{/if}}
```

#### isDirty

Returns a Boolean value of the form's state. A dirty form is one with
changes.

```js
form.get('isDirty'); // true
```

#### isPristine

Returns a Boolean value of the form's state. A pristine form is one
with no changes.

```js
form.get('isPristine'); // true
```

#### isCancelling

Returns a Boolean value of the form's cancelling state. A cancelling
form is one where the `onCancel` hook is pending. This attribute is
commonly coupled with the [`cancel`](#cancel) action.

```js
form.get('isCancelling'); // true
```

``` hbs
<button {{action form.cancel}} disabled={{form.isCancelling}}>Cancel</button>
```

#### isSubmitting

Returns a Boolean value of the form's submitting state. A submitting
form is one where the `onSubmit`, `onSuccess`, or `onError` hooks are
pending. This attribute is commonly coupled with the [`submit`](#submit) action.

```js
form.get('isSubmitting'); // true
```

``` hbs
<button {{action form.submit}} disabled={{form.isSubmitting}}>Submit</button>
```

#### isValidating

Returns a Boolean value of the form's validating state. A validating form is one where the form's model(s) are validating upon form submission.

```js
form.get('isValidating'); // true
```

``` hbs
{{#if form.isValidating}}
  <span class=fa fa-spinner></span>
{{/if}}
```

#### didCancel

Returns a Boolean value of the form's cancelled state. A cancelled form is one where the [`onCancel`](#onCancel) hooks is settled.

```js
form.get('didSubmit'); // true
```

``` hbs
{{#if form.didSubmit}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```

#### didSubmit

Returns a Boolean value of the form's submitted state. A submitted form is one where the [`onSubmit`](#onSubmit) hooks is settled.

```js
form.get('didSubmit'); // true
```

``` hbs
{{#if form.didSubmit}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```

#### didValidate

Returns a Boolean value of the form's validated state. A validated form is one where the form's model(s) were validated upon form submission.

```js
form.get('didValidate'); // true
```

``` hbs
{{#if form.didValidate}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```
