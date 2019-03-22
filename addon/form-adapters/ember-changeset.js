import BaseFormAdapter from './base';
import { all } from 'rsvp';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

/**
  A form-adapter object compatible with ember-changeset.

  @class EmberChangesetFormAdapter
  @export default
*/
export default BaseFormAdapter.extend({
  /**
   * An alias for `models`
   *
   *
   * @accessor changesets
   * @type {Boolean}
  */
  changesets: readOnly('models'),

  /**
   * Returns a Boolean value of the form's state. A dirty form is one with changes.
   *
   * default:
   * Returns true if `changeset.isDirty` is `true` for any changeset.
   *
   * @accessor isDirty
   * @type {Boolean}
  */
  isDirty: computed('changesets.@each.isDirty', function() {
    return this.get('changesets').some(c => c.get('isDirty'));
  }),

  /**
   * Returns a Boolean value of the form's state. A dirty form is one with changes.
   *
   * default:
   * Returns true if `changeset.isInvalid` is `true` for any changeset.
   *
   * @accessor isInvalid
   * @type {Boolean}
  */
  isInvalid: computed('changesets.@each.isInvalid', function() {
    return this.get('changesets').some(c => c.get('isInvalid'));
  }),

  /**
   * Handler for the form's cancel behavior.
   *
   * default:
   * Calls `changeset.rollback()` on each changeset.
   *
   * @method oncancel
   * @return {undefined}
  */
  oncancel(){
    const form = arguments[arguments.length - 1];
    const changesets = form.get('changesets');
    changesets.forEach(c => c.rollback());
  },

  /**
   * Handler for the form's submit behavior.
   *
   * default:
   * Calls `changeset.save()` on each changeset.
   * Returns a promise array of all saving changesets.
   *
   * @method onsubmit
   * @return {Promise}
  */
  onsubmit(){
    const form = arguments[arguments.length - 1];
    const changesets = form.get('changesets');
    const submitting = changesets.map(c => c.save());
    return all(submitting);
  },

  /**
   * Handler for the form's validate behavior.
   *
   * default:
   * Calls `changeset.validate()` on each changeset.
   * Returns a promise array of all validating changesets, which then resolves to a Boolean value of the form's validity after validation is fulfilled.
   *
   * @method onvalidate
   * @return {Promise}
  */
  onvalidate(){
    const form = arguments[arguments.length - 1];
    const changesets = form.get('changesets');
    const validating = changesets.map(c => c.validate());

    return all(validating).then(() => {
      return form.get('isValid');
    });
  }
});
