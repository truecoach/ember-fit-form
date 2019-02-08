import Base from './base';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

const EmberChangesetAdapter = Base.extend({
  changesets: readOnly('models'),

  isDirty: computed('changesets.@each.isDirty', function() {
    return this.get('changesets').some(c => c.get('isDirty'));
  }),

  isInvalid: computed('changesets.@each.isInvalid', function() {
    return this.get('changesets').some(c => c.get('isInvalid'));
  }),

  cancelAction() {
    this.get('changesets').forEach(c => c.rollback());
    return this._super(...arguments);
  }
});

export default EmberChangesetAdapter;
