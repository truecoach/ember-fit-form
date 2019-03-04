ember-fit-form
==============================================================================

*A form component which wraps a native `<form>` element and provides form state management abstractions.*

`ember-fit-form` provides flexible state management for
forms. We aim to support many data and validation libraries
for use within your application's forms. We're also built on
[ember-concurrency](http://ember-concurrency.com/), so you can easily
support promise-aware hooks to manage your applications form state.

**Currently supported data models:**

1. [ember-data](https://emberjs.com/api/ember-data/release/classes/DS.Model)

    Validation Libraries:
    - [ember-cp-validations](https://github.com/offirgolan/ember-cp-validations)
    - [ember-validations](https://github.com/DavyJonesLocker/ember-validations)

2. [ember-changeset](https://github.com/poteto/ember-changeset)

    Validation Libraries:
    - [ember-changeset-validations](https://github.com/poteto/ember-changeset-validations)

> Please note that `ember-fit-form` does not provide form control components. It is simply an html form element with abstractions for state management.

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
{{#fit-form model oncancel=(action rollback) onsubmit=(action save) as |form|}}
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

``` javascript
// my-form.js
rollback() {
  return model.rollbackAttributes();
},
save() {
  return model.save();
}
```

### Configuration

By default, `ember-fit-form` expects Changeset models. To setup your default Model type, you should configure the component through `config/environment`:

```javascript
module.exports = function(environment) {
  var ENV = {
    emberFitForm: {
      adapter: 'ember-changeset' // default
    }
  }
}
```

In the case that your forms use mixed Models throughout your application, you can overwrite the `adapter` at the component level.

``` hbs
{{#fit-form model adapter="ember-model"}}
  {{!-- form content --}}
{{/fit-form}}
```

## API
* [Actions](#fit-form-actions)
+ [`submit`](#submit)
+ [`cancel`](#cancel)
+ [`validate`](#validate)

* [Action Hooks](#fit-form-component-action-hooks)
+ [`onsubmit`](#onsubmit)
+ [`onsuccess`](#onsuccess)
+ [`onerror`](#onerror)
+ [`oncancel`](#oncancel)
+ [`onvalidate`](#onvalidate)
+ [`oninvalid`](#oninvalid)

* [Event Handler Hooks](#fit-form-component-event-handler-hooks)
+ [`onkeydown`](#onkeydown)
+ [`onkeyup`](#onkeyup)
+ [`onkeypress`](#onkeypress)

* [Attributes](#fit-form-attributes)
+ [`isUnsubmittable`](#isUnsubmittable)
+ [`isSubmittable`](#isSubmittable)
+ [`isValid`](#isValid)
+ [`isInvalid`](#isInvalid)
+ [`isDirty`](#isDirty)
+ [`isPristine`](#isPristine)
+ [`isCancelling`](#isCancelling)
+ [`isSubmitting`](#isSubmitting)
+ [`isValidating`](#isValidating)
+ [`didCancel`](#didCancel)
+ [`didSubmit`](#didSubmit)
+ [`didValidate`](#didValidate)


### Fit-Form Actions
------------------------------------------------------------------------------

#### `submit`
Submits the form.

Submitting a form calls the form's [`validate`](#validate) method and
then calls the form's [`onsubmit`](#onsubmit) hook if validation succeeds.

```js
form.submit();
```

```hbs
<button {{action form.submit}}>Submit</button>
{{!-- or --}}
<button onclick={{action form.submit}}>Submit</button>
```

> The `onsubmit` hook will never be called if [`onvalidate`](#onvalidate) hooks is rejected.

**[⬆️ back to top](#api)**

#### `cancel`
Cancels the form.
Cancelling a form calls the form's [`oncancel`](#oncancel) hook.

```js
form.cancel();
```

```hbs
<button {{action form.cancel}}>Cancel</button>
{{!-- or --}}
<button onclick={{action form.cancel}}>Cancel</button>
```

**[⬆️ back to top](#api)**

#### `validate`
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

**[⬆️ back to top](#api)**


### Fit-Form Component Action Hooks
------------------------------------------------------------------------------

Fit-Form adapters each contain action hooks. Some hooks call default functions, to reduce overall boilerplate code. For example, the `ember-changeset` adapter's `onsubmit` hook calls `changeset.save()` on each changeset by default. Declaring an `onsubmit` action on the component will override this behavior.

See default component action hook behavior:
- [ember-changeset](https://github.com/fitbotinc/ember-fit-form/blob/master/addon/form-adapters/ember-changeset.js#L17-L39)
- [ember-model](https://github.com/fitbotinc/ember-fit-form/blob/master/addon/form-adapters/ember-model.js#L17-L38)

The `form` object is always curried in as the last argument for all component action hooks.

#### `onsubmit`
The `onsubmit` hook action is a promise-aware action which is called on form submission.
Form submission is triggered when calling `form.submit()`.


``` hbs
{{#fit-form model onsubmit=(action save) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
save(/* form */) {
  return model.save();
}
```

> The `onsubmit` hook will not be called on form submission if [`onvalidate`](#onvalidate) hooks is rejected.

**[⬆️ back to top](#api)**

#### `onsuccess`
The `onsuccess` hook is a promise-aware action which is called when the [`onsubmit`](#onsubmit) hook is fulfilled.

``` hbs
{{#fit-form model onsuccess=(action success) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
success(/* result, form */) {
  // Do something
}
```

**[⬆️ back to top](#api)**

#### `onerror`
The `onerror` hook is a promise-aware action which is called when the [`onsubmit`](#onsubmit) hook is rejected.

``` hbs
{{#fit-form model onerror=(action error) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
error(/* error, form */) {
  // Do something
}
```

**[⬆️ back to top](#api)**

#### `oncancel`
The `oncancel` hook is a promise-aware action which is called on form cancellation.
Form cancellation is triggered when calling `form.cancel()`.

``` hbs
{{#fit-form model oncancel=(action rollback) as |form|}}
  <button {{form.cancel}}>Cancel</button>
{{/fit-form}}
```

``` javascript
rollback(/* form */) {
  return model.rollback();
}
```

**[⬆️ back to top](#api)**

#### `onvalidate`
The `onvalidate` hook is a promise-aware action which is called on form validation.
Form validation is triggered when calling `form.validate()` or `form.submit()`
On form submission, if `onvalidate` returns a rejected `Promise` or
`false`, the submission will reject, and `onsubmit` will not be called.

``` hbs
{{#fit-form model onvalidate=(action validate) as |form|}}
  <button {{form.validate}}>Check Fields</button>
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
validate(/* form */) {
  return model.validate();
}
```

**[⬆️ back to top](#api)**

#### `oninvalid`
The `oninvalid` hook is a promise-aware action which is called when the [`onvalidate`](#onvalidate) hook is rejected or returns `false`.

``` hbs
{{#fit-form model oninvalid=(action invalid) as |form|}}
  <button {{form.submit}}>Save</button>
{{/fit-form}}
```

``` javascript
invalid(/* error, form */) {
  // Do something
}
```

**[⬆️ back to top](#api)**

### Fit-Form Component Event Handler Hooks
------------------------------------------------------------------------------

The `form` object is always curried in as the last argument for all
component event handler hooks.

#### `onkeydown`
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
  } else if (event.key === "Escape") {
    form.cancel();
  }
}
```

> `return true;` to bubble the event. This is useful if you still want the form to handle the [submit event](https://developer.mozilla.org/en-US/docs/Web/Events/submit).

**[⬆️ back to top](#api)**

#### `onkeyup`
When `onkeyup` is passed into `fit-form` component, it registers the
`keyUp` event on the html form element. The `onkeyup` hook is called when
the `keyUp` event is triggered.

See [`onkeydown`](#onkeydown) example for usage.

**[⬆️ back to top](#api)**

#### `onkeypress`
When `onkeypress` is passed into `fit-form` component, it registers the
`keyPress` event on the html form element. The `onkeypress` hook is called when
the `keyPress` event is triggered.

See [`onkeydown`](#onkeydown) example for usage.

**[⬆️ back to top](#api)**

### Fit-Form Attributes
------------------------------------------------------------------------------

#### `isUnsubmittable`
Returns a Boolean value of the form's (un)submittability.

```js
form.get('isUnsubmittable'); // true
```

```hbs
<button {{action form.submit}} disabled={{form.isUnsubmittable}}>Submit</button>
```

> You can still call [`submit`](#submit) if `isUnsubmittable` is true.

**[⬆️ back to top](#api)**

#### `isSubmittable`
Returns a Boolean value of the form's submittability.

```js
form.get('isSubmittable'); // true
```

```hbs
{{#if form.isSubmittable}}
  <span class=fa fa-check'></span>
{{/if}}
```

**[⬆️ back to top](#api)**

#### `isValid`
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

**[⬆️ back to top](#api)**

#### `isInvalid`
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

**[⬆️ back to top](#api)**

#### `isDirty`
Returns a Boolean value of the form's state. A dirty form is one with
changes.

```js
form.get('isDirty'); // true
```

**[⬆️ back to top](#api)**

#### `isPristine`
Returns a Boolean value of the form's state. A pristine form is one
with no changes.

```js
form.get('isPristine'); // true
```

**[⬆️ back to top](#api)**

#### `isCancelling`
Returns a Boolean value of the form's cancelling state. A cancelling
form is one where the `oncancel` hook is pending. This attribute is
commonly coupled with the [`cancel`](#cancel) action.

```js
form.get('isCancelling'); // true
```

``` hbs
<button {{action form.cancel}} disabled={{form.isCancelling}}>Cancel</button>
```

**[⬆️ back to top](#api)**

#### `isSubmitting`
Returns a Boolean value of the form's submitting state. A submitting
form is one where the `onsubmit`, `onsuccess`, or `onerror` hooks are
pending. This attribute is commonly coupled with the [`submit`](#submit) action.

```js
form.get('isSubmitting'); // true
```

``` hbs
<button {{action form.submit}} disabled={{form.isSubmitting}}>Submit</button>
```

**[⬆️ back to top](#api)**

#### `isValidating`
Returns a Boolean value of the form's validating state. A validating form is one where the form's model(s) are validating upon form submission.

```js
form.get('isValidating'); // true
```

``` hbs
{{#if form.isValidating}}
  <span class=fa fa-spinner></span>
{{/if}}
```

**[⬆️ back to top](#api)**

#### `didCancel`
Returns a Boolean value of the form's cancelled state. A cancelled form is one where the [`oncancel`](#oncancel) hooks is settled.

```js
form.get('didSubmit'); // true
```

``` hbs
{{#if form.didSubmit}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```

**[⬆️ back to top](#api)**

#### `didSubmit`
Returns a Boolean value of the form's submitted state. A submitted form is one where the [`onsubmit`](#onsubmit) hooks is settled.

```js
form.get('didSubmit'); // true
```

``` hbs
{{#if form.didSubmit}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```

**[⬆️ back to top](#api)**

#### `didValidate`
Returns a Boolean value of the form's validated state. A validated form is one where the form's model(s) were validated upon form submission.

```js
form.get('didValidate'); // true
```

``` hbs
{{#if form.didValidate}}
  <span class='error'>{{model.errors}}</span>
{{/if}}
```

**[⬆️ back to top](#api)**

### Custom Adapters
------------------------------------------------------------------------------

Generate a form adapter
> $ ember generate form-adapter foo-bar

This creates `app/form-adapters/foo-bar.js` and a unit test at `tests/unit/form-adapters/foo-bar-test.js`. By default, the form-adapter extends the `base` adapter. 

#### Example - extend `ember-changeset` form-adapter

In this example, we'll extend the `ember-changeset` form-adapter. We will overwrite the default `oncancel` action to never call `rollbackAttributes()` on the Changesets.

- Generate `form-adapter`
  > ember g form-adapter ember-changeset/no-rollbacks

- Extend the `ember-changeset` `form-adapter`
  ``` js
  // app/form-adapters/ember-changeset/no-rollbacks;
  import EmberChangesetAdapter from 'ember-fit-form/form-adapters/ember-changeset';
  export default EmberChangesetAdapter.extend({
    oncancel() { /* noop - ie. no rollbackAttributes */ }
  });
  ```

- Define adapter on component or [configuration](#configuration)
  ```hbs
  {{!-- my-template.hbs --}}
  {{#fit-form changeset adapter="ember-changeset/no-rollbacks"}}
    {{!-- other form content --}}
  {{/fit-form}}
  ```

