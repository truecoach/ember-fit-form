import { or, readOnly, not } from '@ember/object/computed';
import emberObject from '@ember/object';

import { all } from 'rsvp';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';
import { task } from 'ember-concurrency';

const Base = emberObject.extend({
  models: undefined,

  onCancel(){},
  onError(){},
  onSubmit(){},
  onSuccess(){},

  // ---------------------- Form State ----------------------
  didCancel: or('cancelTask.last.{isError,isSuccessful}'),
  didSubmit: or('submitTask.last.{isError,isSuccessful}'),
  didValidate: or('validateTask.last.{isError,isSucccessful}'),

  isCancelling: readOnly('cancelTask.isRunning'),
  isSubmitting: readOnly('submitTask.isRunning'),
  isValidating: readOnly('validateTask.isRunning'),

  isInvalid: computed('models.@each.validations', function() {
    return this.get('models').some(m => m.get('validations.isInvalid'));
  }),
  isValid: not('isInvalid'),

  isDirty: computed('models.@each.hasDirtyAttributes', function() {
    return this.get('models').some(c => c.get('hasDirtyAttributes'));
  }),
  isPristine: not('isDirty'),

  isSubmittable: not('isUnsubmittable'),
  isUnsubmittable: or('isPristine', 'isInvalid', 'isSubmitting', 'isCancelling'),

  cancel() { return this.get('cancelTask').perform(...arguments); },
  submit() { return this.get('submitTask').perform(...arguments); },
  validate() { return this.get('validateTask').perform(...arguments); },

  cancelTask: task(function * () {
    return yield this.cancelAction(...arguments);
  }),
  submitTask: task(function * () {
    return yield this.submitAction(...arguments);
  }),
  validateTask: task(function * () {
    return yield this.validateAction(...arguments);
  }),

  cancelAction() {
    return this.get('onCancel')(...arguments, this);
  },

  submitAction(...args) {
    return this.validate().then(() => {
      if (this.get('isValid')) {
        const submission = this.get('onSubmit')(...args, this);
        return resolve(submission).then((...args) => {
          return this.get('onSuccess')(...args, this);
        }, (...args) => {
          return this.get('onError')(...args, this);
        });
      }
    });
  },

  validateAction() {
    const models = this.get('models');
    const validating = models
          .filter(m => typeof m.validate === "function")
          .map(m => m.validate());

    return all(validating);
  }
});

export default Base;
