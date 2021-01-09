import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

export default class BaseAdapter {
  constructor(options) {
    super.constructor(...arguments);
    this.models = options.models;
    this.oncancel = options.oncancel || this.oncancel;
    this.onerror = options.onerror || this.onerror;
    this.oninvalid = options.oninvalid || this.oninvalid;
    this.onsubmit = options.onsubmit || this.onsubmit;
    this.onsuccess = options.onsuccess || this.onsuccess;
    this.onvalidate = options.onvalidate || this.onvalidate;

    this.cancel = this.cancel.bind(this);
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
  }

  oncancel() {}
  onerror() {}
  oninvalid() {}
  onsubmit() {}
  onsuccess() {}
  onvalidate() {}

  // ---------------------- Form State ----------------------

  get isDirty() {
    return false;
  }

  get isInvalid() {
    return false;
  }

  get didCancel() {
    return this.cancelTask.last?.isError || this.cancelTask.last?.isSucccessful;
  }

  get didSubmit() {
    return this.submitTask.last?.isError || this.submitTask.last?.isSucccessful;
  }

  get didValidate() {
    return (
      this.validateTask.last?.isError || this.validateTask.last?.isSucccessful
    );
  }

  get isCancelling() {
    return this.cancelTask.isRunning;
  }

  get isSubmitting() {
    return this.submitTask.isRunning;
  }

  get isValidating() {
    return this.validateTask.isRunning;
  }

  get isValid() {
    return !this.isInvalid;
  }

  get isPristine() {
    return !this.isDirty;
  }

  get isUnsubmittable() {
    return (
      this.isPristine ||
      this.isInvalid ||
      this.isSubmitting ||
      this.isCancelling
    );
  }

  get isSubmittable() {
    return !this.isUnsubmittable;
  }

  // ---------------------- Form Methods ----------------------
  cancel() {
    return this.cancelTask.perform(...arguments);
  }

  submit() {
    return this.submitTask
      .perform(...arguments)
      .then((val) => {
        this.onsuccess(val, this);
      })
      .catch((e) => {
        if (this.validateTask?.last?.isSuccessful) {
          this.onerror(e, this);
        }
      });
  }

  validate() {
    return this.validateTask.perform(...arguments).catch((e) => {
      this.oninvalid(e, this);
    });
  }

  @task(function* () {
    return yield this.oncancel(...arguments, this);
  })
  cancelTask;

  @task(function* () {
    yield this.validate();

    if (this.validateTask?.last?.isError) {
      return reject();
    }

    return yield this.onsubmit(...arguments, this);
  })
  submitTask;

  @task(function* () {
    const validation = yield this.onvalidate(...arguments, this);

    if (validation === false) {
      return reject();
    }

    return validation;
  })
  validateTask;
}
