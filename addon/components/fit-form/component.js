import Component from '@ember/component';
import layout from './template';

import { A as emberArray, makeArray } from '@ember/array';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

/**
 * Wraps a native `<form>` element and provides abstractions for working with models andmodel-validations.
 *
 * `onSubmit` will be called when the form is submitted with a valid model.
 * @class Ember.FitFormComponent
 * @extends Ember.Component
 */

const FitFormComponent = Component.extend({
  fitFormService: inject('fit-form'),

  layout,

  tagName: 'form',

  adapterName: "ember-changeset",

  // ---------------------- Component Hooks ----------------------
  /**
   * @method onSubmit - Handler for the form's submit behavior. `onSubmit` will be called when
   * the form is submitted with a valid model.
   * @param FitForm - public interface for the `fit-form` component
   */
  onSubmit(){},

  /**
   * @method onSuccess - Handler for when `onSubmit` succeeds, called when
   * `onSubmit` returns anything other than a rejected Promise
   * @param FitForm - public interface for the `fit-form` component
   * @param result - result returned from `onSubmit`
   */
  onSuccess(){},

  /**
   * @method onError - Handler for errors resulting from the `onSubmit` action, called when
   * `onSubmit` returns a rejected Promise
   * @param FitForm - public interface for the `fit-form` component
   * @param error - error returned from rejected `onSubmit` promise
   */
  onError(){},

  /**
   * @method onCancel - Handler for the form's cancel behavior. `onCancel` will be called when
   * the form is cancelled
   * @param FitForm - public interface for the `fit-form` component
   */
  onCancel(){},

  init() {
    this._super(...arguments);
    this._registerKeyboardEvents();
  },

  // Form Events
  submit(event) {
    event.preventDefault();
    this.get('formObject').submit(...arguments);
  },

  formObject: computed('models.[]', 'adapterName', function() {
    const Adapter = this.get('fitFormService').lookupAdapter(this.get('adapterName'));
    const emberModelArray = emberArray(makeArray(this.get('models')));

    const adapter = Adapter.create({
      models: emberModelArray,
      onCancel: this.get('onCancel'),
      onError: this.get('onError'),
      onSubmit: this.get('onSubmit'),
      onSuccess: this.get('onSuccess')
    });

    // Set the `adapter` as the `this` context for template actions, ie {{action form.submit}}
    adapter.setProperties({
      cancel: adapter.cancel.bind(adapter),
      submit: adapter.submit.bind(adapter),
      validate: adapter.validate.bind(adapter)
    });

    return adapter;
  }),

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
