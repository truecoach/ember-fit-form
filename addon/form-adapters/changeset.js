import Base from './base';
import { computed } from '@ember/object';

const Changeset = Base.extend({
  changesets: computed.readOnly('models'),

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

export default Changeset;
