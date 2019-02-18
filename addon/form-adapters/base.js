import emberObject from '@ember/object';

import { not, or, readOnly } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { task } from 'ember-concurrency';

const Base = emberObject.extend({
  models: undefined,

  oncancel(){},
  onerror(){},
  onsubmit(){},
  onsuccess(){},
  onvalidate(){},

  // ---------------------- Form State ----------------------
  didCancel: or('cancelTask.last.{isError,isSuccessful}'),
  didSubmit: or('submitTask.last.{isError,isSuccessful}'),
  didValidate: or('validateTask.last.{isError,isSucccessful}'),

  isCancelling: readOnly('cancelTask.isRunning'),
  isSubmitting: readOnly('submitTask.isRunning'),
  isValidating: readOnly('validateTask.isRunning'),

  isInvalid: false,
  isValid: not('isInvalid'),

  isDirty: false,
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
    return this.get('oncancel')(...arguments, this);
  },

  submitAction(...args) {
    const validation = this.validate();
    return resolve(validation).then(() => {
      const submission = this.get('onsubmit')(...args, this);
      return resolve(submission).then((...args) => {
        return this.get('onsuccess')(...args, this);
      }, (...args) => {
        return this.get('onerror')(...args, this);
      });
    });
  },

  validateAction() {
    return this.get('onvalidate')(...arguments, this);
  }
});

export default Base;
