import Component from '@ember/component';
import layout from '../templates/components/fit-form';

import { A, makeArray } from '@ember/array';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Wraps a native `<form>` element and provides abstractions for working with models and model validations.
 */
function flat(arr) {
  return [].concat(...arr);
}
function compact(arr) {
  return arr.filter((v) => v != null);
}
function flattenAndCompact(o) {
  return A(compact(flat(makeArray(o))));
}

const FitFormComponent = Component.extend({
  fitForm: service(),

  layout,

  tagName: '',

  // ---------------------- Component Hooks ----------------------
  /**
   * @method onsubmit - Handler for the form's submit behavior. `onsubmit` will be called when
   * the form is submitted with a valid model.
   * @param FitForm - public interface for the `fit-form` component
   */
  onsubmit: undefined,

  /**
   * @method onsuccess - Handler for when `onsubmit` succeeds, called when
   * `onsubmit` returns anything other than a rejected Promise
   * @param result - result returned from `onsubmit`
   * @param form - public interface for the `fit-form` component
   */
  onsuccess: undefined,

  /**
   * @method onerror - Handler for errors resulting from the `onsubmit` action, called when
   * `onsubmit` returns a rejected Promise
   * @param error - error returned from rejected `onsubmit` promise
   * @param form - public interface for the `fit-form` component
   */
  onerror: undefined,

  /**
   * @method oncancel - Handler for the form's cancel behavior. `oncancel` will be called when
   * the form is cancelled
   * @param form - public interface for the `fit-form` component
   */
  oncancel: undefined,

  onvalidate: undefined,
  oninvalid: undefined,

  init() {
    this._super(...arguments);
    this._registerKeyboardEvents();
  },

  actions: {
    handleSubmit(event) {
      event.preventDefault();
      this.formObject.submit(...arguments);
    },
  },

  formObject: computed('models.[]', 'adapter', function () {
    const Adapter = this.fitForm.lookupAdapter(this.adapter);
    const modelArray = flattenAndCompact(this.models);

    const hooks = [
      'oncancel',
      'onerror',
      'oninvalid',
      'onsubmit',
      'onsuccess',
      'onvalidate',
    ].reduce((result, actionName) => {
      const action = this[actionName];
      if (action) {
        result[actionName] = action;
      }
      return result;
    }, {});

    const adapter = new Adapter({
      models: modelArray,
      ...hooks,
    });

    // Set the `adapter` as the `this` context for template actions, ie {{action form.submit}}
    adapter.cancel = adapter.cancel.bind(adapter);
    adapter.submit = adapter.submit.bind(adapter);
    adapter.validate = adapter.validate.bind(adapter);

    return adapter;
  }),

  _registerKeyboardEvents() {
    ['keyDown', 'keyUp', 'keyPress'].forEach((eventName) => {
      const method = this[`on${eventName.toLowerCase()}`];
      if (typeof method === 'function') {
        this[eventName] = function (...args) {
          method(...args, this.formObject);
        };
      }
    });
  },
});

FitFormComponent.reopenClass({
  positionalParams: 'models',
});

export default FitFormComponent;
