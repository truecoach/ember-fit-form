import emberObject from '@ember/object';

import { not, or, readOnly } from '@ember/object/computed';
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

const Base = emberObject.extend({
  models: undefined,

  oncancel(){},
  onerror(){},
  oninvalid(){},
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

  cancel() {
    return this.get('cancelTask').perform(...arguments);
  },
  submit() {
    return this.get('submitTask').perform(...arguments).then((val) => {
      this.get('onsuccess')(val, this);
    }).catch((e) => {
      if (this.get('validateTask.last.isSuccessful')) {
        this.get('onerror')(e, this);
      }
    });
  },
  validate() {
    return this.get('validateTask').perform(...arguments).catch((e) => {
      this.get('oninvalid')(e, this);
    });
  },

  cancelTask: task(function * () {
    return yield this.get('oncancel')(...arguments, this);
  }),

  submitTask: task(function * () {
    // validate the form
    yield this.validate();

    // reject if validation failed
    if (this.get('validateTask.last.isError')) {
      return reject();
    }

    // submit the form
    return yield this.get('onsubmit')(...arguments, this);
  }),

  validateTask: task(function * () {
    // validate the form
    const validation = yield this.get('onvalidate')(...arguments, this);

    // reject validation if return value is false
    if (validation === false) {
      return reject();
    }

    return validation;
  })
});

export default Base;
