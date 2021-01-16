import BaseAdapter from './base';
import { all } from 'rsvp';

export default class EmberChangesetAdapter extends BaseAdapter {
  get changesets() {
    return this.models;
  }

  get isDirty() {
    return this.changesets.some((c) => c.get('isDirty'));
  }

  get isInvalid() {
    return this.changesets.some((c) => c.get('isInvalid'));
  }

  oncancel() {
    const form = arguments[arguments.length - 1];
    form.changesets.forEach((c) => c.rollback());
  }

  onsubmit() {
    const form = arguments[arguments.length - 1];
    const submitting = form.changesets.map((c) => c.save());
    return all(submitting);
  }

  onvalidate() {
    const form = arguments[arguments.length - 1];
    const validating = form.changesets.map((c) => c.validate());

    return all(validating).then(() => {
      return form.isValid;
    });
  }
}
