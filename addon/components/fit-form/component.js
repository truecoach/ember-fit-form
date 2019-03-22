import Component from '@ember/component';
import layout from './template';

import { A as emberArray, makeArray } from '@ember/array';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

/**
 * A component which wraps a native `<form>` element and provides abstractions for working with models and model validations. Usage:
 *
 * ```hbs
 * {{#fit-form model
 *  adapter="ember-changeset"
 *
 *  oncancel=(action oncancel)
 *  onerror=(action onerror)
 *  oninvalid=(action oninvalid)
 *  onsubmit=(action onsubmit)
 *  onsuccess=(action onsuccess)
 *  onvalidate=(action onvalidate)
 *
 *  onkeydown=(action onkeydown)
 *  onkeypress=(action onkeypress)
 *  onkeyup=(action onkeyup)
 *
 * as |form|}}
 *
 * {{/fit-form}}
 *  ```
 *
 * @class FitForm Component
 * @argument [...Objects] models
 * @yield {Object} form The form-adapter instance
 */
const FitFormComponent = Component.extend({
  fitFormService: inject('fit-form'),

  layout,

  tagName: 'form',

  /**
   * Model[s] used to determine validity, dirtiness and submittability of the form
   *
   * @argument models
   * @type Object|Array
   * @default null
   */
  models: null,

  /**
   * The name of the form-adapter to use for this component
   *
   * @argument adapter
   * @type String
   * @default ''
   */
  adapter: '',

  // ---------------------- Component Hooks ----------------------
  /**
   * Handler for the form's submit behavior. `onsubmit` is a promise-aware action which is called on form submission. Form submission is triggered when calling form.submit() with a valid form.
   *
   * ``` hbs
   * {{#fit-form model onsubmit=(action save) as |form|}}
   *   <button {{form.submit}}>Save</button>
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * save(form) {
   *   return model.save();
   * }
   *
   * @argument onsubmit
   * @type Function
   * @param form {FormAdapter}
   * @return {Promise}
   * @default undefined
   *
  */
  onsubmit: undefined,

  /**
   * The onsuccess hook is a promise-aware action which is called when the [onsubmit](#onsubmit) hook is fulfilled.
   *
   * ``` hbs
   * {{#fit-form model onsuccess=(action success) as |form|}}
   *
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * success(result, form) {
   *   this.notify.success('Saved!');
   * }
   * ```
   *
   * @argument onsuccess
   * @type Function
   * @param result {Object} the resolved return value of the `onsubmit` hook
   * @param form {FormAdapter}
   * @default undefined
   * @return {Promise}
  */
  onsuccess: undefined,

  /**
   * Handler for when `onsubmit` is rejected. `onerror` is a promise-aware action which is called when the [onsubmit](#onsubmit) hook is rejected.
   *
   * ``` hbs
   * {{#fit-form model onerror=(action error) as |form|}}
   *
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * error(e, form) {
   *   this.notify.error(e.message);
   * }
   * ```
   *
   * @argument onerror
   * @type Function
   * @param error {Object} the rejected return value of the `onsubmit` hook
   * @param form {FormAdapter}
   * @return {Promise}
   * @default undefined
  */
  onerror: undefined,

  /**
   * Handler for the form's cancel behavior. The `oncancel` hook is a promise-aware action which is called on form cancellation. Form cancellation is triggered when calling `form.cancel()`.
   *
   * ``` hbs
   * {{#fit-form model oncancel=(action cancel) as |form|}}
   *   <button {{form.cancel}}>Cancel</button>
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * cancel(form) {
   *   return model.rollbackAttributes();
   * }
   * ```
   *
   * @argument oncancel
   * @type Function
   * @param form {FormAdapter}
   * @default undefined
  */
  oncancel: undefined,

  /**
   * Handler for the form's validate behavior. `onvalidate` is a promise-aware action which is called on form validation. Form validation is triggered when calling `form.validate()` or `form.submit()`.
   * On form submission, if `onvalidate` returns a rejected Promise or false, the submission will reject, and `onsubmit` will not be called.
   *
   *
   * ``` hbs
   * {{#fit-form model onvalidate=(action validate) as |form|}}
   *   <button {{form.validate}}>Validate</button>
   *   <button {{form.submit}}>Save</button>
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * validate(form) {
   *   return model.validate();
   * }
   * ```
   *
   * @argument onvalidate
   * @type Function
   * @param form {FormAdapter}
   * @default undefined
  */
  onvalidate: undefined,

  /**
   * Handler for when `onvalidate` is rejected or returns false
   *
   * ``` hbs
   * {{#fit-form model oninvalid=(action invalid) as |form|}}
   *   <button {{form.validate}}>Validate</button>
   *   <button {{form.submit}}>Save</button>
   * {{/fit-form}}
   * ```
   *
   * ``` javascript
   * invalid(e, form) {
   *   this.notify.warning(e.message);
   * }
   * ```
   * @argument oninvalid
   * @type Function
   * @param error {Object} the rejected return value of the `onvalidate` hook
   * @param form {FormAdapter}
   * @default undefined
  */
  oninvalid: undefined,

  /**
   * The `init` hook registers event handlers
   *
   * @method init
   */
  init() {
    this._super(...arguments);
    this._registerKeyboardEvents();
  },


  /**
   * The submit event fires when a `<form>` is submitted. When the submit event is raised, it calls `form.submit()` directly.
   *
   * The submit event fires when the user clicks a submit button (`<button>` or `<input type="submit">`) in a form.
   * The submit event is not raised when calling the form.submit() method directly.
   *
   * [Web APIs | MDN - GlobalEventHandlers.onsubmit](https://developer.mozilla.org/en-US/docs/Web/Events/submit)
   *
   * @method submit
   * @param {Event} event
   */
  submit(event) {
    event.preventDefault();
    this.get('formObject').submit(...arguments);
  },

  /**
   * The form-adapter instance which we `{{yield}}` in the template
   *
   * @property formObject
   * @type {FormAdapter}
  */
  formObject: computed('models.[]', 'adapter', function() {
    const Adapter = this.get('fitFormService').lookupAdapter(this.get('adapter'));
    const emberModelArray = emberArray(makeArray(this.get('models')));

    const hooks = [
      'oncancel', 'onerror', 'oninvalid', 'onsubmit', 'onsuccess', 'onvalidate'
    ].reduce((result, actionName) => {
      const action = this.get(actionName);
      if (action) { result[actionName] = action; }
      return result;
    }, {});

    const adapter = Adapter.create({
      models: emberModelArray,
      ...hooks
    });

    // Set the `adapter` as the `this` context for template actions, ie {{action form.submit}}
    adapter.setProperties({
      cancel: adapter.cancel.bind(adapter),
      submit: adapter.submit.bind(adapter),
      validate: adapter.validate.bind(adapter)
    });

    return adapter;
  }),

  /**
   * Conditionally registers key events if `onkeyevent` argument is passed into the component
   *
   * The example below will register the `keyDown` event handler and call `onkeydown` when the `keyDown` event is raised.
   *
   * ```hbs
   * {{#fit-form model
   *  onkeydown=(action onkeydown)
   * as |form|}}
   *
   * {{/fit-form}}
   *  ```
   *
   * @method _registerKeyboardEvents
   * @private
  */
  _registerKeyboardEvents() {
    const eventNames = ['keyDown','keyUp','keyPress'];
    eventNames.forEach(eventName => {
      const method = this[`on${eventName.toLowerCase()}`];
      if (typeof method === 'function') {
        this[eventName] = function(...args){
          method(...args, this.get('formObject'));
        };
      }
    });
  }
});

FitFormComponent.reopenClass({
  positionalParams: 'models'
});

export default FitFormComponent;
