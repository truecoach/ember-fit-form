import BaseAdapter from './base';
import { all } from 'rsvp';

export default class EmberModelAdapter extends BaseAdapter {
  get isDirty() {
    return this.models.some((c) => c.get('hasDirtyAttributes'));
  }

  get isInvalid() {
    return this.models.some((model) => model.get('validations.isInvalid'));
  }

  oncancel() {
    const form = arguments[arguments.length - 1];
    form.models.forEach((m) => m.rollbackAttributes());
  }

  onsubmit() {
    const form = arguments[arguments.length - 1];
    const submitting = form.models.map((m) => m.save());
    return all(submitting);
  }

  onvalidate() {
    const form = arguments[arguments.length - 1];
    const validating = form.models
      .filter((m) => typeof m.validate === 'function')
      .map((m) => m.validate());

    return all(validating);
  }
}
