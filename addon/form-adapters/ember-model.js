import BaseFormAdapter from './base';
import { all } from 'rsvp';
import { computed, get } from '@ember/object';

/**
  A form-adapter object compatible with ember-data models.

  @class EmberModelFormAdapter
  @export default
*/
export default BaseFormAdapter.extend({
  _validations: computed.mapBy('models', 'validations'),


  /**
   * Returns a Boolean value of the form's state. A dirty form is one with changes.
   *
   * Returns true if `model.hasDirtyAttributes` is `true` for any model.
   *
   * @accessor isDirty
   * @type {Boolean}
  */
  isDirty: computed('models.@each.hasDirtyAttributes', function() {
    return this.get('models').some(m => m.get('hasDirtyAttributes'));
  }),

  /**
   * Returns a Boolean value of the form's state. A dirty form is one with changes.
   *
   * Returns true if `model.validations.isInvalid` is `true` for any model.
   *
   * @accessor isInvalid
   * @type {Boolean}
  */
  isInvalid: computed('_validations.@each.isInvalid', function() {
    const validations = this.get('_validations');
    return validations.some(v => get(v || {}, 'isInvalid'));
  }),

  /**
   * Handler for the form's cancel behavior.
   * Calls `model.rollbackAttributes()` on each model.
   *
   * @method oncancel
   * @return {undefined}
  */
  oncancel(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    models.forEach(m => m.rollbackAttributes());
  },

  /**
   * Handler for the form's submit behavior.
   * Calls `model.save()` on each model.
   * Returns a promise array of all saving models.
   *
   * @method onsubmit
   * @return {Promise}
  */
  onsubmit(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    const submitting = models.map(m => m.save());
    return all(submitting);
  },

  /**
   * Handler for the form's validate behavior.
   * Calls `model.validate()` on each model.
   * Returns a promise array of all validating models.
   *
   * @method onvalidate
   * @return {Promise}
  */
  onvalidate(){
    const form = arguments[arguments.length - 1];
    const models = form.get('models');
    const validating = models
          .filter(m => typeof m.validate === "function")
          .map(m => m.validate());

    return all(validating);
  }
});
